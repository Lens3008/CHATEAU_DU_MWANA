# CODEX — LOT 1 IMPLEMENTATION
# LE CHÂTEAU DU MWANA
# RÉSERVATION + SÉCURITÉ — CORRECTION DIRECTE DU CODE

## OBJECTIF

Nous avons terminé la phase d'audit global.
NE REFAIS PAS un nouvel audit global.

Utilise comme état de référence les constats déjà établis dans :
- BRIDGE_P0_5_CAHIER_VS_CODE_AUDIT.md
- BRIDGE_P1_PLAN_CORRECTION_CONTROLE.md
- le cahier des charges V3.0 déjà étudié.

MISSION :
corriger maintenant le code réel du projet sur le LOT 1 :
1. sécurité d'accès ;
2. isolation CLIENT ;
3. réservation ;
4. disponibilité ;
5. capacité ;
6. ressources/allocation ;
7. concurrence ;
8. idempotence ;
9. cohérence des statuts.

Le travail doit être effectué dans le vrai projet :

C:\laragon\www\CHATEAU DU MWANA

IMPORTANT :
`647ef32181c75cb9d4a3e9e98fe3de2d80ef0978` est une référence historique uniquement.
NE RESTAURE PAS ce commit.
NE remplace PAS le worktree actuel par ce commit.

==================================================
RÈGLE ABSOLUE
==================================================

Tu peux modifier le CODE nécessaire au LOT 1.

Tu ne dois PAS :
- reset Git ;
- clean Git ;
- checkout ;
- restore ;
- rebase ;
- merge ;
- pull ;
- push ;
- commit ;
- supprimer des fichiers sans nécessité ;
- modifier arbitrairement le cahier ;
- modifier le contenu commercial existant sans nécessité ;
- inventer des règles métier ;
- créer des comptes utilisateurs ;
- effectuer de vrais paiements ;
- créer de vraies factures financières ;
- effectuer des réservations métier réelles dans la base partagée ;
- modifier la production.

Pour Prisma/RLS :
- ne fais PAS de migration destructive ;
- ne fais PAS de changement massif de schéma ;
- ne modifie PAS les policies RLS existantes sans nécessité démontrée ;
- si une modification DB/RLS est indispensable, STOPPE avant cette modification et explique précisément pourquoi, ce qui doit être changé et demande validation humaine.

==================================================
ÉTAPE 1 — ÉTAT ACTUEL
==================================================

Inspecte uniquement les fichiers nécessaires au LOT 1.

Commence par vérifier :
- pwd ;
- branche Git ;
- HEAD ;
- présence du projet ;
- état Git.

Ne touche pas Git.

Inspecte ensuite :
- auth ;
- middleware ;
- requireAuth ;
- requireRole ;
- user/customer resolution ;
- reservation-actions ;
- reservation service ;
- availability service ;
- allocation service ;
- BookingWizard ;
- routes/pages réservation ;
- modèles Prisma Reservation, ReservationItem, Service, Formula, ServiceResource, Allocation/InventoryAllocation et relations nécessaires ;
- tests existants concernant auth/réservation.

Ne refais pas un audit global.
Ne parcours pas tout le dépôt sans raison.

==================================================
ÉTAPE 2 — CORRIGER L'AUTHENTIFICATION ET L'AUTORISATION
==================================================

Objectif :

Toutes les opérations métier du LOT 1 doivent être protégées côté serveur.

Règles :

- ne jamais faire confiance au rôle envoyé par le navigateur ;
- ne jamais faire confiance au customerId envoyé par le navigateur ;
- ne jamais faire confiance à performedById envoyé par le navigateur ;
- récupérer l'utilisateur authentifié côté serveur ;
- appliquer requireAuth/requireRole existants lorsqu'ils sont adaptés ;
- préserver la matrice RBAC déjà établie.

Matrice existante à préserver :

ADMIN :
global.

SUPERVISOR :
réservations view/update selon le périmètre existant.

SECRETARY :
création/lecture/mise à jour des réservations selon le périmètre existant.

LOGISTICIAN :
lecture des réservations ; pas de création de réservation.

CLIENT :
ses propres réservations uniquement.

Ne transforme pas les permissions sans justification.

==================================================
ÉTAPE 3 — ISOLATION CLIENT
==================================================

Corriger tous les chemins du LOT 1 où un CLIENT pourrait :

- consulter la réservation d'un autre client ;
- modifier la réservation d'un autre client ;
- annuler la réservation d'un autre client ;
- récupérer des informations via un ID direct ;
- contourner l'interface en appelant directement une Server Action.

Règle :

