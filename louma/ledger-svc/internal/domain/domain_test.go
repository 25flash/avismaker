package domain

import "testing"

func TestNewMoney(t *testing.T) {
	if _, err := NewMoney("XOF", 0); err != ErrInvalidAmount {
		t.Fatalf("expected ErrInvalidAmount for zero amount, got %v", err)
	}
	if _, err := NewMoney("XOF", -100); err != ErrInvalidAmount {
		t.Fatalf("expected ErrInvalidAmount for negative amount, got %v", err)
	}
	m, err := NewMoney("XOF", 15000)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if m.Amount != 15000 || m.Currency != "XOF" {
		t.Fatalf("unexpected money value: %+v", m)
	}
}

func TestAccountEnsureActive(t *testing.T) {
	active := Account{Status: AccountStatusActive}
	if err := active.EnsureActive(); err != nil {
		t.Fatalf("expected active account to pass, got %v", err)
	}

	frozen := Account{Status: AccountStatusFrozen}
	if err := frozen.EnsureActive(); err != ErrAccountNotActive {
		t.Fatalf("expected ErrAccountNotActive, got %v", err)
	}
}

func TestAccountEnsureSufficientFunds(t *testing.T) {
	acc := Account{Balance: 1000}
	if err := acc.EnsureSufficientFunds(1000); err != nil {
		t.Fatalf("expected exact balance to be sufficient, got %v", err)
	}
	if err := acc.EnsureSufficientFunds(1001); err != ErrInsufficientFunds {
		t.Fatalf("expected ErrInsufficientFunds, got %v", err)
	}
}

func TestNewTransferEntriesAreBalanced(t *testing.T) {
	amount := Money{Currency: "XOF", Amount: 5000}
	entries := NewTransferEntries("tx_1", "acc_src", "acc_dst", amount)

	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}

	var debitTotal, creditTotal int64
	for _, e := range entries {
		switch e.Direction {
		case Debit:
			debitTotal += e.Amount.Amount
		case Credit:
			creditTotal += e.Amount.Amount
		default:
			t.Fatalf("unexpected direction: %s", e.Direction)
		}
		if e.TxID != "tx_1" {
			t.Fatalf("expected entry to carry tx id, got %q", e.TxID)
		}
	}

	if debitTotal != creditTotal {
		t.Fatalf("entries not balanced: debit=%d credit=%d", debitTotal, creditTotal)
	}
	if debitTotal != amount.Amount {
		t.Fatalf("expected total %d, got %d", amount.Amount, debitTotal)
	}
}
