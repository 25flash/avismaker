package app

import (
	"context"
	"time"

	"github.com/google/uuid"

	"louma/ledger-svc/internal/domain"
)

type AccountService struct {
	store Store
}

func NewAccountService(store Store) *AccountService {
	return &AccountService{store: store}
}

type OpenAccountCommand struct {
	TenantID string
	Currency string
	Type     domain.AccountType
}

func (s *AccountService) OpenAccount(ctx context.Context, cmd OpenAccountCommand) (domain.Account, error) {
	accType := cmd.Type
	if accType == "" {
		accType = domain.AccountTypeStandard
	}

	var account domain.Account
	err := s.store.WithTx(ctx, func(repo RepoTx) error {
		seq, err := repo.NextAccountSeq(ctx)
		if err != nil {
			return err
		}
		account = domain.Account{
			ID:        uuid.NewString(),
			TenantID:  cmd.TenantID,
			RIB:       domain.GenerateRIB(seq),
			Currency:  cmd.Currency,
			Status:    domain.AccountStatusActive,
			Type:      accType,
			Balance:   0,
			CreatedAt: time.Now().UTC(),
		}
		return repo.CreateAccount(ctx, account)
	})
	return account, err
}

func (s *AccountService) GetAccount(ctx context.Context, id string) (domain.Account, error) {
	var account domain.Account
	err := s.store.WithTx(ctx, func(repo RepoTx) error {
		a, err := repo.GetAccount(ctx, id)
		if err != nil {
			return err
		}
		account = a
		return nil
	})
	return account, err
}