L'identité du client doit venir de la session serveur puis être comparée au customerId réel.

Un customerId fourni par le navigateur ne doit jamais permettre de changer de propriétaire.

Appliquer la même logique aux :
- réservations ;
- reservation items ;
- locations liées à la réservation ;
- paiements affichés dans le contexte de la réservation si concernés par le LOT 1.

Ne casse pas les accès ADMIN/SUPERVISOR/SECRETARY.

==================================================
ÉTAPE 4 — RÉSERVATION
==================================================

Préserver les structures et services existants lorsque possible.

Corriger uniquement les problèmes réellement présents.

La création doit vérifier côté serveur :

- formule existante ;
- formule publiée pour un CLIENT ;
- disponibilité ;
- capacité ;
- participants ;
- date/heure ;
- ressources nécessaires ;
- cohérence des données ;
- propriétaire client ;
- montant calculé côté serveur.

IMPORTANT :

Le navigateur ne doit jamais imposer :
- totalAmount ;
- unitPrice ;
- totalPrice ;
- paymentStatus ;
- statut administratif ;
- customerId d'un autre utilisateur.

Les prix doivent venir du catalogue côté serveur.

Les totaux doivent être recalculés côté serveur.

==================================================
ÉTAPE 5 — DISPONIBILITÉ ET CAPACITÉ
==================================================

Vérifier et corriger la logique pour éviter :

- dépassement de capacité ;
- réservation sur formule indisponible ;
- conflit évident de ressources ;
- allocation incohérente.

Ne suppose pas de nouvelles règles commerciales.

Respecte les règles existantes du modèle et du cahier.

Si une règle métier manque réellement :
NE L'INVENTE PAS.
Signale-la dans le rapport et conserve le comportement actuel si possible.

==================================================
ÉTAPE 6 — CONCURRENCE
==================================================

C'est une partie importante du LOT 1.

La réservation et l'allocation ne doivent pas reposer uniquement sur une vérification préalable en mémoire.

Rechercher les fenêtres du type :

1. SELECT disponibilité
2. autre requête
3. INSERT réservation/allocation

qui permettraient deux demandes concurrentes de dépasser une capacité.

Utiliser les mécanismes transactionnels existants lorsque possible.

Pour toute correction de concurrence :
- transaction ;
- verrouillage adapté ;
- vérification dans la transaction ;
- écriture atomique.

Ne pas ajouter un mécanisme complexe sans nécessité.

Si PostgreSQL/RLS/schema doit être modifié pour garantir la sécurité :
STOP avant migration et demande validation humaine.

==================================================
ÉTAPE 7 — IDEMPOTENCE
==================================================

Éviter qu'un double clic ou une double requête puisse créer deux réservations métier identiques lorsque le système peut techniquement les distinguer.

Chercher les mécanismes existants :
- référence unique ;
- contraintes ;
- token/idempotency key ;
- transaction ;
- vérification serveur.

Ne crée pas arbitrairement une nouvelle colonne Prisma si une solution sûre existe sans changement de schéma.

Si une nouvelle contrainte DB est indispensable :
STOP avant migration.

==================================================
ÉTAPE 8 — STATUTS
==================================================

Ne change pas les règles métier sans validation.

Vérifie cependant la cohérence entre :

Reservation.status
PaymentStatus
Allocation
availability

et les transitions déjà prévues.

Ne laisse pas un utilisateur CLIENT ou LOGISTICIAN modifier arbitrairement un statut administratif.

Si le code force actuellement CONFIRMED et que cette règle est ambiguë dans le cahier :
ne remplace pas silencieusement la règle.
Documente le point.

==================================================
ÉTAPE 9 — VALIDATION DES ENTRÉES
==================================================

Utiliser les mécanismes de validation existants.

Si Zod est déjà présent, privilégier Zod aux frontières serveur.

Valider :
- reservationId ;
- formulaId ;
- participants ;
- date ;
- heure ;
- données client ;
- locationId/locationType ;
- chaînes ;
- valeurs numériques.

Ne pas accepter NaN, Infinity, nombres négatifs ou valeurs impossibles.

Ne pas faire confiance à la validation frontend seule.

==================================================
ÉTAPE 10 — TESTS
==================================================

Avant modification :

exécuter seulement les tests sûrs et pertinents disponibles pour le LOT 1.

Ne lance PAS de script potentiellement destructif.

Ne lance PAS :
- delete scripts ;
- reset DB ;
- seed commercial ;
- scripts de correction DB ;
- scripts RLS ;
- scripts de production.

Après modification :

