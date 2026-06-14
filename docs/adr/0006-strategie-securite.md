# ADR-0006 — Stratégie de sécurité

Statut : **Proposé**

## Hypothèse
Louma vise un niveau de sécurité "institution financière systémique" dès le Lot 1 ; un lancement intégral signifie que tous les domaines (y compris cartes, mass payout) sont exposés dès le Go-Live, sans période de rodage à périmètre réduit.

## Décision
Sécurité transverse et by-design, défense en profondeur (RAT §12) :
- IAM : OAuth2/OIDC, MFA, biométrie, gestion des sessions/appareils, RBAC/ABAC.
- Chiffrement : TLS partout, mTLS inter-services, chiffrement colonne pour PII, KMS/HSM pour les clés.
- Protection applicative : WAF, validation stricte des entrées, anti-injection, rate-limiting, bot management.
- Cartes : tokenisation PAN, environnement cloisonné, scope PCI-DSS minimal (`cards-svc` isolé dès le Lot 1).
- Fraude/Risque : scoring temps réel, plafonds dynamiques, règles + ML, gel automatique (`risk-svc` sur le chemin critique de chaque opération financière).
- SOC actif, SIEM, playbooks, astreinte 24/7, tests d'intrusion réguliers, revue de sécurité **bloquante** à chaque jalon.
- Zero-trust : aucun appel inter-service de confiance par défaut ; moindre privilège ; step-up authentication graduée selon le risque de l'opération (montant, nouveau bénéficiaire, lot de paie).

## Alternatives rejetées
1. **Sécurité ajoutée après coup par module** : rejetée — explicitement exclue par le principe "rien n'est ajouté après coup" ; un lancement intégral ne laisse aucune fenêtre de "sécurisation progressive" post-Go-Live.
2. **Scope PCI-DSS étendu à toute la plateforme** : rejetée au profit d'un cloisonnement (`cards-svc`) qui minimise la surface d'audit PCI sans diluer les exigences sur le reste de la plateforme (qui reste néanmoins chiffré/zero-trust).

## Trade-offs
- Step-up authentication alourdit certains parcours (ajout de bénéficiaire, lot de paie) — arbitré par niveau de risque, pas systématique.
- Astreinte 24/7 dès le Lot 1 sur les services critiques a un coût opérationnel (tribu Sécurité + Plateforme & SRE) assumé dès le départ (lancement intégral).

## Risques
- Step-up mal calibré → friction excessive ou insuffisante. Mitigation : matrices de risque par type d'opération, revues régulières avec Risk Analysts.
- Dépendance à un seul KMS/HSM → mitigation : procédures de rotation et de reprise documentées (PRA sécurité).

## KPI
- Temps de détection/réponse aux incidents.
- Taux de fraude.
- Résultats des tests d'intrusion (0 critique non résolu avant Go-Live, cf. critères Go/No-Go).

## Responsable(s)
Security Engineers, AppSec, IAM Engineers, SOC Analysts.
