# P1 — Plan de correction contrôlé

## Cadre

Plan préparé à partir de P0.4, P0.5, du cahier V3.0 et de l'état actuel. Aucune correction, migration, test, mutation de données ou opération Git n'a été effectuée. `647ef32` est une référence historique, non une baseline choisie.

## PHASE 0 — Décisions humaines / baseline

### P0-A — Baseline / provenance

| Point | Plan |
|---|---|
| Pourquoi | `master` ne contient pas l'application observée ; `647ef32` est un instantané non branché ; trois fichiers actuels n'ont aucun équivalent Git. |
| Cahier / état | Précondition à toute responsabilité métier et à toute certification. |
| Périmètre | `src/app/(protected)/layout.tsx`, `src/components/layout/AppSidebar.tsx`, `src/lib/auth/user.ts`, 27 fichiers sans historique, refs Copilot. |
| Dépendances / risque | Aucun changement sûr tant que la source de vérité n'est pas choisie ; risque de perte ou d'écrasement. |
| Préconditions | Inventaire validé par le propriétaire ; stratégie écrite de conservation des rapports/images/IDE. |
| Changements futurs | Seulement après décision : rattacher ou versionner explicitement les éléments approuvés. |
| Tests / sortie | Hashes et inventaire comparés ; baseline humaine nommée ; aucun fichier ambigu. |
| Ne pas modifier | Aucun reset, clean, restore, checkout ni suppression automatique. |
| Décision humaine | Choisir baseline, sort des trois fichiers et des 27 éléments non historisés. |

## PHASE 1 — Sécurité et réservation

### P0-B — Sécurité / RLS / isolation

| Point | Plan |
|---|---|
| Pourquoi | RLS/policies runtime ne sont pas prouvées localement ; absence de Zod ; l'isolation client ne peut pas être validée statiquement. |
| Cahier | Authentification, permissions, IDOR, URLs directes, upload sûr, fuite de données. |
| Périmètre | `src/lib/auth/user.ts`, `src/lib/supabase/*`, middleware, actions, pages admin/client, `prisma/schema.prisma`. |
| Dépendances | P0-A et matrice de permissions approuvée ; environnement DB de test isolé. |
| Changements futurs | Définir politiques et stratégie rôle runtime avant toute écriture RLS ; validation Zod aux frontières ; règles upload. |
| Tests / sortie | Tests anonymes/authentifiés, matrice URL directe, tentatives IDOR et isolation customerId sur DB isolée. |
| Ne pas modifier | Production, secrets, rôle admin Supabase ou RLS avant preuve/matrice. |
| Décision humaine | Source d'autorité des rôles, politique RLS, limites et formats upload. |

### P0-C — Réservation / concurrence

| Point | Plan |
|---|---|
| Pourquoi | Le workflow existe mais force `CONFIRMED`; le verrou porte la formule, non chaque inventaire ; concurrence non validée. |
| Cahier | Capacité, conflits, double réservation/allocation, transaction, statuts séparés, location, isolation client. |
| Périmètre | `BookingWizardClient`, `reservation-actions.ts`, `reservation.ts`, `availability.ts`, modèles Reservation/Allocation/Payment. |
| Dépendances | P0-B, règles prix/statuts, données isolées. |
| Changements futurs | Spécifier transition DRAFT/CONFIRMED/CANCELLED, idempotence et verrouillage allocation ; ne pas modifier avant décision. |
| Tests / sortie | Unit disponibilité ; intégration concurrence à deux requêtes ; E2E non destructif avec comptes/données dédiés. |
| Ne pas modifier | Données réelles, schéma ou statut métier par défaut sans validation. |
| Décision humaine | Prix forfaitaire/par participant, règles de confirmation, annulation et réservation publique. |

## PHASE 2 — Finance

### P1-D — Paiements / facture

