# ADR-0004 — Stratégie API

Statut : **Validé**

## Hypothèse
Les apps (mobile, web, console), les partenaires régulés et les marchands consommeront des contrats stables, et toute opération financière mutante doit être rejouable sans double effet.

## Décision
- API-first : tout domaine expose un contrat versionné `/v1/`. Quatre couches (RAT §5.1) : API internes (gRPC), API BFF (REST/JSON), API Business (REST/JSON + webhooks), API Merchant (REST/JSON + SDK).
- Standards transverses obligatoires (RAT §5.2) : OAuth2/OIDC + mTLS inter-services et partenaires ; `Idempotency-Key` sur tout POST mutant financier ; pagination par curseur ; dépréciation via en-tête `Sunset` ; erreurs au format RFC 7807 (`type`, `title`, `status`, `detail`, `trace_id`) ; quotas/rate-limiting à la gateway.
- Webhooks sortants (API Business/Merchant) signés HMAC, horodatés, rejouables ; 2xx attendu sous 10 s sinon backoff exponentiel + DLQ.
- Référentiel central de contrats (`louma-contracts`), génération de clients/serveurs pour garantir la conformité au contrat.

## Alternatives rejetées
1. **REST partout, y compris en interne** : rejetée — RAT préconise gRPC pour les contrats stricts et la performance inter-services ; REST réservé à la compatibilité externe.
2. **Idempotence "best effort" (déduplication applicative ad hoc par service)** : rejetée — le RAT impose un contrat unique (`Idempotency-Key` + outbox) pour garantir l'« exactly-once » métier sur 100 % des opérations financières, condition de la confiance "banque-grade".

## Trade-offs
- gRPC interne impose un outillage de génération de code dans chaque langage (Go, Kotlin) — coût d'outillage initial, mutualisé via `louma-contracts`/`louma-platform`.
- RFC 7807 partout impose une discipline d'erreur uniforme dès le Lot 1, y compris sur des services secondaires.

## Risques
- API mal gouvernées → dépendances fragiles, failles de sécurité. Mitigation : sécurité et quotas obligatoires dès la conception (gateway), revue de contrat avant publication.
- Rupture de contrat non versionnée → incidents partenaires. Mitigation : CI bloquante sur breaking change sans bump de version majeure.

## KPI
- Taux de disponibilité des API.
- Temps d'intégration partenaire.
- Nombre d'incidents liés à des ruptures de contrat (cible 0).

## Responsable(s)
Architectes logiciels, API Engineers, Backend.
