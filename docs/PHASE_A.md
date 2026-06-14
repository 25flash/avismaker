# Phase A — Assimilation & cadrage technique (Louma)

Statut : **proposé, en attente de validation comité** 🛑
Sources : Cahier des charges Louma V4 (CDC), Dossier stratégique exécutif (DSE), Rapport d'architecture technique (RAT).
Priorité en cas de contradiction : décisions techniques → RAT > DSE > CDC ; décisions de périmètre/produit → CDC > DSE > RAT.

---

## A1. Synthèse croisée

### Ce que les trois documents établissent ensemble (cohérent, sans contradiction)

| Axe | Convergence des 3 documents |
|---|---|
| Vision | Louma = compte principal (1 citoyen → 1 compte → 1 RIB → 1 carte ; 1 pro → 1 identité business → 1 compte → 1 RIB → 1 carte). |
| Périmètre | Lancement **intégral** au Go-Live (M16-M18, cible 2027) : 100 % des fonctionnalités CDC actives J1. Seule la montée en charge est progressive. |
| Statut réglementaire | EME (BCEAO/UEMOA) pour le socle wallet/RIB/paiement/carte ; services régulés (épargne rémunérée, crédit, investissement, assurance) via partenaires agréés **intégrés avant Go-Live** (prérequis bloquant, même rang que l'agrément). |
| Architecture cible | Monolithe modulaire structuré par bounded contexts, avec extraction ciblée des domaines critiques : ledger, paiements, conformité, paiement de masse. |
| Données | Séparation stricte OLTP (Postgres par BC, source de vérité) / OLAP (lakehouse via CDC + Kafka). Montants entiers, append-only, pas de flottant. |
| API | API-first, versionnée `/v1/`, RFC 7807, idempotence obligatoire sur toute opération financière mutante. |
| Événementiel | Synchrone pour le critique (paiement, autorisation), asynchrone (Kafka, outbox) pour la propagation. |
| Sécurité | Niveau institution financière systémique : zero-trust, défense en profondeur, PCI-DSS scope cartes, SOC, IAM fort. |
| Build plan | 3 lots de construction (Lot 1 socle, Lot 2 réseau/flux, Lot 3 services régulés) convergeant vers un Go-Live unique. Chemin critique = agrément BCEAO + partenaires régulés + Core/Ledger. |
| GTM | Périmètre national complet dès J1, mais intensité commerciale concentrée géographiquement (biface marchands/diaspora). |

### Contradictions et zones floues détectées

| # | Sujet | Description | Résolution proposée (avec justification de priorité) |
|---|---|---|---|
| 1 | **Dépôt de code existant ("avismaker")** | Le dépôt actuel contient un projet **sans lien avec Louma** : "ReviewPlate", une SaaS de cartes NFC/QR pour avis clients, en pnpm workspace TypeScript (Express 5, Drizzle/Postgres, React/Vite, Stripe). Aucun des 3 documents ne mentionne ce projet. | **Aucune règle de priorité documentaire ne s'applique** : c'est une décision d'organisation de dépôt, hors périmètre des 3 documents → `[HYPOTHÈSE À VALIDER]`, **question bloquante posée au comité** (voir section "Décisions à valider" plus bas). Par défaut proposé : nouveau monorepo/organisation dédiée à Louma, ReviewPlate conservé tel quel dans son propre dépôt (non touché). |
| 2 | **Stack technique par couche** | Le RAT préconise Go (services critiques), Kotlin/JVM (services métier), Kotlin Multiplatform (mobile), React/TS (web). Le dépôt existant est un monorepo **TypeScript pur** (Node/Express, Drizzle). | RAT prime sur DSE/CDC pour les choix techniques → **la stack RAT est retenue comme cible**. Le dépôt TS existant ne peut pas servir de socle pour les services Go/Kotlin sans restructuration majeure → renforce la question #1. La couche Web/BFF/Console (React/TS) reste compatible avec l'outillage pnpm existant. |
| 3 | **Date du CDC vs calendrier build plan** | CDC daté "Juin 2026" (= aujourd'hui), DSE vise un Go-Live M16-M18 → 2027/2028 selon point de départ. CDC §8 dit Go-Live à M16, DSE §5.3 dit M16-M18. | Écart mineur, pas bloquant. On retient la fourchette DSE (M16-M18) comme cible calendaire, le CDC M16 étant le scénario optimiste (agrément sans retard). À tracer dans `docs/OPEN_QUESTIONS.md`. |
| 4 | **Couverture fonctionnelle vs catalogue de services (RAT §15)** | Certaines fonctionnalités du CDC n'apparaissent dans aucune ligne du tableau de traçabilité RAT §15 : (a) Plans freemium / abonnements (Louma Plus/Premium/Ultra, Pro Free/Grow/Scale/Enterprise), (b) Back-office interne (KYC/KYB ops, support, supervision anti-fraude) mentionné CDC §5.2 comme composant applicatif mais absent de l'inventaire BC RAT §1.2, (c) Comptes Junior (CDC §2.6) sans BC porteur explicite. | RAT priorise les décisions techniques mais ne peut pas **rendre orpheline** une fonctionnalité du CDC (priorité périmètre = CDC). → Ces 3 éléments sont traités en A2 comme **extensions à la cartographie RAT**, proposées au comité d'architecture pour ADR. |
| 5 | **Taille d'équipe vs budget indicatif** | Le cadrage de mission décrit une équipe fondatrice de l'ordre de ~90 rôles seniors. Le DSE §5.5 ne chiffre pas d'effectif, seulement des parts budgétaires (45-55 % masse salariale). | `[HYPOTHÈSE À VALIDER]` : la liste de rôles du cadrage de mission est un **cadre de mobilisation de compétences** (quels profils Claude doit incarner selon la tâche), pas un organigramme RH figé. Elle est compatible avec l'organisation par tribus du DSE §5.2 (12 tribus). Pas de contradiction réelle, mais à ne pas confondre avec un effectif réel à budgéter. |

---

## A2. Cartographie des bounded contexts & mapping fonctionnalités → services → couches

### A2.1 Inventaire des bounded contexts (consolidé RAT §1.2 + extensions A1#4)

| Bounded context | Service | Responsabilité | Couplage | Statut |
|---|---|---|---|---|
| Identité & KYC | `identity-svc` (extrait) | Onboarding, KYC/KYB, niveaux, sessions | Sync | RAT |
| Compte & Ledger | `ledger-svc` (extrait) | RIB, soldes, écritures double entrée, réconciliation, **sous-comptes (Junior, poches Pro)** | Sync, cœur | RAT (+ext) |
| Paiements | `payments-svc` (extrait) | P2P, QR, factures, airtime, interop | Sync + async | RAT |
| Cartes | `cards-svc` | Émission virtuelle/physique, contrôles, cartes corporate | Sync | RAT |
| Diaspora | `remit-svc` | Corridors entrants/sortants, change | Async | RAT |
| Encaissement | `acquiring-svc` | Louma Pay, TPE/SoftPOS, règlement J+1 | Sync + async | RAT |
| Mass Payout | `masspay-svc` (extrait) | Import bénéficiaires, lots, planification, paie | Async, orchestré | RAT |
| Épargne & Tontines | `savings-svc` | Coffres, arrondi, rémunérée, tontines | Async | RAT |
| Investissement | `invest-svc` | BRVM, UMOA-Titres via SGI | Async | RAT |
| Crédit & Assurance | `credit-svc` | Avances, fractionné, micro-assurance | Async | RAT |
| Business & Pro | `business-svc` | Comptes pro, multi-utilisateurs RBAC, notes de frais, **facturation électronique** | Sync | RAT (+ext) |
| Conformité/AML | `compliance-svc` (extrait) | Filtrage, surveillance, déclarations CENTIF | Sync + async | RAT |
| Fraude/Risque | `risk-svc` | Scoring temps réel, plafonds dynamiques | Sync | RAT |
| Notifications | `notif-svc` | Push, SMS, e-mail, in-app | Async | RAT |
| Fidélité | `loyalty-svc` | Louma Points, parrainage | Async | RAT |
| Données & IA | `data-platform` | Lakehouse, features, modèles | Async | RAT |
| **Abonnements & facturation** *(nouveau)* | `subscription-svc` | Plans freemium (Particuliers : Louma/Plus/Premium/Ultra ; Business : Pro Free/Grow/Scale/Enterprise), cycle de facturation, droits/plafonds dérivés du plan | Sync | **Proposé (A1#4a)** |
| **Back-office / Ops** *(nouveau)* | `ops-console` (app interne, pas un BC métier au sens strict) | UI interne consommant `identity-svc`, `compliance-svc`, `risk-svc`, `masspay-svc`… pour revue KYC/KYB, supervision anti-fraude, support niveau 2/3 | Sync (BFF dédié) | **Proposé (A1#4b)** |

> Comptes Junior (A1#4c) : pas un BC séparé — sous-compte `ledger-svc` (type `JUNIOR`, plafonds paramétrables) + contrôle parental porté par `identity-svc` (lien tuteur↔mineur) et restitué dans l'app mobile. À confirmer en ADR dédié si la complexité justifie l'extraction.

### A2.2 Mapping fonctionnalités CDC → services → couches (vérification "aucun orphelin")

| Domaine CDC | Fonctionnalités clés | Service(s) | Couches |
|---|---|---|---|
| §2.1 Compte/identité | Onboarding KYC biométrique, RIB, multi-devises, niveaux KYC, cartes virt./phys. | `identity-svc`, `ledger-svc`, `cards-svc` | Mobile, Web, Backend, Sécurité, Banque |
| §2.2 Paiements/transferts | P2P, QR, factures, airtime, interop, liens, récurrents | `payments-svc` + switch | Mobile, USSD, Backend, Événementiel, Banque |
| §2.3 Diaspora | Corridors entrants/sortants, change, retrait agent | `remit-svc` | Backend, Banque, Événementiel |
| §2.4 Épargne | Coffres, arrondi, épargne rémunérée, tontines, objectifs partagés | `savings-svc` + partenaire banque/SFD | Mobile, Backend, Banque |
| §2.5 Investissement | BRVM, UMOA-Titres, fonds, crypto (cadre BCEAO) | `invest-svc` + SGI | Mobile, Backend, Banque |
| §2.6 Budget/fidélité/Junior/assurance | Budget, Louma Points, Comptes Junior, micro-assurance | `loyalty-svc`, `ledger-svc` (sous-comptes Junior), `credit-svc` (assurance) | Mobile, Backend, Données |
| §2.7 Plans particuliers | Louma / Plus / Premium / Ultra | **`subscription-svc`** | Mobile, Web, Backend |
| §3.1-3.2 Comptes pro | Louma Pro/Business, KYB, sous-comptes, virements de masse | `business-svc`, `identity-svc`, `masspay-svc`, `ledger-svc` | Console, Backend, Banque |
| §3.3 Encaissement | Louma Pay, QR, TPE/SoftPOS, plug-ins e-commerce, règlement J+1 | `acquiring-svc` | Console, API Merchant, Backend |
| §3.4 Cartes corporate / dépenses | Cartes équipe, contrôles, notes de frais OCR/IA, workflows approbation | `cards-svc`, `business-svc`, `data-platform` | Console, Backend, Données/IA |
| §3.5 API/Intégrations | Business API, Merchant API, webhooks, exports | `api-gateway` + BFF | API, Sécurité |
| §3.6 Valeur ajoutée/sécurité Business | Facturation électronique, tableau de bord trésorerie, gestion d'équipe RBAC, crédit partenaire | `business-svc`, `credit-svc` | Console, Backend, Banque |
| §3.7 Plans Business | Pro Free/Grow/Scale/Enterprise | **`subscription-svc`** | Console, Backend |
| §5.2 Back-office interne | KYC/KYB, conformité, support, anti-fraude, supervision | **`ops-console`** (BFF dédié) + `identity-svc`, `compliance-svc`, `risk-svc` | Backend, Sécurité |
| §5.2 USSD | Solde, envoi, retrait, factures, airtime | `ussd-gateway` + `payments-svc`/`ledger-svc` | USSD, Backend |
| RAT §11 | Paiement de masse (import, lots, planification, approbation, AML, webhooks) | `masspay-svc` | Console, API Business, Backend, Événementiel |

✅ Vérification : chaque ligne du CDC (sections 2 et 3) trouve un service propriétaire ; les deux ajouts (`subscription-svc`, `ops-console`) couvrent les zones identifiées en A1#4. Aucune fonctionnalité orpheline résiduelle identifiée à ce stade.

### A2.3 Dépendances inter-domaines critiques (pour limiter le couplage — RAT principe 1)

```
identity-svc ──► ledger-svc ──► payments-svc ──► {acquiring, remit, masspay}
      │                │                              │
      ▼                ▼                              ▼
 compliance-svc ◄── risk-svc ◄────────────────── tous les flux financiers
      │
      ▼
 subscription-svc (plafonds/droits dérivés du plan) ──► ledger-svc, cards-svc
```
Règle : `ledger-svc` n'est **jamais** appelant, toujours appelé (cœur). `compliance-svc`/`risk-svc` sont des dépendances transverses synchrones sur le chemin critique de toute opération financière.

---

## A3. Structure de dépôt(s), conventions, socle outillage

### A3.0 Décision préalable bloquante : organisation des dépôts

Voir contradiction A1#1. Trois options évaluées :

| Option | Description | Verdict |
|---|---|---|
| A. Étendre `avismaker` | Ajouter Louma dans le monorepo pnpm/TS existant, à côté de ReviewPlate | **Rejetée** — stack cible RAT est polyglotte (Go, Kotlin/JVM, Kotlin Multiplatform, Swift), un monorepo pnpm/TS n'est pas l'outil adapté à la majorité des services ; mélanger un produit fintech régulé avec une SaaS d'avis clients dans le même dépôt crée un couplage de gouvernance/sécurité non souhaitable. |
| B. Un seul nouveau monorepo polyglotte "louma" | Tous les services (Go, Kotlin, TS, mobile) dans un seul dépôt avec outillage multi-langage (Bazel/Nx, etc.) | **Rejetée** — overhead d'outillage très élevé pour une équipe en formation (cf. DSE 3.1 : éviter la sur-ingénierie) ; va à l'encontre du choix "monolithe modulaire, vitesse initiale". |
| C. **Polyrepo organisé par plan d'ownership (tribus)**, avec dépôts "plateforme" partagés | Un dépôt par grand regroupement de services partageant un runtime + des dépôts transverses (`louma-contracts`, `louma-platform`, `louma-design-system`, `louma-infra`) | **Retenue** |

→ **Décision** : créer une nouvelle organisation/espace de dépôts Louma, structurée en C. `avismaker`/ReviewPlate n'est **pas modifié** et reste hors périmètre Louma.

`[HYPOTHÈSE À VALIDER]` : confirmation par le comité que la création de nouveaux dépôts est possible dans l'environnement actuel (un seul dépôt `25flash/avismaker` est dans le scope de cette session). **Tant que ce point n'est pas tranché**, il est proposé de matérialiser la Phase A (présent document + ADR + backlog) dans `avismaker/docs/` (zone neutre, documentation uniquement, aucun impact sur ReviewPlate), et de ne créer les dépôts de code Louma qu'après validation explicite et accès aux dépôts cibles.

### A3.1 Structure de dépôts proposée (cible, une fois validée)

```
louma-contracts/        # source de vérité des contrats : OpenAPI, proto gRPC, schémas Kafka (Avro/JSON Schema), versionnés
louma-platform/         # libs partagées : observabilité, idempotence, clients Kafka/Postgres, conventions hexagonales
louma-design-system/    # composants UI partagés (Web particulier, Console Business)
louma-infra/            # IaC (Terraform/Pulumi), Kubernetes manifests/Helm, pipelines GitOps

louma-core/             # monolithe modulaire Kotlin/JVM : business-svc, savings-svc, invest-svc, credit-svc,
                         #   loyalty-svc, subscription-svc, compliance-svc (module), risk-svc (module), notif-svc
louma-ledger/           # Go — ledger-svc (extrait, cœur)
louma-payments/         # Go — payments-svc, acquiring-svc (extraits)
louma-masspay/          # Go — masspay-svc (extrait)
louma-identity/         # service identité/KYC + IAM (extrait dès J1 pour isolement sécurité)
louma-remit/            # remit-svc (diaspora)
louma-cards/            # cards-svc (scope PCI-DSS cloisonné)

louma-gateway/          # API Gateway + BFFs (Mobile, Web, Business) — TS/Node ou Go selon ADR-0002
louma-mobile/           # Kotlin Multiplatform (logique partagée) + Swift/Kotlin (UI native)
louma-web/               # Web particulier — React/TS
louma-console-business/ # Console Business — React/TS
louma-ussd/              # ussd-gateway

louma-data-platform/     # data-platform (lakehouse, feature store, scoring)
```

### A3.2 Conventions transverses

| Sujet | Convention |
|---|---|
| Branches | `main` protégée, `feature/<bc>-<sujet>`, `release/*`. Trunk-based avec feature flags pour le pilotage de charge (jamais pour masquer un périmètre). |
| Commits | Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`...) — facilite changelog et traçabilité conformité. |
| Lint/format | Go : `gofmt`/`golangci-lint`. Kotlin : `ktlint`/`detekt`. TS : ESLint + Prettier. Pré-commit hooks obligatoires. |
| Tests | Pyramide : unitaire (domaine pur, sans I/O) → intégration (Testcontainers Postgres/Kafka) → contrat (Pact ou équivalent contre `louma-contracts`) → E2E (parcours CDC §2.2 des user journeys). Chemins financiers critiques : 100 % couverts, aucun merge sans test sur `ledger-svc`/`payments-svc`/`masspay-svc`. |
| CI/CD | GitOps, pipelines par dépôt : build → tests → scan sécurité (SAST/dependency) → image → déploiement canary/blue-green (RAT §14.2). |
| IaC | Terraform (ou équivalent), versionné, revue obligatoire, environnements `dev`/`staging`/`prod` isolés, cloud régional/souverain (RAT §14.1). |
| Observabilité | OpenTelemetry partout (logs/metrics/traces, `trace_id` propagé) dès le premier service du Lot 1 — non négociable (CDC, RAT principe 9). |
| Secrets | Coffre central (Vault ou équivalent cloud), zéro secret en clair, rotation automatique. |

---

## A4. Premiers ADR

Détail complet dans `docs/adr/`. Index dans `docs/DECISIONS.md`. Liste :

| ADR | Titre | Statut |
|---|---|---|
| 0000 | Organisation des dépôts Louma vs `avismaker`/ReviewPlate | Proposé — **bloquant** |
| 0001 | Style d'architecture cible : monolithe modulaire + extraction ciblée | Proposé |
| 0002 | Stack technique par couche | Proposé |
| 0003 | Stratégie de données (OLTP/OLAP, règles ledger) | Proposé |
| 0004 | Stratégie API (contrats, idempotence, erreurs, versionnage) | Proposé |
| 0005 | Stratégie événementielle (Kafka, outbox, sagas) | Proposé |
| 0006 | Stratégie de sécurité (zero-trust, IAM, PCI-DSS, conformité) | Proposé |
| 0007 | Extensions de cartographie : `subscription-svc`, `ops-console`, Comptes Junior | Proposé |

---

## A5. Backlog priorisé par lots de construction

Principe (DSE §2.4) : l'ordre de construction suit les **dépendances techniques**, pas l'ordre d'ouverture au public (qui est simultané, intégral, au Go-Live). Le chemin critique (agrément BCEAO + partenaires régulés + Core/Ledger) est suivi en parallèle, hors numérotation de lots.

### Chemin critique (hors lots, suivi comité dédié — DSE §5.3/§5.4)
1. Dépôt dossier agrément BCEAO (cible M3) — bloquant absolu Go-Live.
2. Contractualisation + intégration technique partenaires régulés (banque/SFD, SGI, assureur, switch GIM-UEMOA, schémas cartes) — cible M10 signature, intégré avant M15.
3. Conseil juridique UEMOA engagé dès J0.

### Lot 1 — Socle (non négociable)
| Item | BC | Dépendances | Notes |
|---|---|---|---|
| Identité/KYC + IAM (OAuth2/OIDC, mTLS) | `identity-svc` | — | Premier service ; socle authn/authz pour tous |
| Ledger (partie double, idempotence, réconciliation) | `ledger-svc` | identity (tenant) | Cœur ; zéro innovation (RAT principe 4) |
| Compte/RIB + sous-comptes (dont Junior) | `ledger-svc` | ledger core | Couvre A1#4c |
| Cartes virtuelles (puis physiques) | `cards-svc` | ledger, identity | Scope PCI-DSS dès le départ |
| Paiements de base (P2P, QR) | `payments-svc` | ledger, identity, risk (scoring) | Outbox dès le premier flux |
| Conformité (AML/KYC) + Fraude/Risque (socle) | `compliance-svc`, `risk-svc` | identity | Transverse, sur chemin critique de chaque flux |
| API Gateway + BFF Mobile (squelette) | `louma-gateway` | identity | Contrats versionnés `/v1/` dès J1 |
| Observabilité + CI/CD + IaC + environnements | `louma-platform`, `louma-infra` | — | Avant tout code métier |

### Lot 2 — Réseau & flux
| Item | BC | Dépendances |
|---|---|---|
| Encaissement marchand (Louma Pay, QR statique/dynamique, TPE/SoftPOS, règlement J+1) | `acquiring-svc` | payments, ledger |
| Diaspora & corridors (entrants prioritaires, change transparent) | `remit-svc` | ledger, compliance |
| Interopérabilité (switch GIM-UEMOA) | `payments-svc` + ACL switch | payments |
| Business & Pro (KYB, sous-comptes, RBAC) | `business-svc` | identity, ledger |
| Paiement de masse (`masspay-svc`) — import, carnet, lots, approbation, planification, exécution résiliente | `masspay-svc` | ledger, payments, compliance, risk |
| Coffres / arrondi (épargne non rémunérée) | `savings-svc` (module non régulé) | ledger |
| Abonnements & facturation (plans freemium) | `subscription-svc` | identity, ledger |
| Console Business (v1) + USSD (opérations critiques) | `louma-console-business`, `louma-ussd` | gateway, payments, ledger |

### Lot 3 — Services régulés (via partenaires agréés)
| Item | BC | Dépendances |
|---|---|---|
| Épargne rémunérée + tontines digitales | `savings-svc` + ACL banque/SFD | Lot 1-2 savings, partenaire signé |
| Investissement (BRVM, UMOA-Titres, fonds) | `invest-svc` + ACL SGI | ledger, compliance, partenaire SGI signé |
| Crédit (avances, fractionné) + micro-assurance | `credit-svc` + ACL banque/SFD/assureur | ledger, risk, partenaires signés |
| Notes de frais OCR/IA | `business-svc` + `data-platform` | business-svc Lot 2, data-platform |
| Back-office / Ops console | `ops-console` | identity, compliance, risk, masspay |
| Data platform temps réel (scoring fraude/crédit) | `data-platform` | événements Lot 1-2 stabilisés |

### Convergence
Les 3 lots convergent vers les jalons DSE §5.3 (J1→J6) puis le **Go-Live unique M16-M18**, conditionné par les 7 critères Go/No-Go binaires (DSE §5.6) — repris intégralement, sans dérogation.

---

## Décisions à valider par le comité avant Phase B 🛑

1. **(Bloquant)** Organisation des dépôts (A3.0 / ADR-0000) : confirmer la création de nouveaux dépôts Louma, séparés de `avismaker`/ReviewPlate, et obtenir l'accès correspondant.
2. Confirmer la stack RAT (Go/Kotlin/KMP/React) comme cible définitive (ADR-0002), avec ses implications de recrutement/formation.
3. Valider les 3 extensions de cartographie : `subscription-svc`, `ops-console`, traitement des Comptes Junior (ADR-0007).
4. Valider le calendrier cible M16-M18 (vs M16 CDC) — contradiction A1#3.
5. Confirmer le statut du document présent (`docs/`) comme zone de travail tant que les dépôts cibles ne sont pas créés.
