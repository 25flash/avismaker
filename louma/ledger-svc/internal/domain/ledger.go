package domain

import "time"

type EntryDirection string

const (
	Debit  EntryDirection = "DEBIT"
	Credit EntryDirection = "CREDIT"
)

// LedgerEntry is one leg of a double-entry posting. Entries are append-only;
// corrections are made via reversal entries, never by mutation (RAT §4.3).
type LedgerEntry struct {
	ID        string
	AccountID string
	Direction EntryDirection
	Amount    Money
	TxID      string
	Seq       int64
	CreatedAt time.Time
}

type TransactionStatus string

const (
	TransactionSettled TransactionStatus = "SETTLED"
)

type TransactionType string

const (
	TransactionTransfer TransactionType = "TRANSFER"
)

// Transaction is the record of a financial operation, keyed by an
// idempotency key so that a replayed request never produces a double effect
// (RAT §2 / §3.3).
type Transaction struct {
	ID             string
	Type           TransactionType
	Status         TransactionStatus
	IdempotencyKey string
	SourceAccount  string
	DestAccount    string
	Amount         Money
	Reference      string
	CreatedAt      time.Time
}

// NewTransferEntries builds the two balanced ledger entries for a transfer:
// a debit on the source account and a credit on the destination account.
// Sum(debits) == Sum(credits) is the invariant enforced by construction.
func NewTransferEntries(txID, sourceAccount, destAccount string, amount Money) []LedgerEntry {
	return []LedgerEntry{
		{AccountID: sourceAccount, Direction: Debit, Amount: amount, TxID: txID},
		{AccountID: destAccount, Direction: Credit, Amount: amount, TxID: txID},
	}
}
