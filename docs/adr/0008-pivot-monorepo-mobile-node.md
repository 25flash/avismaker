# ADR-0008 — Pivot : monorepo unique React Native (Expo) + Node.js/TypeScript pour le produit livrable

Statut : **Validé** (mandat produit explicite, 2026-06-14)

## Contexte
ADR-0002 retient une stack RAT polyglotte cible (Go pour les services critiques,
Kotlin/JVM pour les services métier, Kotlin Multiplatform + natif pour le mobile).
Sur cette base, la session précédente a commencé `louma/ledger-svc` en Go.

Le commanditaire a ensuite donné un mandat produit explicite et sans ambiguïté :
livrer dès la **première session utilisateur** une application **mobile React
Native (Expo)** connectée à un **backend Node.js/TypeScript réel** (Fastify +
Prisma + PostgreSQL), dans un **monorepo unique** (`apps/mobile`,
`services/api`, `packages/shared`, `packages/ui`, `infra/`), avec interdiction
explicite de livrer un plan, une maquette ou un site vitrine.

## Décision
1. Le backend produit (`services/api`) est désormais en **Node.js/TypeScript
   (Fastify + Prisma + PostgreSQL)**, et non en Go. `louma/ledger-svc` (Go) est
   conservé comme référence/historique mais n'est plus le backend actif.
2. Le mobile est **React Native + Expo (TypeScript)**, avec une seule base de
   code pour l'app particulier (et, plus tard, l'espace business — ADR-0007).
3. Le cœur métier (compte, RIB, ledger en partie double, transfert idempotent)
   est ré-implémenté en TypeScript dans `services/api`, en conservant les
   mêmes invariants que `ledger-svc` (montants entiers XOF, écritures
   équilibrées append-only, `Idempotency-Key` sur les opérations mutantes,
   verrouillage ordonné des comptes pour éviter les deadlocks).
4. `packages/shared` porte les schémas zod et le client API partagés entre
   mobile et backend (source unique de vérité pour les contrats).

## Conséquences
- La stack RAT polyglotte (ADR-0002) reste la **cible long terme** pour les
  services critiques à fort volume (Go) et les services métier (Kotlin/JVM),
  mais elle est **différée** : le produit livrable immédiat priorise la
  vélocité full-stack TypeScript et la compatibilité Expo (iOS + Android) avec
  une seule équipe/un seul langage applicatif.
- `louma/ledger-svc` (Go, testé, fonctionnel) reste dans le dépôt comme
  prototype de référence pour la migration future du cœur ledger vers Go
  lorsque le volume le justifiera (RAT §3.1 — trade-off latence/concurrence).
- Le RIB généré reste un placeholder structurel
  (`SN` + 2 chiffres de contrôle + séquence sur 18 chiffres) — le format
  BCEAO définitif reste `[HYPOTHÈSE À VALIDER]` (voir
  `docs/OPEN_QUESTIONS.md`).
- Les intégrations externes (banque de cantonnement, switch, agrégateurs)
  restent simulées par des adaptateurs sandbox derrière une interface stable
  (ex. compte système `SANDBOX-EXTERNAL-XOF` pour les dépôts simulés).

## Alternatives rejetées
- **Continuer en Go pour le backend** : rejeté — incompatible avec le mandat
  "monorepo unique TS + Expo" et le critère de succès "slice vertical
  fonctionnel dès la session 1".
- **Maquette statique / site web** : explicitement interdit par le
  commanditaire.
