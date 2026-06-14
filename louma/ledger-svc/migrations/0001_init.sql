-- Lot 1 foundation schema for ledger-svc (RAT §4.2 entity model).

CREATE TABLE IF NOT EXISTS account_seq (
    id BIGINT PRIMARY KEY DEFAULT 1,
    value BIGINT NOT NULL DEFAULT 0
);
INSERT INTO account_seq (id, value) VALUES (1, 0) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS accounts (
    id          TEXT PRIMARY KEY,
    tenant_id   TEXT NOT NULL,
    rib         TEXT NOT NULL UNIQUE,
    currency    TEXT NOT NULL,
    status      TEXT NOT NULL,
    type        TEXT NOT NULL,
    balance     BIGINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
    id              TEXT PRIMARY KEY,
    type            TEXT NOT NULL,
    status          TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    source_account  TEXT NOT NULL REFERENCES accounts(id),
    dest_account    TEXT NOT NULL REFERENCES accounts(id),
    currency        TEXT NOT NULL,
    amount          BIGINT NOT NULL,
    reference       TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id          TEXT PRIMARY KEY,
    account_id  TEXT NOT NULL REFERENCES accounts(id),
    direction   TEXT NOT NULL,
    currency    TEXT NOT NULL,
    amount      BIGINT NOT NULL,
    tx_id       TEXT NOT NULL REFERENCES transactions(id),
    seq         BIGSERIAL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_account_id ON ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_tx_id ON ledger_entries(tx_id);
