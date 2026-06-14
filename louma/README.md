# Louma — monorepo

Super-app financière du Sénégal (Lot 1 — slice vertical fonctionnel).
Voir `docs/adr/0008-pivot-monorepo-mobile-node.md` pour le contexte de stack.

```
louma/
├── apps/mobile/      # App Expo (React Native + TypeScript) — particulier
├── services/api/     # Backend Fastify + Prisma + PostgreSQL
├── packages/shared/  # Types, schémas zod, client API partagés
├── packages/ui/      # (réservé) design system
├── infra/            # docker-compose Postgres
└── ledger-svc/       # Prototype Go historique (ADR-0008), non utilisé par le produit
```

## Prérequis

- Node.js 20+, pnpm 10+ (`corepack enable` ou `npm i -g pnpm`)
- PostgreSQL (local ou via `infra/docker-compose.yml`)

## 1. Installer les dépendances

```sh
cd louma
pnpm install
```

## 2. Démarrer PostgreSQL

Avec Docker :

```sh
docker compose -f infra/docker-compose.yml up -d
```

Sans Docker (Postgres local déjà installé) : créez une base et un utilisateur,
puis adaptez `services/api/.env` (voir `.env.example`).

```sh
sudo -u postgres psql -c "CREATE USER louma WITH PASSWORD 'louma' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE louma OWNER louma;"
```

## 3. Configurer et migrer le backend

```sh
cd services/api
cp .env.example .env   # adapter DATABASE_URL si besoin (port 5432 en local, 5433 via docker-compose)
pnpm prisma migrate deploy
```

## 4. Lancer le backend

```sh
pnpm --filter @louma/api dev
# API disponible sur http://localhost:3000  (GET /health -> {"status":"ok"})
```

## 5. Lancer l'app mobile (Expo)

```sh
pnpm --filter @louma/mobile start
```

- Scannez le QR code avec **Expo Go** (iOS/Android) ou lancez un simulateur
  (`a` pour Android, `i` pour iOS, `w` pour le web).
- Sur un téléphone physique, le backend `localhost` n'est pas accessible :
  définissez `EXPO_PUBLIC_API_URL=http://<IP_DE_VOTRE_MACHINE>:3000` avant de
  lancer Expo (ex: `EXPO_PUBLIC_API_URL=http://192.168.1.10:3000 pnpm --filter @louma/mobile start`).

## 6. Parcours de test (session 1)

1. Écran d'accueil Louma → **Créer un compte** (téléphone `+221XXXXXXXXX`,
   PIN 4-6 chiffres, nom complet) → compte + RIB créés, solde 0 XOF.
2. Sur l'écran **Mon compte** : voir le solde et le RIB.
3. **Déposer** un montant (sandbox) → le solde augmente réellement en base.
4. Créer un 2e compte (autre numéro de téléphone) sur le même backend.
5. **Envoyer** de l'argent du compte A vers le compte B (par RIB ou
   téléphone) → écritures en partie double, idempotent (même
   `Idempotency-Key` = même résultat, pas de double effet).
6. **Historique** : voir les opérations sur les deux comptes.

## Tests backend

```sh
cd services/api
pnpm test
```

Les tests utilisent une base PostgreSQL séparée (`louma_test` par défaut,
`TEST_DATABASE_URL` pour surcharger) et appliquent les migrations
automatiquement avant de s'exécuter.
