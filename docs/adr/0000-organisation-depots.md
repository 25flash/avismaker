# ADR-0000 — Organisation des dépôts Louma vs `avismaker`/ReviewPlate

Statut : **Validé (option "nouveaux dépôts dédiés Louma" retenue, sous le compte `25flash`) — création effective différée : non réalisable depuis cette session (token GitHub scopé à `25flash/avismaker`)**

## Hypothèse
Le dépôt `avismaker` actuel héberge un produit sans lien avec Louma ("ReviewPlate", SaaS de cartes NFC/QR pour avis clients, monorepo pnpm/TypeScript). Aucun des 3 documents de référence ne mentionne ce projet. La création de nouveaux dépôts pour Louma est possible côté organisation GitHub.

## Décision
Créer une nouvelle organisation/un nouvel ensemble de dépôts dédiés à Louma, structurés en polyrepo par plan d'ownership (voir `PHASE_A.md` §A3.1) : dépôts plateforme partagés (`louma-contracts`, `louma-platform`, `louma-design-system`, `louma-infra`) + dépôts par regroupement de services (`louma-core`, `louma-ledger`, `louma-payments`, `louma-masspay`, `louma-identity`, `louma-remit`, `louma-cards`, `louma-gateway`, `louma-mobile`, `louma-web`, `louma-console-business`, `louma-ussd`, `louma-data-platform`).
`avismaker`/ReviewPlate n'est ni modifié ni supprimé. Tant que les dépôts cibles ne sont pas créés/accessibles, la documentation de cadrage (Phase A, ADR, backlog, journal de décisions) est maintenue dans `avismaker/docs/` comme zone neutre, sans impact sur le code ReviewPlate.

## Alternatives rejetées
1. **Étendre `avismaker`** avec Louma à côté de ReviewPlate : rejetée — mélange un produit fintech régulé (exigences de sécurité, conformité, scope PCI-DSS, gouvernance d'accès strictes) avec une SaaS sans rapport ; complique l'audit et les revues de sécurité ; la stack cible (Go/Kotlin/KMP) n'a rien à voir avec l'outillage pnpm/TS de ReviewPlate.
2. **Un seul monorepo polyglotte "louma"** (Go + Kotlin + TS + Swift dans un seul dépôt avec Bazel/Nx) : rejetée — overhead d'outillage très élevé pour une équipe en formation, contraire au principe DSE 3.1 (« vitesse initiale », « éviter la sur-ingénierie »).

## Trade-offs
- Le polyrepo impose une discipline de versionnage des contrats partagés (`louma-contracts`) plus stricte qu'un monorepo (pas de refactor atomique cross-repo).
- Multiplie le nombre de pipelines CI/CD et de dépôts à gouverner (mitigé par `louma-platform`/`louma-infra` mutualisés).

## Risques
- Dérive des contrats entre dépôts si `louma-contracts` n'est pas adopté strictement → mitigation : génération de clients/serveurs depuis `louma-contracts`, CI bloquante sur breaking change non versionné.
- Accès aux nouveaux dépôts non disponible dans la session courante → mitigation : travail de cadrage documenté dans `avismaker/docs/` en attendant, migration vers les dépôts cibles une fois créés.

## KPI
- Nombre de dépôts créés vs cible (13 + 4 plateforme).
- Délai entre validation comité et premier commit dans `louma-platform`.

## Responsable(s)
Architectes logiciels (senior+++), DevOps/Platform Engineering.
