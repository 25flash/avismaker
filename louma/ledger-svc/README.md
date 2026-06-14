# ledger-svc

Cœur comptable de Louma (Lot 1). Tient la source de vérité des comptes et du
grand livre en partie double (RAT §4.2/§4.3). Architecture hexagonale :

- `internal/domain` — modèle métier pur (Account, Money, LedgerEntry,
  Transaction), sans dépendance I/O.
- `internal/app` — cas d'usage / ports (`AccountService`, `TransferService`,
  interfaces `Store`/`RepoTx`).
- `internal/adapters/postgres` — implémentation des ports via pgx.
- `internal/adapters/httpapi` — API REST `/v1/ledger/*` (RFC 7807, ADR-0004).
- `cmd/server` — point d'entrée, câble les adaptateurs.
- `migrations/` — schéma SQL versionné.

## Démarrer en local

```sh
# 1. Base de données (Postgres local, voir migrations/0001_init.sql)
createdb ledger
psql -d ledger -f migrations/0001_init.sql

# 2. Lancer le service
LEDGER_DATABASE_URL="postgres://user:pass@localhost:5432/ledger?sslmode=disable" \
LEDGER_HTTP_ADDR=":8080" \
go run ./cmd/server
```

## API

- `POST /v1/ledger/accounts` — ouvre un compte
  `{"tenant_id": "...", "currency": "XOF", "type": "STANDARD"}`
- `GET /v1/ledger/accounts/{id}` — consulte un compte
- `POST /v1/ledger/transfer` — virement idempotent, en-tête
  `Idempotency-Key` obligatoire
  `{"source_account": "...", "dest_account": "...", "currency": "XOF", "amount": 2500, "reference": "..."}`

Les erreurs sont renvoyées au format RFC 7807 (`application/problem+json`).

## Tests

```sh
go test ./...
```

Les tests d'intégration de `internal/adapters/postgres` nécessitent une base
Postgres locale (`LEDGER_TEST_DATABASE_URL`, par défaut
`postgres://ledger:ledger@localhost:5432/ledger_test?sslmode=disable`,
schéma initialisé via `migrations/0001_init.sql`). Ils sont automatiquement
ignorés (`SKIP`) si aucune base n'est disponible.
