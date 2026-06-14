package domain

import "fmt"

// GenerateRIB derives a simplified Louma RIB from an account sequence number.
// Format: SN + 2-digit check digit (mod 97 of the sequence, IBAN-style) + 18-digit
// zero-padded sequence. This is a structural placeholder for the Lot 1
// foundation; the final BCEAO-compliant RIB format must be confirmed with the
// cantonnement bank partner before Go-Live (see docs/OPEN_QUESTIONS.md).
func GenerateRIB(seq int64) string {
	check := seq % 97
	return fmt.Sprintf("SN%02d%018d", check, seq)
}
