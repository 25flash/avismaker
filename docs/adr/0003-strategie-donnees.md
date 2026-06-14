# ADR-0003 — Stratégie de données

Statut : **Proposé**

## Hypothèse
Le ledger doit rester l'unique source de vérité des soldes (principe non négociable RAT §2), tandis que les besoins analytiques/IA (scoring fraude, crédit, BI) exigent volume et flexibilité.

## Décision
- Séparation stricte OLTP / OLAP : un store PostgreSQL par bounded context (aucune base partagée), alimentation du lakehouse analytique par CDC sur événements Kafka (bronze/silver/gold + feature store).
- Aucun service ne lit la base d'un autre service : accès uniquement via API ou événements.
- Règles de données (RAT §4.3) : montants entiers en plus petite unité monétaire, devise explicite ; soft-delete interdit sur données financières (append-only, contre-passation pour corrections) ; chaque ligne financière porte `trace_id` + `actor_id` ; PII chiffrées au niveau colonne (KMS), pseudonymisées dans le lakehouse.
- Résidence des données conforme à la réglementation locale (souveraineté), chiffrement au repos et en transit.

## Alternatives rejetées
1. **Base partagée multi-BC** : rejetée — viole l'isolation des bounded contexts, crée un couplage fort empêchant l'évolution indépendante des domaines, et complique l'audit (qui a écrit quoi).
2. **Float pour les montants** : rejetée — source classique d'erreurs d'arrondi en finance ; le RAT l'exclut explicitement.

## Trade-offs
- Duplication contrôlée de données (ex. solde mis en cache côté `payments-svc` pour affichage) au prix d'une gouvernance de lignage stricte.
- CDC + lakehouse ajoute une latence de fraîcheur pour l'analytique (acceptable, l'OLTP reste la vérité immédiate).

## Risques
- Divergence entre projections et ledger → mitigation : réconciliation continue (RAT §13.1), alertes sur écart.
- Fuite de PII dans le lakehouse → mitigation : pseudonymisation obligatoire avant ingestion silver/gold, revue de gouvernance des données.

## KPI
- Taux de réconciliation ledger (cible 100 %).
- Fraîcheur des données analytiques.
- Couverture du lignage de données.

## Responsable(s)
Data Engineers, Architectes logiciels, tribu Données & IA.
