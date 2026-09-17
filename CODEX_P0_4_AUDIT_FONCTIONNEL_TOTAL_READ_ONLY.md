# CODEX — P0.4 AUDIT FONCTIONNEL TOTAL — READ-ONLY
## Le Château du Mwana

PROJET :
C:\laragon\www\CHATEAU DU MWANA

OBJECTIF
Comparer le code réellement présent dans le dépôt avec le cahier des charges et produire une matrice factuelle de couverture fonctionnelle.

IMPORTANT :
Le checkpoint historique principal identifié est :
647ef32181c75cb9d4a3e9e98fe3de2d80ef0978

Le répertoire de travail actuel contient des écarts post-checkpoint. NE RESTAURE RIEN et NE CHANGE RIEN.

RÈGLES ABSOLUES
- READ-ONLY.
- Ne modifie, crée, supprime ou renomme aucun fichier.
- Aucun git add/commit/reset/clean/restore/checkout/merge/rebase/pull/push.
- Aucune migration.
- Aucun changement PostgreSQL, Prisma, Supabase, RLS, Auth ou RBAC.
- Aucun test avec écriture en base.
- Aucun script seed/update/delete/maintenance.
- Ne lis ni n'affiche les secrets des fichiers .env.
- Ne conclus jamais qu'une fonctionnalité est validée uniquement parce qu'un fichier, une route ou une fonction existe.
- Distingue strictement : CODE PRÉSENT / BRANCHEMENT UI / WORKFLOW COMPLET / TESTÉ / VALIDÉ.

SOURCES À UTILISER
1. Le cahier des charges présent dans le projet s'il existe.
2. Les rapports/audits présents dans le projet s'ils existent.
3. Le code réel du dépôt.
4. Le checkpoint 647ef32 comme référence historique uniquement.
Si le cahier des charges n'est pas présent dans le dépôt, signale-le explicitement et utilise les éléments métier déjà documentés dans les fichiers du projet, sans inventer.

AUDIT 1 — PUBLIC
Vérifie :
- accueil
- présentation
- services
- formules
- galerie
- contact
- réservation
- catalogue public
- publication services/formules
- données commerciales
- responsive
- accessibilité
- SEO
- loading/error/empty
- CTA réellement fonctionnels

AUDIT 2 — AUTHENTIFICATION / RBAC
Pour ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN, CLIENT :
- login/session
- protection routes
- contrôle serveur
- contrôle UI
- séparation des permissions
- isolation client
- accès direct aux URLs
- données filtrées côté serveur
Ne simule pas une validation E2E si aucun compte/session n'est disponible.

AUDIT 3 — DASHBOARDS
Pour chaque rôle :
ADMIN
SUPERVISOR
SECRETARY
LOGISTICIAN
CLIENT

Vérifie :
- route
- données réellement chargées
- KPIs
- alertes
- actions
- tableaux/listes
- liens
- états loading/error/empty
- cohérence avec le rôle
- actions qui sont décoratives ou sans backend

AUDIT 4 — RÉSERVATIONS
Vérifie toute la chaîne :
choix prestation → date → heure → participants → disponibilité → client → résumé → confirmation → référence.

Vérifie :
- capacité
- disponibilité
- conflits ressources
- double réservation
- transaction/concurrence
- statut réservation
- statut paiement
- annulation
- historique
- location
- réservation par rôle
- isolation client

AUDIT 5 — FINANCE
Vérifie :
- Payment
- PaymentTransaction
- Refund
- Invoice
- InvoiceItem
- numbering
- calculs
- soldes
- paymentStatus
- encaissement manuel
- facture
- remboursement
- autorisations
- double clic/doublon
- branchement frontend → Server Action → service → DB
Ne réalise aucune mutation financière.

AUDIT 6 — CATALOGUE
Vérifie :
- catégories
- services
- formules
- prix
- variantes
- disponibilité
- ressources
- publication
- réservation depuis catalogue
- gel du prix dans ReservationItem

