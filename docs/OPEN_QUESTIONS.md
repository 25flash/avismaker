# Questions ouvertes / hypothèses à valider — Louma

## Tranchées par le comité (2026-06-14)
- **Organisation des dépôts** (ADR-0000) : nouveaux dépôts dédiés Louma, validé. **Reste à préciser** : nom de l'organisation/compte GitHub cible, et confirmation que la création de ~17 dépôts est souhaitée immédiatement ou progressivement (par lot de construction).
- **Stack technique** (ADR-0002) : stack polyglotte RAT (Go / Kotlin-JVM / Kotlin Multiplatform / React-TS) retenue comme cible.
- **Extensions de cartographie** (ADR-0007) : `subscription-svc`, `ops-console`, Comptes Junior comme sous-comptes `ledger-svc` — validés.

## Encore ouvertes
3. **BFF / API Gateway** (ADR-0002) : Go (cohérence avec les services critiques) ou TS/Node (proximité équipe Web) ? Non tranché par le RAT — à trancher en Phase B.
5. **Calendrier cible** : M16 (CDC) vs M16-M18 (DSE) — retenir la fourchette M16-M18 par défaut, à confirmer.
6. **`[HYPOTHÈSE À VALIDER]`** Capital réglementaire EME exigé par la BCEAO, masse salariale réelle, conditions des partenaires (banque/SFD/SGI/assureur) : trois inconnues majeures signalées par le DSE §5.5, non documentées dans les 3 sources — à documenter avant tout engagement financier.
7. **`[HYPOTHÈSE À VALIDER]`** La liste de ~90 rôles seniors du cadrage de mission est un cadre de mobilisation de compétences (quels profils incarner selon la tâche), pas un organigramme RH figé à budgéter littéralement.
