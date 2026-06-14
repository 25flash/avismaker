package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"louma/ledger-svc/internal/domain"
)

// repoTx implements app.RepoTx for the duration of a single pgx.Tx.
type repoTx struct {
	tx pgx.Tx
}

func (r *repoTx) NextAccountSeq(ctx context.Context) (int64, error) {
	var seq int64
	err := r.tx.QueryRow(ctx,
		`UPDATE account_seq SET value = value + 1 WHERE id = 1 RETURNING value`,
	).Scan(&seq)
	return seq, err
}

func (r *repoTx) CreateAccount(ctx context.Context, a domain.Account) error {
	_, err := r.tx.Exec(ctx,
		`INSERT INTO accounts (id, tenant_id, rib, currency, status, type, balance, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		a.ID, a.TenantID, a.RIB, a.Currency, a.Status, a.Type, a.Balance, a.CreatedAt,
	)
	return err
}

func (r *repoTx) GetAccount(ctx context.Context, id string) (domain.Account, error) {
	return r.scanAccount(ctx,
		`SELECT id, tenant_id, rib, currency, status, type, balance, created_at
		 FROM accounts WHERE id = $1`, id)
}

// LockAccount reads an account with a row-level lock (SELECT ... FOR UPDATE)
// to serialize concurrent transfers touching the same account.
func (r *repoTx) LockAccount(ctx context.Context, id string) (domain.Account, error) {
	return r.scanAccount(ctx,
		`SELECT id, tenant_id, rib, currency, status, type, balance, created_at
		 FROM accounts WHERE id = $1 FOR UPDATE`, id)
}

func (r *repoTx) scanAccount(ctx context.Context, query string, args ...any) (domain.Account, error) {
	var a domain.Account
	err := r.tx.QueryRow(ctx, query, args...).Scan(
		&a.ID, &a.TenantID, &a.RIB, &a.Currency, &a.Status, &a.Type, &a.Balance, &a.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Account{}, domain.ErrAccountNotFound
	}
	return a, err
}

func (r *repoTx) UpdateBalance(ctx context.Context, id string, newBalance int64) error {
	_, err := r.tx.Exec(ctx,
		`UPDATE accounts SET balance = $1 WHERE id = $2`, newBalance, id)
	return err
}

func (r *repoTx) AppendEntries(ctx context.Context, entries []domain.LedgerEntry) error {
	for _, e := range entries {
		id := e.ID
		if id == "" {
			id = uuid.NewString()
		}
		_, err := r.tx.Exec(ctx,
			`INSERT INTO ledger_entries (id, account_id, direction, currency, amount, tx_id)
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			id, e.AccountID, e.Direction, e.Amount.Currency, e.Amount.Amount, e.TxID,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *repoTx) FindTransactionByIdemKey(ctx context.Context, idemKey string) (*domain.Transaction, error) {
	var t domain.Transaction
	err := r.tx.QueryRow(ctx,
		`SELECT id, type, status, idempotency_key, source_account, dest_account, currency, amount, reference, created_at
		 FROM transactions WHERE idempotency_key = $1`, idemKey,
	).Scan(&t.ID, &t.Type, &t.Status, &t.IdempotencyKey, &t.SourceAccount, &t.DestAccount,
		&t.Amount.Currency, &t.Amount.Amount, &t.Reference, &t.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *repoTx) InsertTransaction(ctx context.Context, t domain.Transaction) error {
	_, err := r.tx.Exec(ctx,
		`INSERT INTO transactions (id, type, status, idempotency_key, source_account, dest_account, currency, amount, reference, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		t.ID, t.Type, t.Status, t.IdempotencyKey, t.SourceAccount, t.DestAccount,
		t.Amount.Currency, t.Amount.Amount, t.Reference, t.CreatedAt,
	)
	return err
}