1. typecheck ;
2. build ;
3. tests unitaires concernés ;
4. tests d'intégration sûrs ;
5. Playwright pertinent si environnement de test sûr ;
6. tests de sécurité du LOT 1.

Si les tests E2E nécessitent une session authentifiée inexistante :
ne fabrique pas de compte.
Indique précisément ce qui reste non exécuté.

==================================================
TESTS MINIMUMS À AJOUTER OU CORRIGER
==================================================

Si l'infrastructure de test existante le permet, ajouter des tests ciblés :

A. CLIENT A ne peut pas lire réservation CLIENT B.

B. CLIENT A ne peut pas modifier réservation CLIENT B.

C. LOGISTICIAN ne peut pas créer une réservation.

D. CLIENT ne peut pas imposer customerId B.

E. CLIENT ne peut pas imposer un prix.

F. CLIENT ne peut pas imposer totalAmount.

G. formule privée non réservable publiquement.

H. capacité dépassée refusée.

I. formule indisponible refusée.

J. deux requêtes concurrentes ne doivent pas créer une surallocation.

K. double soumission ne doit pas créer deux opérations métier lorsqu'une protection existante peut l'empêcher.

L. utilisateur non authentifié refusé.

Ne pas utiliser de données de production.

==================================================
ÉTAPE 11 — UI / FRONTEND
==================================================

Corriger uniquement les problèmes frontend directement liés au LOT 1.

Le parcours réservation doit :
- afficher les erreurs serveur correctement ;
- ne pas masquer un refus d'autorisation ;
- ne pas afficher de données appartenant à un autre client ;
- ne pas exposer de prix falsifiable comme source de vérité ;
- rester responsive ;
- conserver le design existant.

Ne lance PAS maintenant une refonte générale du design.

==================================================
ÉTAPE 12 — RÉGRESSIONS
==================================================

Après correction, vérifier que restent fonctionnels :

- catalogue public ;
- publication services/formules ;
- réservation CLIENT ;
- consultation réservation CLIENT ;
- accès ADMIN ;
- accès SECRETARY ;
- accès SUPERVISOR selon matrice ;
- accès LOGISTICIAN en lecture ;
- redirection utilisateur non authentifié.

==================================================
RÈGLE SUR PRISMA / RLS
==================================================

Ne cherche PAS à résoudre maintenant les 47 différences historiques Prisma/RLS.

Ce LOT doit corriger le code applicatif sans déclencher une grande réconciliation DB.

Si une modification DB est absolument indispensable :
STOP.
Explique :
1. pourquoi ;
2. quelle table ;
3. quelle contrainte/policy ;
4. quel impact ;
5. quelle migration ;
6. pourquoi le code seul ne suffit pas.

Puis attends validation humaine.

==================================================
RÈGLE SUR GIT
==================================================

Aucun commit.

À la fin :
- git status ;
- git diff --stat ;
- git diff ciblé des fichiers modifiés.

Ne pas nettoyer les fichiers non suivis.
Ne pas restaurer les fichiers historiques.
Ne pas modifier la branche.

==================================================
RAPPORT FINAL
==================================================

À la fin, afficher dans la réponse Codex :

# LOT 1 — RAPPORT D'IMPLÉMENTATION

## 1. Modifications effectuées
fichier → changement → raison.

## 2. Sécurité
- Auth
- RBAC
- isolation CLIENT
- IDOR
- validation serveur

## 3. Réservation
- disponibilité
- capacité
- ressources
- concurrence
- idempotence
- statuts

## 4. Tests exécutés
Commande → résultat.

## 5. Tests non exécutés
Pourquoi.

## 6. Fichiers modifiés
Liste exacte.

## 7. Prisma / DB / RLS
Dire explicitement :
- aucune modification
OU
- modification bloquée en attente de validation humaine.

## 8. Git
- branche
- HEAD
- git status
- diff stat.

## 9. Reste à faire
Uniquement les éléments réellement non résolus du LOT 1.

## 10. Verdict

Choisir exactement :

### LOT 1 IMPLEMENTED — TESTED
si le code a été corrigé et les tests pertinents exécutés avec succès.

### LOT 1 IMPLEMENTED — PARTIALLY TESTED
si le code est corrigé mais certains tests nécessitent une session/environnement non disponible.

### LOT 1 BLOCKED
si une décision humaine ou une modification DB/RLS indispensable bloque la correction.

IMPORTANT :

Ne pas appeler "VALIDATED" un élément uniquement parce que le build passe.

==================================================
FIN
==================================================

Travaille maintenant directement sur le code du LOT 1.
Pas de nouvel audit général.
Pas de questionnaire.
Pas de préparation supplémentaire.
Corrige, teste, rapporte.
