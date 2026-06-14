package domain

// Money is an integer amount in the smallest unit of currency (e.g. XOF has no decimals).
// Floating point is never used for monetary values (RAT §4.3).
type Money struct {
	Currency string
	Amount   int64
}

func NewMoney(currency string, amount int64) (Money, error) {
	if amount <= 0 {
		return Money{}, ErrInvalidAmount
	}
	return Money{Currency: currency, Amount: amount}, nil
}
