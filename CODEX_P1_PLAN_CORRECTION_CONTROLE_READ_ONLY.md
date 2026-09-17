# CODEX — P1 PLAN DE CORRECTION CONTRÔLÉ
## LE CHÂTEAU DU MWANA
## À LIRE AVANT TOUTE MODIFICATION

OBJECTIF

Transformer les constats des audits P0.1 → P0.5 en un plan de correction exécutable, SANS MODIFIER LE PROJET pendant cette première étape.

Sources de référence :
- Cahier des charges V3.0 intégré dans CODEX_P0_5_CAHIER_VS_CODE_AUDIT_READ_ONLY.md
- BRIDGE_P0_5_CAHIER_VS_CODE_AUDIT.md
- CODEX_P0_4_AUDIT_FONCTIONNEL_TOTAL_READ_ONLY.md
- baseline historique : 647ef32181c75cb9d4a3e9e98fe3de2d80ef0978
- état réel actuel du worktree

RÈGLE HUMAINE ABSOLUE

L'humain décide.
Aucune modification ne doit être exécutée à cette étape.

INTERDICTIONS

- Ne modifier aucun fichier.
- Ne créer aucun fichier de correction.
- Ne supprimer aucun fichier.
- Ne modifier ni Git ni branche.
- Aucun git add/commit/reset/clean/restore/checkout/merge/rebase/pull/push.
- Aucune migration Prisma.
- Aucun changement PostgreSQL/Supabase/RLS.
- Aucun seed/update/delete.
- Aucun paiement, facture, réservation ou mutation réelle.
- Aucun changement Auth/RBAC.
- Ne lire ni afficher les secrets .env.

MISSION

Produire UNIQUEMENT un plan de correction priorisé et traçable.

ÉTAPE 1 — RELIRE LES SOURCES

Lire :
1. BRIDGE_P0_5_CAHIER_VS_CODE_AUDIT.md
2. CODEX_P0_4_AUDIT_FONCTIONNEL_TOTAL_READ_ONLY.md
3. CODEX_P0_5_CAHIER_VS_CODE_AUDIT_READ_ONLY.md
4. Le cahier des charges V3.0 intégré dans P0.5.

Ne pas refaire inutilement tout l'audit.
Vérifier uniquement les éléments nécessaires à la construction du plan.

ÉTAPE 2 — ÉTABLIR LES BLOCS DE CORRECTION

Créer des lots indépendants.

BLOC P0-A — BASELINE / PROVENANCE
- baseline 647ef32
- trois fichiers post-checkpoint
- images et rapports non versionnés
- stratégie de conservation
- aucune restauration automatique

BLOC P0-B — SÉCURITÉ / RLS / ISOLATION
- RLS
- policies
- rôle runtime
- isolation CLIENT
- IDOR
- URLs directes
- auth serveur
- permissions
IMPORTANT :
ne proposer aucune modification RLS tant que la matrice et les preuves ne sont pas établies.

BLOC P0-C — RÉSERVATION
- disponibilité
- capacité
- ressources
- double réservation
- double allocation
- transactions
- concurrence
- statut réservation
- statut paiement
- location
- isolation client
- E2E réel non destructif

BLOC P1-D — FINANCE
- paiement manuel
- paiements partiels/multiples
- solde
- facture
- numéro de facture
- remboursement
- PDF
- historique
- autorisations
- idempotence/double clic
IMPORTANT :
ne jamais effectuer de vraie mutation financière pendant la planification.

BLOC P1-E — LOGISTIQUE / MAINTENANCE
- équipements
- stocks
- mouvements
- allocations
- missions
- livraisons
- incidents
- maintenance
- disponibilité
- historique
- actions UI réellement branchées

BLOC P1-F — CRM / FIDÉLITÉ
- Customer 360
- historique
- points
- niveaux
- récompenses
- earn
- redeem
- règles métier
- RBAC
- UI

BLOC P1-G — IMPORTS / EXPORTS / AUTOMATISATIONS
- CSV
- Excel
- normalisation
- doublons
- prévisualisation
- validation humaine
- import effectif
- exports
- alertes stock
- défaut équipement
- client fidèle
- notifications

BLOC P1-H — CMS / COMMUNICATION
- pages
- médias
- galerie
- publication/visibilité
- contact
- notifications
- templates
- audit log
- préparation WhatsApp
- Payment Bridge désactivé V1

