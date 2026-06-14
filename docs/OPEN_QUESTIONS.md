# Questions ouvertes / hypothèses à valider — Louma

1. **[BLOQUANT] Organisation des dépôts** (ADR-0000) : le dépôt `avismaker` actuel contient "ReviewPlate", un produit sans rapport avec Louma. Faut-il créer de nouveaux dépôts dédiés à Louma (recommandé), et si oui sont-ils accessibles dans l'environnement de session actuel ?
2. **Stack technique** (ADR-0002) : confirmation de la stack polyglotte RAT (Go / Kotlin-JVM / Kotlin Multiplatform / React-TS) comme cible définitive, avec ses implications de recrutement/formation par rapport à l'outillage TS existant dans `avismaker`.
3. **BFF / API Gateway** (ADR-0002) : Go (cohérence avec les services critiques) ou TS/Node (proximité équipe Web) ? Non tranché par le RAT.
4. **Extensions de cartographie** (ADR-0007) : validation de `subscription-svc`, `ops-console`, et du traitement des Comptes Junior comme sous-comptes `ledger-svc`.
5. **Calendrier cible** : M16 (CDC) vs M16-M18 (DSE) — retenir la fourchette M16-M18 par défaut, à confirmer.
6. **`[HYPOTHÈSE À VALIDER]`** Capital réglementaire EME exigé par la BCEAO, masse salariale réelle, conditions des partenaires (banque/SFD/SGI/assureur) : trois inconnues majeures signalées par le DSE §5.5, non documentées dans les 3 sources — à documenter avant tout engagement financier.
7. **`[HYPOTHÈSE À VALIDER]`** La liste de ~90 rôles seniors du cadrage de mission est un cadre de mobilisation de compétences (quels profils incarner selon la tâche), pas un organigramme RH figé à budgéter littéralement.
