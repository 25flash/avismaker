# ADR-0007 — Extensions de cartographie : `subscription-svc`, `ops-console`, Comptes Junior

Statut : **Proposé**

## Hypothèse
Le tableau de traçabilité RAT §15 ne couvre pas explicitement : (a) les plans freemium (CDC §2.7/§3.7), (b) le back-office interne (CDC §5.2), (c) les Comptes Junior (CDC §2.6). Le CDC prime sur le RAT pour le périmètre : ces fonctionnalités ne peuvent pas rester orphelines d'architecture.

## Décision
1. **`subscription-svc`** (nouveau BC, Kotlin/JVM, dans `louma-core`) : gère les plans Particuliers (Louma / Plus / Premium / Ultra) et Business (Pro Free / Grow / Scale / Enterprise), le cycle de facturation des abonnements, et expose les droits/plafonds dérivés du plan consommés par `ledger-svc` (plafonds), `cards-svc` (type de carte), `remit-svc` (tarifs change).
2. **`ops-console`** (application interne, BFF dédié dans `louma-gateway`) : ne porte pas de logique métier propre — agrège les vues nécessaires aux équipes Conformité/Risque/Support depuis `identity-svc` (revue KYC/KYB), `compliance-svc` (alertes AML, déclarations CENTIF), `risk-svc` (scoring, gel automatique), `masspay-svc` (supervision des lots). Accès restreint par RBAC interne distinct du RBAC client.
3. **Comptes Junior** : traités comme un type de sous-compte dans `ledger-svc` (type `JUNIOR`, plafonds paramétrables), avec lien de tutelle porté par `identity-svc` (relation tuteur↔mineur) et restitution dans l'app mobile (vue dédiée "famille"). Pas d'extraction en service séparé sauf besoin futur documenté.

## Alternatives rejetées
1. **Plier les abonnements dans `business-svc`/`ledger-svc`** : rejetée — les plans concernent à la fois Particuliers et Business et pilotent des droits transverses à plusieurs BC (cartes, change, plafonds) ; un service dédié évite de disperser cette logique transverse dans chaque BC consommateur.
2. **`ops-console` comme bounded context métier avec sa propre base** : rejetée — créerait une duplication de données de conformité/risque déjà détenues par `compliance-svc`/`risk-svc`, violant le principe "un service = une source de vérité".
3. **Comptes Junior en BC séparé (`junior-svc`)** : rejetée à ce stade — complexité insuffisante pour justifier l'extraction (principe "extraction sur preuve de contrainte", ADR-0001) ; à reconsidérer si les règles de contrôle parental deviennent significativement complexes.

## Trade-offs
- `subscription-svc` introduit une dépendance transverse supplémentaire que plusieurs BC doivent consulter (droits par plan) — mitigé par mise en cache locale des droits avec invalidation par événement (`subscription.plan_changed.v1`).
- `ops-console` sans données propres signifie une dépendance forte à la disponibilité des API des BC sources — acceptable car ce sont des BC du Lot 1.

## Risques
- Couplage excessif si `subscription-svc` devient un goulot d'étranglement consulté en synchrone par tous les flux de paiement. Mitigation : propagation des changements de plan par événement + cache local, lecture synchrone réservée à la création de compte/changement de plan.
- RBAC interne (`ops-console`) mal isolé du RBAC client → risque de privilège excessif. Mitigation : IAM dédié aux utilisateurs internes, revue périodique des droits (cf. ADR-0006).

## KPI
- Nombre de fonctionnalités CDC non couvertes par le tableau de traçabilité (cible 0, suivi en continu — cf. RAT §15).
- Latence de propagation `subscription.plan_changed.v1` vers les BC consommateurs.

## Responsable(s)
Product Manager, Product Owner, Architectes logiciels, Business Analyst.
