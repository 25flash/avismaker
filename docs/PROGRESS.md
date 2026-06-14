# Avancement — Louma

## Fait
- Lecture intégrale des 3 documents de référence (CDC V4, Dossier stratégique exécutif, Rapport d'architecture technique).
- Phase A produite : synthèse croisée, contradictions identifiées, cartographie des bounded contexts, mapping fonctionnalités → services → couches, structure de dépôts proposée, ADR 0000-0007, backlog par lots (`docs/PHASE_A.md`, `docs/adr/`, `docs/DECISIONS.md`).

## Décidé par le comité (2026-06-14)
- Organisation des dépôts : nouveaux dépôts dédiés Louma (ADR-0000 validé).
- Stack technique : stack polyglotte RAT — Go / Kotlin-JVM / Kotlin Multiplatform / React-TS (ADR-0002 validé).
- Extensions de cartographie : `subscription-svc`, `ops-console`, Comptes Junior (ADR-0007 validé).

## En cours
- Création des ~17 dépôts `louma-*` impossible depuis cette session (token GitHub scopé à `25flash/avismaker`, outils multi-dépôts indisponibles). Décision : construire Louma dans `avismaker/louma/` (structure alignée sur la cible polyrepo A3.1, extraction future via git subtree/filter-repo) — ADR-0000 révisé.

## Fait (Lot 1)
- `louma/ledger-svc` (Go, architecture hexagonale) : domaine (Money, Account, LedgerEntry, Transaction, RIB), application (`AccountService`, `TransferService` avec verrouillage ordonné des comptes et virement idempotent par `Idempotency-Key`), adaptateur Postgres (pgx, migrations SQL `migrations/0001_init.sql`), adaptateur HTTP `/v1/ledger/*` (RFC 7807), `cmd/server`.
- Tests : unitaires du domaine + tests d'intégration Postgres (`go test ./...` OK contre une base Postgres locale) + vérification manuelle de l'API via `curl` (ouverture de comptes, virement, rejeu idempotent, comptes erronés).

## Bloqué / à suivre
- Format BCEAO définitif du RIB à confirmer avec la banque de cantonnement avant le Go-Live (voir `docs/OPEN_QUESTIONS.md`).
- Prochaine étape Lot 1 : `identity-svc` (auth/KYC stub), puis `payments-svc`, API gateway, squelette mobile (KMP + iOS/Android natifs).
