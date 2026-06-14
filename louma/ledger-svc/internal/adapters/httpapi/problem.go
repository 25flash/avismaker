package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"louma/ledger-svc/internal/domain"
)

// problem is an RFC 7807 Problem Details payload (ADR-0004).
type problem struct {
	Type   string `json:"type"`
	Title  string `json:"title"`
	Status int    `json:"status"`
	Detail string `json:"detail,omitempty"`
}

func writeProblem(w http.ResponseWriter, status int, problemType, title, detail string) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(problem{
		Type:   problemType,
		Title:  title,
		Status: status,
		Detail: detail,
	})
}

// writeError maps a domain/application error to an RFC 7807 response.
func writeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrInvalidAmount),
		errors.Is(err, domain.ErrCurrencyMismatch),
		errors.Is(err, domain.ErrSameAccountTransfer):
		writeProblem(w, http.StatusBadRequest, "about:blank", "Invalid request", err.Error())
	case errors.Is(err, domain.ErrAccountNotFound):
		writeProblem(w, http.StatusNotFound, "about:blank", "Account not found", err.Error())
	case errors.Is(err, domain.ErrAccountNotActive):
		writeProblem(w, http.StatusConflict, "about:blank", "Account not active", err.Error())
	case errors.Is(err, domain.ErrInsufficientFunds):
		writeProblem(w, http.StatusUnprocessableEntity, "about:blank", "Insufficient funds", err.Error())
	default:
		writeProblem(w, http.StatusInternalServerError, "about:blank", "Internal server error", "")
	}
}