| Point | Plan |
|---|---|
| Pourquoi | Encaissement et facture sont branchés, mais remboursement est orphelin, PDF absent, fiscalité et numérotation indécises. |
| Cahier | Paiements manuels, partiels/multiples, solde, remboursement, facture, PDF, historique et autorisations. |
| Périmètre | `payment.ts`, `payment-actions.ts`, `invoice.ts`, `invoice-actions.ts`, `PaymentForm`, `InvoiceButton`, schéma finance. |
| Dépendances | P0-B, P0-C, politique comptable/fiscale approuvée. |
| Changements futurs | Concevoir idempotence, remboursement autorisé, séquence facture, PDF et journal d'audit ; Payment Bridge reste désactivé V1. |
| Tests / sortie | Tests DB isolée : double clic, paiements cumulés, dépassement, remboursement, facture unique ; aucun test financier réel. |
| Ne pas modifier | Transactions/production, Payment Bridge Android, secrets prestataires. |
| Décision humaine | Taxes, format/compteur facture, remboursement, opérateurs Mobile Money. |

## PHASE 3 — Logistique / maintenance

### P1-E — Logistique / maintenance

| Point | Plan |
|---|---|
| Pourquoi | Modèles et écrans de lecture existent ; CRUD de mouvements, livraisons, incidents, missions et maintenance n'est pas établi. |
| Cahier | Stock, équipement, allocation, mission, livraison, incident, emplacement, historique, remise en service. |
| Périmètre | Pages `admin/logistics/*`, services logistique, modèles Inventory/Allocation/Mission/Delivery/Maintenance. |
| Dépendances | P0-C et matrice ADMIN/SUPERVISOR/LOGISTICIAN. |
| Changements futurs | Introduire actions/services atomiques par workflow, alertes et audit ; vérifier indisponibilité équipement. |
| Tests / sortie | Intégration DB isolée par mouvement/allocation/maintenance ; E2E rôle logisticien ; aucun stock réel. |
| Ne pas modifier | Quantités réelles ni allocations avant environnement de test. |
| Décision humaine | Règles d'état, responsabilités mission/livraison, seuils et alertes. |

## PHASE 4 — CRM / fidélité

### P1-F — CRM / fidélité

| Point | Plan |
|---|---|
| Pourquoi | Customer 360 est lisible, mais earn/redeem et notifications sont orphelins ; score V3 non défini. |
| Cahier | Historique client, achats, factures, notes, score, niveaux, récompenses, transactions. |
| Périmètre | `crm.ts`, `loyalty.ts`, actions CRM/fidélité, pages CRM, modèles Loyalty*. |
| Dépendances | P0-B, P1-D, règles de calcul approuvées. |
| Changements futurs | Écrire règles explicites et actions UI protégées ; assurer idempotence et audit. |
| Tests / sortie | Unit score ; intégration earn/redeem/solde ; IDOR client ; E2E admin/client isolé. |
| Ne pas modifier | Soldes ou niveaux de clients réels. |
| Décision humaine | Pondérations, expiration, récompenses et droits d'attribution. |

## PHASE 5 — Imports / exports / automatisations

### P1-G — Import / export / événements

| Point | Plan |
|---|---|
| Pourquoi | CSV est exposé mais `processImport` ne réalise pas l'insertion ; Excel, exports et alertes sont absents. |
| Cahier | Normalisation, doublons, prévisualisation, validation humaine, import définitif, exports et alertes métier. |
| Périmètre | `imports.ts`, `imports-actions.ts`, pages imports, `ImportJob`, notifications, analytics. |
| Dépendances | P0-B, format de données et règles doublons validés. |
| Changements futurs | Pipeline preview→validation→commit, exports autorisés, événements stock/défaut/fidélité. |
| Tests / sortie | Fixtures anonymisées ; import DB isolée ; tests doublons/reprise ; export sans données production. |
| Ne pas modifier | Fichiers ou anciennes données de production. |
| Décision humaine | Formats V1, validateurs humains, règles de fusion et destinataires alertes. |

## PHASE 6 — CMS / communication

### P1-H — CMS / communication

