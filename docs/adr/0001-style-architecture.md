# ADR-0001 — Style d'architecture cible : monolithe modulaire + extraction ciblée

Statut : **Proposé**

## Hypothèse
L'équipe démarre avec un effectif limité (cf. DSE 3.1) mais doit absorber, au Go-Live, des volumes "banque-grade" sur les domaines critiques (ledger, paiements, mass payout, conformité).

## Décision
Architecture en **monolithe modulaire structuré par bounded contexts** (cf. RAT §1, DSE Phase 3.1), avec **extraction immédiate en services indépendants** des domaines à forte contrainte d'échelle ou d'isolement : `ledger-svc`, `payments-svc`, `compliance-svc`, `masspay-svc`. Les autres domaines (`business-svc`, `savings-svc`, `invest-svc`, `credit-svc`, `loyalty-svc`, `subscription-svc`, `risk-svc` module, `notif-svc`) sont co-déployés dans `louma-core` (monolithe modulaire Kotlin/JVM) jusqu'à preuve d'un besoin d'isolement.
Chaque module respecte une architecture hexagonale (ports & adapters), avec des frontières d'interface strictes permettant une extraction future sans réécriture (RAT §3.2).

## Alternatives rejetées
1. **Microservices intégral dès J1** : rejetée (RAT §3.1) — overhead opérationnel et réseau disproportionné pour une équipe naissante ; risque de sur-ingénierie identifié comme "Élevé" par le comité.
2. **Monolithe pur (non modulaire)** : rejetée — crée une dette à terme et empêche d'isoler le risque de conformité/PCI-DSS des domaines régulés, contraire au principe "aucune dette technique volontaire".

## Trade-offs
- Le monolithe modulaire `louma-core` nécessite une discipline de revue d'architecture stricte pour éviter de dégénérer en "monolithe enchevêtré" (risque identifié par le DSE).
- Les 4 services extraits dès J1 (ledger, payments, compliance, masspay) augmentent la complexité opérationnelle initiale, mais c'est un coût assumé car ce sont les domaines où l'isolement est non négociable (argent, conformité).

## Risques
- Mauvaise délimitation des bounded contexts → dépendances cachées. Mitigation : contrats d'interface explicites versionnés dans `louma-contracts`, revue d'architecture à chaque PR touchant une frontière de module.
- Tentation d'extraire trop tôt d'autres modules par confort technique plutôt que par besoin réel. Mitigation : extraction conditionnée à un ADR documentant la contrainte d'échelle/isolement constatée.

## KPI
- Temps de build/déploiement de `louma-core`.
- Taux de couplage inter-modules (dépendances directes hors interfaces publiées).
- Latence p99 des 4 services extraits vs SLO (RAT §4.3 / §14.3).

## Responsable(s)
Architectes logiciels (senior+++), tribu Socle Compte & Core.