BLOC P2-I — CALENDRIER / RECHERCHE / PERSONNALISATION
- calendrier métier
- réservations
- ressources
- missions
- livraisons
- maintenance
- filtres
- recherche globale
- widgets
- raccourcis
- personnalisation dashboard

BLOC P2/P3-J — DESIGN / UX / ACCESSIBILITÉ
- identité Château du Mwana
- responsive
- mobile
- tablette
- desktop
- contraste
- clavier
- focus
- reduced motion
- loading/error/empty
- navigation
- animations
- dark/light
- cohérence des 5 dashboards

ÉTAPE 3 — POUR CHAQUE BLOC

Donner :

1. Pourquoi le bloc existe.
2. Exigences du cahier concernées.
3. État actuel.
4. Fichiers/routes/services concernés.
5. Dépendances.
6. Risque.
7. Préconditions.
8. Modifications qui seraient nécessaires.
9. Tests nécessaires.
10. Critère de sortie.
11. Ce qui NE doit PAS être modifié.
12. Décision humaine requise.

ÉTAPE 4 — ORDRE D'EXÉCUTION

Proposer un ordre strict.

Format :

PHASE 0 — décisions humaines / baseline
PHASE 1 — sécurité et réservation
PHASE 2 — finance
PHASE 3 — logistique/maintenance
PHASE 4 — CRM/fidélité
PHASE 5 — imports/exports/automatisations
PHASE 6 — CMS/communication
PHASE 7 — calendrier/recherche/personnalisation
PHASE 8 — design/UX/accessibilité
PHASE 9 — certification finale

Ne pas proposer de travailler sur P2/P3 avant stabilisation des P0/P1.

ÉTAPE 5 — MATRICE DE SUIVI

Créer :

| ID | Bloc | Exigence cahier | Problème actuel | Fichiers | Dépendances | Correction prévue | Test | Critère de sortie | Priorité | Décision humaine |

ÉTAPE 6 — LOTS EXÉCUTABLES

Pour chaque bloc, proposer de petits lots.

Exemple :

LOT P1-D1
Objectif :
Fichiers concernés :
Changements autorisés :
Changements interdits :
Test avant :
Modification :
Test après :
Preuve attendue :
Rollback prévu :
Validation humaine :

Les lots doivent être petits, réversibles et indépendants.

ÉTAPE 7 — TESTS

Construire une stratégie de test :

- statique
- typecheck
- build
- unit
- integration
- E2E
- sécurité
- responsive
- accessibilité

Séparer :
TEST SANS ÉCRITURE
TEST AVEC BASE DE TEST ISOLÉE
TEST FINANCIER
TEST PRODUCTION

Aucun test destructif ou financier réel ne doit être proposé comme première étape.

ÉTAPE 8 — RISQUES DE RÉGRESSION

Identifier les zones où une correction peut casser :
- réservation
- Auth
- RBAC
- client isolation
- catalogue public
- paiements
- factures
- dashboards
- Prisma
- RLS
- responsive

ÉTAPE 9 — DÉCISIONS HUMAINES

Lister clairement les décisions qui appartiennent à l'humain :

- baseline Git
- fichiers post-checkpoint
- stratégie RLS/runtime role
- règles de prix
- statuts réservation
- remboursements
- fiscalité/numérotation facture
- périmètre V1
- rôle LOGISTICIAN
- imports/exports
- automatisations
- calendrier
- personnalisation

Ne pas décider à la place de l'humain.

ÉTAPE 10 — DEFINITION OF DONE

Définir les conditions permettant de dire :

READY FOR IMPLEMENTATION
puis plus tard :
IMPLEMENTED
TESTED
VALIDATED

Ne jamais confondre ces états.

RAPPORT

Créer uniquement :

BRIDGE_P1_PLAN_CORRECTION_CONTROLE.md

Aucun autre fichier.

VERDICT FINAL DU PLAN

Le rapport doit terminer par :

- BLOQUÉ POUR IMPLÉMENTATION
ou
- PRÊT POUR IMPLÉMENTATION CONTRÔLÉE

Le verdict porte uniquement sur la capacité à commencer les corrections, PAS sur la qualité finale du produit.

IMPORTANT FINAL

Ne modifier absolument rien.
Le but de cette étape est de préparer les corrections pour validation humaine avant exécution.
