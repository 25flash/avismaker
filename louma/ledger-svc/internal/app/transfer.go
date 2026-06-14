package app

import (
	"context"
	"time"

	"github.com/google/uuid"

	"louma/ledger-svc/internal/domain"
)

type TransferService struct {
	store Store
}

func NewTransferService(store Store) *TransferService {
	return &TransferService{store: store}
}

type TransferCommand struct {
	IdempotencyKey string
	SourceAccount  string
	DestAccount    string
	Amount         domain.Money
	Reference      string
}

// Transfer posts a balanced double-entry transaction between two accounts.
// It is idempotent: replaying the same IdempotencyKey returns the original
// transaction without posting new entries (RAT §2/§3.3).
func (s *TransferService) Transfer(ctx context.Context, cmd TransferCommand) (domain.Transaction, error) {
	if cmd.SourceAccount == cmd.DestAccount {
		return domain.Transaction{}, domain.ErrSameAccountTransfer
	}
	if cmd.Amount.Amount <= 0 {
		return domain.Transaction{}, domain.ErrInvalidAmount
	}

	var result domain.Transaction
	err := s.store.WithTx(ctx, func(repo RepoTx) error {
		if existing, err := repo.FindTransactionByIdemKey(ctx, cmd.IdempotencyKey); err != nil {
			return err
		} else if existing != nil {
			result = *existing
			return nil
		}

		// Lock accounts in a deterministic order to avoid deadlocks between
		// concurrent transfers that touch the same pair of accounts.
		firstID, secondID := cmd.SourceAccount, cmd.DestAccount
		if firstID > secondID {
			firstID, secondID = secondID, firstID
		}
		locked := make(map[string]domain.Account, 2)
		for _, id := range []string{firstID, secondID} {
			acc, err := repo.LockAccount(ctx, id)
			if err != nil {
				return err
			}
			locked[id] = acc
		}
		src, dst := locked[cmd.SourceAccount], locked[cmd.DestAccount]

		if err := src.EnsureActive(); err != nil {
			return err
		}
		if err := dst.EnsureActive(); err != nil {
			return err
		}
		if src.Currency != cmd.Amount.Currency || dst.Currency != cmd.Amount.Currency {
			return domain.ErrCurrencyMismatch
		}
		if err := src.EnsureSufficientFunds(cmd.Amount.Amount); err != nil {
			return err
		}

		txID := uuid.NewString()
		result = domain.Transaction{
			ID:             txID,
			Type:           domain.TransactionTransfer,
			Status:         domain.TransactionSettled,
			IdempotencyKey: cmd.IdempotencyKey,
			SourceAccount:  src.ID,
			DestAccount:    dst.ID,
			Amount:         cmd.Amount,
			Reference:      cmd.Reference,
			CreatedAt:      time.Now().UTC(),
		}
		if err := repo.InsertTransaction(ctx, result); err != nil {
			return err
		}

		entries := domain.NewTransferEntries(txID, src.ID, dst.ID, cmd.Amount)
		if err := repo.AppendEntries(ctx, entries); err != nil {
			return err
		}
		if err := repo.UpdateBalance(ctx, src.ID, src.Balance-cmd.Amount.Amount); err != nil {
			return err
		}
		if err := repo.UpdateBalance(ctx, dst.ID, dst.Balance+cmd.Amount.Amount); err != nil {
			return err
		}
		return nil
	})
	return result, err
}
