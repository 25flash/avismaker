# Avancement — Louma

## Fait
- Lecture intégrale des 3 documents de référence (CDC V4, Dossier stratégique exécutif, Rapport d'architecture technique).
- Phase A produite : synthèse croisée, contradictions identifiées, cartographie des bounded contexts, mapping fonctionnalités → services → couches, structure de dépôts proposée, ADR 0000-0007, backlog par lots (`docs/PHASE_A.md`, `docs/adr/`, `docs/DECISIONS.md`).

## Décidé par le comité (2026-06-14)
- Organisation des dépôts : nouveaux dépôts dédiés Louma (ADR-0000 validé).
- Stack technique : stack polyglotte RAT — Go / Kotlin-JVM / Kotlin Multiplatform / React-TS (ADR-0002 validé).
- Extensions de cartographie : `subscription-svc`, `ops-console`, Comptes Junior (ADR-0007 validé).

## En cours
- Création des ~17 dépôts `louma-*` impossible depuis cette session (token GitHub scopé à `25flash/avismaker`, outils multi-dépôts indisponibles). Reportée : sera réalisée hors session (manuellement ou via une session avec accès élargi).

## Bloqué
- Phase B (échafaudage dépôts, CI/CD, IaC, socle Identité/KYC, Ledger, Compte/RIB) en attente de la création effective des dépôts `louma-*`. En attendant, le travail préparatoire (squelettes, README, manifests par futur dépôt) peut être poursuivi dans `avismaker/docs/` sur demande.
