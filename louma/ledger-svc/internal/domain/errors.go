package domain

import "errors"

var (
	ErrInvalidAmount       = errors.New("amount must be a positive integer")
	ErrCurrencyMismatch    = errors.New("currency mismatch between accounts and amount")
	ErrInsufficientFunds   = errors.New("source account balance does not cover the amount")
	ErrAccountNotFound     = errors.New("account not found")
	ErrAccountNotActive    = errors.New("account is not active")
	ErrSameAccountTransfer = errors.New("source and destination accounts must differ")
	ErrUnbalancedEntries   = errors.New("ledger entries are not balanced: sum(debits) must equal sum(credits)")
)
