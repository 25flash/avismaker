package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"

	"louma/ledger-svc/internal/adapters/httpapi"
	"louma/ledger-svc/internal/adapters/postgres"
	"louma/ledger-svc/internal/app"
)

func main() {
	ctx := context.Background()

	dsn := os.Getenv("LEDGER_DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://localhost:5432/ledger?sslmode=disable"
	}

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("connect to database: %v", err)
	}
	defer pool.Close()

	store := postgres.NewStore(pool)
	accounts := app.NewAccountService(store)
	transfers := app.NewTransferService(store)

	handler := httpapi.NewHandler(accounts, transfers)

	addr := os.Getenv("LEDGER_HTTP_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	log.Printf("ledger-svc listening on %s", addr)
	if err := http.ListenAndServe(addr, handler.Routes()); err != nil {
		log.Fatal(err)
	}
}
