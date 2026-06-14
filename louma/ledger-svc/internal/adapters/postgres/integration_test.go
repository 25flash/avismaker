package postgres_test

import (
	"context"
	"os"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"

	"louma/ledger-svc/internal/adapters/postgres"
	"louma/ledger-svc/internal/app"
	"louma/ledger-svc/internal/domain"
)

// newTestStore connects to a local Postgres instance (started outside the
// test, see migrations/0001_init.sql) and truncates ledger tables so each
// test starts from a clean slate. Set LEDGER_TEST_DATABASE_URL to override
// the default DSN.
func newTestStore(t *testing.T) *postgres.Store {
	t.Helper()

	dsn := os.Getenv("LEDGER_TEST_DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://ledger:ledger@localhost:5432/ledger_test?sslmode=disable"
	}

	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		t.Skipf("no test database available: %v", err)
	}
	if err := pool.Ping(context.Background()); err != nil {
		t.Skipf("no test database available: %v", err)
	}

	if _, err := pool.Exec(context.Background(),
		`TRUNCATE ledger_entries, transactions, accounts RESTART IDENTITY CASCADE;
		 UPDATE account_seq SET value = 0 WHERE id = 1;`); err != nil {
		t.Fatalf("truncate tables: %v", err)
	}

	t.Cleanup(pool.Close)
	return postgres.NewStore(pool)
}

func TestOpenAccountAndGet(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()
	accounts := app.NewAccountService(store)

	acc, err := accounts.OpenAccount(ctx, app.OpenAccountCommand{
		TenantID: "tenant_1",
		Currency: "XOF",
	})
	if err != nil {
		t.Fatalf("OpenAccount: %v", err)
	}
	if acc.RIB == "" {
		t.Fatalf("expected a generated RIB")
	}
	if acc.Status != domain.AccountStatusActive {
		t.Fatalf("expected active account, got %s", acc.Status)
	}

	fetched, err := accounts.GetAccount(ctx, acc.ID)
	if err != nil {
		t.Fatalf("GetAccount: %v", err)
	}
	if fetched.ID != acc.ID || fetched.RIB != acc.RIB {
		t.Fatalf("fetched account mismatch: %+v vs %+v", fetched, acc)
	}
}

func TestGetAccountNotFound(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()
	accounts := app.NewAccountService(store)

	if _, err := accounts.GetAccount(ctx, "does-not-exist"); err != domain.ErrAccountNotFound {
		t.Fatalf("expected ErrAccountNotFound, got %v", err)
	}
}

func TestTransferMovesFundsAndIsIdempotent(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()
	accounts := app.NewAccountService(store)
	transfers := app.NewTransferService(store)

	src, err := accounts.OpenAccount(ctx, app.OpenAccountCommand{TenantID: "t1", Currency: "XOF"})
	if err != nil {
		t.Fatalf("OpenAccount src: %v", err)
	}
	dst, err := accounts.OpenAccount(ctx, app.OpenAccountCommand{TenantID: "t1", Currency: "XOF"})
	if err != nil {
		t.Fatalf("OpenAccount dst: %v", err)
	}

	// Credit the source account directly via a transfer from a third funded
	// account would be circular; instead seed via a transfer is not
	// possible since balances start at 0. Use the repo directly to seed.
	if err := store.WithTx(ctx, func(repo app.RepoTx) error {
		return repo.UpdateBalance(ctx, src.ID, 10000)
	}); err != nil {
		t.Fatalf("seed balance: %v", err)
	}

	cmd := app.TransferCommand{
		IdempotencyKey: "idem-1",
		SourceAccount:  src.ID,
		DestAccount:    dst.ID,
		Amount:         domain.Money{Currency: "XOF", Amount: 2500},
		Reference:      "test transfer",
	}

	tx1, err := transfers.Transfer(ctx, cmd)
	if err != nil {
		t.Fatalf("Transfer: %v", err)
	}
	if tx1.Status != domain.TransactionSettled {
		t.Fatalf("expected settled transaction, got %s", tx1.Status)
	}

	srcAfter, err := accounts.GetAccount(ctx, src.ID)
	if err != nil {
		t.Fatalf("GetAccount src: %v", err)
	}
	dstAfter, err := accounts.GetAccount(ctx, dst.ID)
	if err != nil {
		t.Fatalf("GetAccount dst: %v", err)
	}
	if srcAfter.Balance != 7500 {
		t.Fatalf("expected src balance 7500, got %d", srcAfter.Balance)
	}
	if dstAfter.Balance != 2500 {
		t.Fatalf("expected dst balance 2500, got %d", dstAfter.Balance)
	}

	// Replaying with the same idempotency key must not move funds again.
	tx2, err := transfers.Transfer(ctx, cmd)
	if err != nil {
		t.Fatalf("Transfer (replay): %v", err)
	}
	if tx2.ID != tx1.ID {
		t.Fatalf("expected replay to return same transaction id, got %s vs %s", tx2.ID, tx1.ID)
	}

	srcAfterReplay, err := accounts.GetAccount(ctx, src.ID)
	if err != nil {
		t.Fatalf("GetAccount src: %v", err)
	}
	if srcAfterReplay.Balance != 7500 {
		t.Fatalf("expected balance unchanged after replay, got %d", srcAfterReplay.Balance)
	}
}

func TestTransferInsufficientFunds(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()
	accounts := app.NewAccountService(store)
	transfers := app.NewTransferService(store)

	src, _ := accounts.OpenAccount(ctx, app.OpenAccountCommand{TenantID: "t1", Currency: "XOF"})
	dst, _ := accounts.OpenAccount(ctx, app.OpenAccountCommand{TenantID: "t1", Currency: "XOF"})

	_, err := transfers.Transfer(ctx, app.TransferCommand{
		IdempotencyKey: "idem-2",
		SourceAccount:  src.ID,
		DestAccount:    dst.ID,
		Amount:         domain.Money{Currency: "XOF", Amount: 100},
	})
	if err != domain.ErrInsufficientFunds {
		t.Fatalf("expected ErrInsufficientFunds, got %v", err)
	}
}
