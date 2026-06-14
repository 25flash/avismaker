package domain

import "time"

type AccountStatus string

const (
	AccountStatusActive AccountStatus = "ACTIVE"
	AccountStatusFrozen AccountStatus = "FROZEN"
	AccountStatusClosed AccountStatus = "CLOSED"
)

type AccountType string

const (
	AccountTypeStandard AccountType = "STANDARD"
	AccountTypeJunior   AccountType = "JUNIOR"
)

// Account is the read model of a ledger account. Balance is a materialized
// projection of its ledger entries, always updated within the same
// transaction that inserts the entries (RAT §3.3 outbox/transaction pattern).
type Account struct {
	ID        string
	TenantID  string
	RIB       string
	Currency  string
	Status    AccountStatus
	Type      AccountType
	Balance   int64
	CreatedAt time.Time
}

func (a Account) EnsureActive() error {
	if a.Status != AccountStatusActive {
		return ErrAccountNotActive
	}
	return nil
}

func (a Account) EnsureSufficientFunds(amount int64) error {
	if a.Balance < amount {
		return ErrInsufficientFunds
	}
	return nil
}
