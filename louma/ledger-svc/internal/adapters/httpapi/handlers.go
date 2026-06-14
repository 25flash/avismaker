package httpapi

import (
	"encoding/json"
	"net/http"

	"louma/ledger-svc/internal/app"
	"louma/ledger-svc/internal/domain"
)

// Handler exposes the ledger-svc REST API per ADR-0004 (RFC 7807, /v1 prefix,
// Idempotency-Key header for state-changing requests).
type Handler struct {
	accounts  *app.AccountService
	transfers *app.TransferService
}

func NewHandler(accounts *app.AccountService, transfers *app.TransferService) *Handler {
	return &Handler{accounts: accounts, transfers: transfers}
}

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /v1/ledger/accounts", h.openAccount)
	mux.HandleFunc("GET /v1/ledger/accounts/{id}", h.getAccount)
	mux.HandleFunc("POST /v1/ledger/transfer", h.transfer)
	return mux
}

type openAccountRequest struct {
	TenantID string `json:"tenant_id"`
	Currency string `json:"currency"`
	Type     string `json:"type,omitempty"`
}

type accountResponse struct {
	ID        string `json:"id"`
	TenantID  string `json:"tenant_id"`
	RIB       string `json:"rib"`
	Currency  string `json:"currency"`
	Status    string `json:"status"`
	Type      string `json:"type"`
	Balance   int64  `json:"balance"`
	CreatedAt string `json:"created_at"`
}

func toAccountResponse(a domain.Account) accountResponse {
	return accountResponse{
		ID:        a.ID,
		TenantID:  a.TenantID,
		RIB:       a.RIB,
		Currency:  a.Currency,
		Status:    string(a.Status),
		Type:      string(a.Type),
		Balance:   a.Balance,
		CreatedAt: a.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func (h *Handler) openAccount(w http.ResponseWriter, r *http.Request) {
	var req openAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "about:blank", "Invalid request body", err.Error())
		return
	}
	if req.TenantID == "" || req.Currency == "" {
		writeProblem(w, http.StatusBadRequest, "about:blank", "Invalid request", "tenant_id and currency are required")
		return
	}

	account, err := h.accounts.OpenAccount(r.Context(), app.OpenAccountCommand{
		TenantID: req.TenantID,
		Currency: req.Currency,
		Type:     domain.AccountType(req.Type),
	})
	if err != nil {
		writeError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(toAccountResponse(account))
}

func (h *Handler) getAccount(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	account, err := h.accounts.GetAccount(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(toAccountResponse(account))
}

type transferRequest struct {
	SourceAccount string `json:"source_account"`
	DestAccount   string `json:"dest_account"`
	Currency      string `json:"currency"`
	Amount        int64  `json:"amount"`
	Reference     string `json:"reference,omitempty"`
}

type transactionResponse struct {
	ID             string `json:"id"`
	Type           string `json:"type"`
	Status         string `json:"status"`
	IdempotencyKey string `json:"idempotency_key"`
	SourceAccount  string `json:"source_account"`
	DestAccount    string `json:"dest_account"`
	Currency       string `json:"currency"`
	Amount         int64  `json:"amount"`
	Reference      string `json:"reference,omitempty"`
	CreatedAt      string `json:"created_at"`
}

func (h *Handler) transfer(w http.ResponseWriter, r *http.Request) {
	idemKey := r.Header.Get("Idempotency-Key")
	if idemKey == "" {
		writeProblem(w, http.StatusBadRequest, "about:blank", "Missing Idempotency-Key", "the Idempotency-Key header is required")
		return
	}

	var req transferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeProblem(w, http.StatusBadRequest, "about:blank", "Invalid request body", err.Error())
		return
	}

	amount, err := domain.NewMoney(req.Currency, req.Amount)
	if err != nil {
		writeError(w, err)
		return
	}

	tx, err := h.transfers.Transfer(r.Context(), app.TransferCommand{
		IdempotencyKey: idemKey,
		SourceAccount:  req.SourceAccount,
		DestAccount:    req.DestAccount,
		Amount:         amount,
		Reference:      req.Reference,
	})
	if err != nil {
		writeError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(transactionResponse{
		ID:             tx.ID,
		Type:           string(tx.Type),
		Status:         string(tx.Status),
		IdempotencyKey: tx.IdempotencyKey,
		SourceAccount:  tx.SourceAccount,
		DestAccount:    tx.DestAccount,
		Currency:       tx.Amount.Currency,
		Amount:         tx.Amount.Amount,
		Reference:      tx.Reference,
		CreatedAt:      tx.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}
