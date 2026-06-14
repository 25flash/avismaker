package app

import (
	"context"

	"louma/ledger-svc/internal/domain"
)

// Store opens a unit-of-work for the duration of fn. Implementations MUST
// run fn within a single database transaction and roll back on error
// (RAT §3.3 — outbox/idempotence pattern relies on this).
type Store interface {
	WithTx(ctx context.Context, fn func(RepoTx) error) error
}

// RepoTx is the set of operations available within a unit-of-work.
type RepoTx interface {
	CreateAccount(ctx context.Context, a domain.Account) error
	GetAccount(ctx context.Context, id string) (domain.Account, error)
	// LockAccount reads an account with a row-level lock (SELECT ... FOR UPDATE)
	// to serialize concurrent transfers touching the same account.
	LockAccount(ctx context.Context, id string) (domain.Account, error)
	UpdateBalance(ctx context.Context, id string, newBalance int64) error
	AppendEntries(ctx context.Context, entries []domain.LedgerEntry) error
	FindTransactionByIdemKey(ctx context.Context, idemKey string) (*domain.Transaction, error)
	InsertTransaction(ctx context.Context, tx domain.Transaction) error
	NextAccountSeq(ctx context.Context) (int64, error)
}
