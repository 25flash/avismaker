# ADR-0002 — Stack technique par couche

Statut : **Proposé**

## Hypothèse
Le RAT (qui prime sur le DSE/CDC pour les décisions techniques) recommande une stack polyglotte spécifique par couche. Le dépôt `avismaker` actuel (pnpm/TypeScript) ne préjuge pas de la stack Louma (cf. ADR-0000 : nouveaux dépôts).

## Décision
Retenir la stack RAT §3.1/§7 comme cible :

| Couche | Stack | Services concernés |
|---|---|---|
| Services critiques | Go | `ledger-svc`, `payments-svc`, `masspay-svc`, `acquiring-svc` |
| Services métier | Kotlin/JVM | `business-svc`, `savings-svc`, `invest-svc`, `credit-svc`, `loyalty-svc`, `subscription-svc`, modules `compliance`/`risk`/`notif` dans `louma-core` |
| Communication interne | gRPC (sync) + REST via gateway | tous |
| Base transactionnelle | PostgreSQL, une instance logique par BC | tous |
| Cache / locks / idempotence | Redis | tous services mutants |
| Bus d'événements | Apache Kafka | flux async (RAT §6.1) |
| Recherche | OpenSearch | bénéficiaires, transactions, audit |
| Mobile | UI native (Swift/Kotlin) + logique partagée Kotlin Multiplatform | `louma-mobile` |
| Web particulier / Console Business | React + TypeScript | `louma-web`, `louma-console-business` |
| BFF / API Gateway | À trancher (Go pour cohérence avec services critiques, ou Node/TS pour proximité avec l'équipe Web) | `louma-gateway` |

## Alternatives rejetées
1. **Stack unique TypeScript/Node (alignée sur l'outillage `avismaker` existant)** pour tous les services : rejetée — le RAT exclut explicitement le "tout JS" pour les composants critiques (latence, concurrence) ; reprendre l'outillage existant créerait une fausse économie au prix d'un écart au document normatif.
2. **Stack unique Go partout** (y compris services métier) : rejetée par le RAT — Kotlin/JVM jugé plus productif pour les domaines métier à logique riche (DSE/RAT trade-off "écosystème mûr, typage fort, productivité").

## Trade-offs
- Polyglotte = coût de formation/recrutement sur 3 écosystèmes (Go, Kotlin/JVM, Kotlin Multiplatform) + TS pour le front. Compensé par `louma-platform` (libs partagées : observabilité, idempotence, clients Kafka/Postgres) pour réduire la duplication.
- Le choix BFF/Gateway (Go vs TS) reste ouvert — `[HYPOTHÈSE À VALIDER]`, à trancher en Phase B selon qui possède l'API Gateway (tribu Plateforme & SRE vs Expérience).

## Risques
- Dispersion des compétences si chaque tribu choisit sa propre stack hors cadre → mitigation : ce ADR est la seule source de vérité, tout écart = nouvel ADR.

## KPI
- % de services conformes à la stack ADR-0002 au Lot 1.
- Couverture de `louma-platform` (libs partagées) par les services Lot 1.

## Responsable(s)
Architectes logiciels (senior+++), Backend, Mobile (iOS/Android), Platform Engineering.