AUDIT 7 — LOGISTIQUE
Vérifie réellement :
- équipements
- stocks
- mouvements
- allocations
- maintenance
- missions
- livraisons
- emplacements
- historique
- conflits de ressources
- permissions logisticien/superviseur
- boutons sans backend

AUDIT 8 — CRM / FIDÉLITÉ
Vérifie :
- clients
- historique
- réservations
- achats
- paiements
- factures
- fidélité
- points
- récompenses
- notes
- earn/redeem
- RBAC
- fonctions orphelines

AUDIT 9 — CMS / COMMUNICATION
Vérifie :
- pages
- médias
- galerie
- publication/visibilité
- templates
- messages contact
- notifications
- WhatsApp
- imports
- exports
- audit logs

AUDIT 10 — ANALYTICS / CALENDRIER / RECHERCHE
Vérifie :
- KPIs
- statistiques
- graphiques
- filtres de période
- comparaisons
- calendrier métier
- recherche globale
- exports

AUDIT 11 — DESIGN / UX
Vérifie :
- identité Le Château du Mwana
- palette
- typographie
- composants
- cohérence public/back-office
- 5 dashboards distincts
- responsive mobile/tablette/desktop
- navigation
- états loading/error/empty
- focus clavier
- contraste
- reduced motion
- light/dark
- CTA
- animations spécifiques au Château
- absence d'éléments génériques/free-template
- débordements horizontaux

AUDIT 12 — BACKEND / ARCHITECTURE
Cartographie :
Frontend → actions → services métier → Prisma → PostgreSQL/Supabase.

Vérifie :
- validation Zod
- auth
- RBAC
- transactions
- locks/concurrence
- calculs financiers
- filtrage customerId
- erreurs
- cache/revalidation
- fonctions orphelines
- routes/action sans backend
- backend sans UI

AUDIT 13 — PRISMA / DB / RLS
Audit documentaire uniquement :
- schema.prisma
- migrations
- RLS
- policies
- rôles
- relation avec Supabase Auth
- drift déjà identifié
NE MODIFIE RIEN et ne tente aucune reconciliation.

AUDIT 14 — TESTS
Cartographie sans exécution :
- unit
- integration
- E2E
- Playwright
- scripts npm
Pour chaque fonctionnalité critique :
CODE PRÉSENT / TEST PRÉSENT / TEST EXÉCUTÉ / VALIDATION RÉELLE.

MATRICE FINALE
Construis une matrice détaillée :

Domaine | Exigence du cahier | Code trouvé | Frontend | Backend | DB | Auth/RBAC | Test | État | Preuve | Risque

États autorisés :
- ABSENT
- PARTIEL
- IMPLÉMENTÉ
- TESTÉ
- VALIDÉ
- NON VÉRIFIABLE

Attention :
IMPLÉMENTÉ ≠ TESTÉ
TESTÉ ≠ VALIDÉ

P0 / P1 / P2 / P3
Classe ensuite les écarts :
P0 = bloque une fonction métier critique ou la sécurité/intégrité.
P1 = fonction importante inutilisable/incomplète.
P2 = amélioration importante.
P3 = finition/non bloquant.

RAPPORT FINAL
A. Référence du cahier utilisé
B. Baseline 647ef32 et écarts actuels
C. Public
D. Auth/RBAC
E. Dashboards
F. Réservations
G. Finance
H. Catalogue
I. Logistique
J. CRM/Fidélité
K. CMS/Communication
L. Analytics/Calendrier/Recherche
M. Design/UX
N. Backend/Architecture
O. Prisma/DB/RLS
P. Tests
Q. Matrice exhaustive
R. P0/P1/P2/P3
S. Fonctions orphelines / boutons décoratifs
T. Risques
U. Plan de correction proposé — SANS EXÉCUTER
V. Décisions nécessitant validation humaine
W. VERDICT

VERDICT AUTORISÉ :
- PRÊT
- PARTIEL
- NON PRÊT
- BLOQUÉ

Aucune modification pendant cet audit.
