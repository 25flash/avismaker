# ADR-0005 — Stratégie événementielle

Statut : **Validé**

## Hypothèse
Certaines opérations exigent une réponse immédiate et cohérente (paiement, autorisation), d'autres tolèrent une propagation asynchrone (notifications, fidélité, analytique, scoring).

## Décision
- Architecture mixte : synchrone (gRPC) pour le critique, événementielle (Kafka) pour la propagation (RAT §3.4/§6).
- Patron Transactional Outbox obligatoire : écriture ledger + insertion outbox dans la même transaction Postgres, relais CDC/poller vers Kafka. Aucune publication d'événement hors transaction.
- Conventions de topics : `<domaine>.<entité>.<version>`, clé de partition = identifiant d'agrégat (ordre garanti par compte/lot), schémas gérés par registre avec compatibilité ascendante.
- Garanties : at-least-once côté bus, idempotence côté consommateur (déduplication par `event_id`) → exactly-once métier. DLQ par consommateur avec alerting et procédure de rejeu.
- SAGAs inter-services (ex. transfert diaspora = change + ledger + partenaire) chorégraphiées par événements avec étapes compensatoires explicites.

## Alternatives rejetées
1. **Tout synchrone** : rejetée — ne tient pas la charge, couplage fort entre tous les domaines (RAT §3.4).
2. **Tout événementiel (y compris débit/crédit)** : rejetée — la cohérence à terme sur l'argent est incompatible avec l'exigence "cohérence forte sur l'argent" (principe non négociable).

## Trade-offs
- L'outbox + relais CDC ajoute une latence de propagation (non critique pour les flux async ciblés) et un composant opérationnel supplémentaire (relais) à exploiter.
- La chorégraphie par SAGA complexifie le débogage des flux multi-services (diaspora) — compensé par `trace_id` corrélé de bout en bout.

## Risques
- Perte de messages → cible 0, mitigée par rétention longue + DLQ + alerting.
- Incohérences visibles côté utilisateur si l'async est mal cantonné aux flux non critiques → mitigation : liste explicite des flux synchrones vs asynchrones validée en revue d'architecture par BC.

## KPI
- Latence des transactions synchrones (cf. SLO RAT §4.3/§14.3).
- Délai de propagation des événements.
- Taux de pertes de messages (cible 0).
- Profondeur des DLQ.

## Responsable(s)
Architectes logiciels, Backend, Platform Engineering (Kafka).