| Point | Plan |
|---|---|
| Pourquoi | CMS, médias, galerie, contact et templates sont présents ; couverture audit/publication et communication métier est partielle. |
| Cahier | Publication, visibilité, contact, notifications, audit, préparation WhatsApp ; bot désactivé V1. |
| Périmètre | `cms.ts`, media/gallery/contact/notification services et actions, pages CMS. |
| Dépendances | P0-B et règles de publication. |
| Changements futurs | Compléter audit, validation contenu/upload et notifications ; documenter contrat WhatsApp sans l'activer. |
| Tests / sortie | Tests de rôle, publication publique, upload type/taille, audit sur DB isolée. |
| Ne pas modifier | Bucket/objets médias réels, WhatsApp ou Payment Bridge. |
| Décision humaine | Gouvernance contenu, rétention média et périmètre de la préparation WhatsApp. |

## PHASE 7 — Calendrier / recherche / personnalisation

### P2-I — Outils de pilotage

| Point | Plan |
|---|---|
| Pourquoi | Aucune route calendrier métier, recherche globale ou widgets configurables n'est détectée. |
| Cahier | Calendrier réservations/ressources/missions/livraisons/maintenance, filtres, recherche, widgets et raccourcis. |
| Dépendances | P0-C, P1-E et modèles stabilisés. |
| Changements futurs | Définir agrégat calendrier, index/recherche, préférences utilisateurs et permissions. |
| Tests / sortie | Tests de filtres/rôle/pagination et E2E navigation sur données isolées. |
| Ne pas modifier | P0/P1 non stabilisés. |
| Décision humaine | Vue calendrier V1, recherche indexée et widgets retenus. |

## PHASE 8 — Design / UX / accessibilité

### P2/P3-J — UX

| Point | Plan |
|---|---|
| Pourquoi | Base visuelle, aria, loading/error existent ; contrastes, mobile, clavier, motion et dashboards ne sont pas validés. |
| Cahier | Identité, responsive, focus, reduced motion, dark/light, navigation et cohérence. |
| Dépendances | Parcours P0/P1 stables. |
| Changements futurs | Corriger après preuve visuelle/accessibilité, sans masquer erreurs métier. |
| Tests / sortie | Tests viewport, clavier, lecteur d'écran, contraste et reduced motion ; revue humaine. |
| Ne pas modifier | Logique métier ou permissions pour une correction cosmétique. |
| Décision humaine | Direction visuelle finale et niveau WCAG cible. |

## Matrice de suivi

| ID | Bloc | Problème actuel | Fichiers principaux | Dépendances | Correction prévue | Test | Critère de sortie | Priorité | Décision humaine |
|---|---|---|---|---|---|---|---|---|---|
| A1 | P0-A | Baseline ambiguë | Git + 3 fichiers | Inventaire | Choix de référence | Hash/inventaire | Baseline approuvée | P0 | Oui |
| B1 | P0-B | RLS/isolation non prouvées | auth/supabase/actions | A1 | Matrice puis politiques | Sécurité DB isolée | IDOR/RLS prouvés | P0 | Oui |
| C1 | P0-C | Concurrence/statuts | réservation/disponibilité | B1 | Verrous/transitions | Multi-requête isolée | Pas de surallocation | P0 | Oui |
| D1 | P1-D | Remboursement/PDF | finance/invoice UI | B1,C1 | Workflow financier | Finance isolée | Solde/audit corrects | P1 | Oui |
| E1 | P1-E | Opérations logistiques absentes | logistics | C1 | Actions atomiques | Intégration isolée | Historique complet | P1 | Oui |
| F1 | P1-F | Fidélité incomplète | CRM/loyalty | B1,D1 | Règles + UI | Unit/intégration | Score et droits prouvés | P1 | Oui |
| G1 | P1-G | Import fictif/export absent | imports | B1 | Pipeline contrôlé | Fixtures isolées | Preview/validation/export | P1 | Oui |
| H1 | P1-H | Audit/communication partiels | CMS/media/contact | B1 | Gouvernance + audit | Rôle/upload | Publication sûre | P1 | Oui |
| I1 | P2-I | Calendrier/recherche absents | dashboards | C1,E1 | Outils pilotage | E2E isolée | Filtres/rôles corrects | P2 | Oui |
| J1 | P2/P3-J | UX non validée | public/dashboards | P0/P1 | Corrections mesurées | A11y/visuel | Critères UX validés | P2/P3 | Oui |

