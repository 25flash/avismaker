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

## Pivot produit (2026-06-14) — ADR-0008
- Mandat explicite : app mobile React Native/Expo + backend Node.js/TS réel dans un monorepo unique, slice vertical fonctionnel dès la session 1 (pas de plan, pas de maquette, pas de site vitrine).
- `louma/ledger-svc` (Go) conservé comme référence historique, n'est plus le backend actif (voir ADR-0008).

## Fait (Session 1 — slice vertical)
- Monorepo pnpm : `apps/mobile` (Expo/TS), `services/api` (Fastify + Prisma + PostgreSQL), `packages/shared` (zod schemas + client API), `infra/docker-compose.yml`.
- Backend `services/api` : auth (inscription téléphone+PIN avec argon2, JWT access+refresh), ouverture de compte + RIB (même algorithme placeholder que ledger-svc), ledger en partie double (table `LedgerEntry`/`Transaction`), virement idempotent (`Idempotency-Key`, verrouillage ordonné `SELECT ... FOR UPDATE`), dépôt sandbox via compte système `SANDBOX-EXTERNAL-XOF`, historique des transactions. Erreurs RFC 7807.
- Tests : 3 tests d'intégration Vitest (parcours complet inscription→dépôt→virement→rejeu idempotent→historique, fonds insuffisants, PIN invalide) — `pnpm test` OK contre Postgres local.
- Mobile `apps/mobile` : écrans Accueil, Inscription, Connexion, Mon compte (solde + RIB), Dépôt, Envoi d'argent, Historique. Navigation React Navigation, état Zustand persisté (AsyncStorage), client API partagé (`@louma/shared`).
- Vérification bout-en-bout : parcours complet testé via `curl` contre l'API (inscription de 2 comptes, dépôt, virement, rejeu idempotent, historique, soldes corrects) + build Metro/Expo web réussi (530 modules) + `tsc --noEmit` sans erreur sur le mobile.

## Bloqué / à suivre
- Format BCEAO définitif du RIB à confirmer avec la banque de cantonnement avant le Go-Live (voir `docs/OPEN_QUESTIONS.md`).
- Session 2 : paiements & canaux particulier (QR marchand, factures, airtime, demandes de paiement, notifications, multi-devises affichage).
