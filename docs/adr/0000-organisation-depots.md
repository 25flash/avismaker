# ADR-0000 — Organisation des dépôts Louma vs `avismaker`/ReviewPlate

Statut : **Révisé — workspace dédié `avismaker/louma/` retenu pour démarrer (Lot 1), migration vers dépôts séparés différée**

## Hypothèse
Le dépôt `avismaker` actuel héberge un produit sans lien avec Louma ("ReviewPlate", SaaS de cartes NFC/QR pour avis clients, monorepo pnpm/TypeScript). Aucun des 3 documents de référence ne mentionne ce projet. La création de nouveaux dépôts pour Louma n'est pas réalisable depuis cette session (token GitHub scopé à `25flash/avismaker`, outils multi-dépôts indisponibles).

## Décision
Option initiale (nouveaux dépôts `louma-*` séparés, polyrepo par tribu — voir `PHASE_A.md` §A3.1) **reste la cible à terme**, mais est différée. Pour permettre un démarrage immédiat de la Phase B (Lot 1), Louma est construit dans un **workspace dédié `avismaker/louma/`**, à la racine du dépôt, totalement séparé de `artifacts/` (ReviewPlate) :
- `louma/` a sa propre structure (packages/modules par bounded context, conventions ADR-0001/0002), aucune dépendance vers `artifacts/` ou `lib/` ReviewPlate.
- `avismaker`/ReviewPlate n'est ni modifié ni supprimé.
- Quand les dépôts `louma-*` seront créés et accessibles, le contenu de `louma/<bc>/` sera extrait tel quel (historique git préservé via `git subtree`/`filter-repo`) vers son dépôt cible — la structure interne de `louma/` est donc alignée 1:1 sur le découpage de dépôts cible de A3.1 pour faciliter cette extraction future.

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
