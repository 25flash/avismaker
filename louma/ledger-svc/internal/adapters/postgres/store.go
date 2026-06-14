// Package postgres implements the app.Store / app.RepoTx ports against
// PostgreSQL using pgx.
package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"louma/ledger-svc/internal/app"
)

// Store is a pgxpool-backed implementation of app.Store.
type Store struct {
	pool *pgxpool.Pool
}

// NewStore wraps an existing pgxpool.Pool.
func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

// WithTx runs fn within a single Postgres transaction, committing on success
// and rolling back if fn returns an error (RAT §3.3).
func (s *Store) WithTx(ctx context.Context, fn func(app.RepoTx) error) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}

	if err := fn(&repoTx{tx: tx}); err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil && !errors.Is(rbErr, pgx.ErrTxClosed) {
			return fmt.Errorf("%w (rollback failed: %v)", err, rbErr)
		}
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit tx: %w", err)
	}
	return nil
}