## Lots exécutables proposés

| Lot | Objectif / changements autorisés après validation | Interdits | Test avant / après | Preuve / rollback |
|---|---|---|---|---|
| P0-A1 | Décider et documenter baseline | Toute restauration automatique | Inventaire/hash | Décision écrite ; aucune mutation Git |
| P0-B1 | Écrire matrice accès et plan RLS | Toute policy ou DB | Revue statique | Matrice approuvée ; document supprimable |
| P0-C1 | Spécifier statuts/prix/concurrence | Changement réservation | Unit pure | Spécification approuvée |
| P0-C2 | Implémenter protections réservation sur DB de test | Production | Intégration concurrence | Résultats reproductibles ; rollback Git standard autorisé ultérieurement |
| P1-D1 | Définir contrat paiement/facture/remboursement | Transaction réelle | Unit pure | Contrat approuvé |
| P1-E1 | Cartographier opérations logistiques et droits | Stock réel | Revue statique | Matrice actions/rôles |
| P1-F1 | Définir score et règles fidélité | Solde réel | Unit pure | Cas de calcul validés |
| P1-G1 | Concevoir fixtures et preview import | Import réel | Parse sans écriture | Jeux anonymisés |
| P1-H1 | Définir événements audit/notification | WhatsApp/bucket réel | Unit pure | Liste d'événements |
| P2-I1/J1 | Maquetter calendrier et critères UX | P0/P1 instables | Tests visuels | Validation produit |

Chaque lot exige validation humaine avant modification ; toute implémentation devra préciser fichiers, test avant, test après, preuve et rollback effectif.

## Stratégie de tests

| Niveau | Sans écriture | Base de test isolée | Interdit en première étape |
|---|---|---|---|
| Statique/typecheck/build | Lint, TypeScript, analyse dépendances | N/A | Assimiler un build à une validation |
| Unit | Prix, statuts, score, parse CSV, permissions pures | Optionnel | Secrets ou données réelles |
| Intégration | N/A | RLS, concurrence, paiement, allocation, import | Base partagée/production |
| E2E | Navigation publique et redirections | Comptes et données dédiés | Paiement/réservation réels |
| Sécurité | Analyse URL/actions | IDOR, RBAC, RLS, upload | Contournement production |
| UX | Revue responsive/a11y locale | Données de démonstration | Masquer une erreur fonctionnelle |

## Risques de régression

- Réservation : prix, référence, capacité, allocation et statuts.
- Auth/RBAC/RLS : accès direct, IDOR, isolation client, rôle runtime.
- Finance : total payé, double soumission, facture, remboursement et audit.
- Catalogue public : publication, prix affiché et formulaire de réservation.
- Prisma/migrations : contrat, Temporal, relations et politiques externes.
- Dashboards et UX : requêtes, données filtrées, mobile et erreurs/loading.

## Definition of Done

- **READY FOR IMPLEMENTATION** : baseline et décisions humaines validées, matrice permissions/règles métier approuvée, environnement de test isolé disponible, lots et rollback approuvés.
- **IMPLEMENTED** : lot modifié conformément à son périmètre, revue du diff et tests statiques terminés.
- **TESTED** : tests adaptés exécutés et résultats conservés sur environnement autorisé.
- **VALIDATED** : scénario métier réel approuvé par responsable humain ; ce statut ne résulte ni d'un fichier, ni d'un build seul.

## Verdict final du plan

**BLOQUÉ POUR IMPLÉMENTATION** — des décisions humaines indispensables manquent encore : baseline, stratégie RLS/rôle runtime, règles prix/statuts, finance/fiscalité/remboursements, rôle LOGISTICIAN et périmètre V1. Le plan est prêt à être revu et validé, mais aucune correction ne doit commencer avant ces choix.
