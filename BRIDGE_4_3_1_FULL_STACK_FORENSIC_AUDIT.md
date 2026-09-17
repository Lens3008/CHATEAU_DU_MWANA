# BRIDGE 4.3.1 — FULL STACK FORENSIC AUDIT

## Périmètre et règles appliquées

Audit technique et fonctionnel en lecture seule du checkout réel :

`C:\laragon\www\CHATEAU DU MWANA`

Aucune modification de code, de configuration, de schéma Prisma, de migration, de donnée, de rôle ou de RLS n'a été effectuée. Aucun commit, push, reset, checkout, revert, clean, migration ou opération d'écriture en base n'a été lancé.

Les conclusions `PASS` sont réservées aux chaînes démontrées par le code et par les vérifications disponibles. Une fonction simplement présente dans un service n'est pas considérée comme fonctionnelle si aucun appel frontend ou Server Action ne l'atteint.

## 1. Résumé exécutif

L'application est une application Next.js 16 avec Server Components, Server Actions, Prisma Next ORM/PostgreSQL et Supabase Auth.

Les éléments suivants sont démontrés :

- le build de production passe ;
- TypeScript passe sans émission ;
- les routes publiques principales répondent ;
- `/dashboard` redirige un anonyme vers `/login` ;
- l'authentification s'appuie sur Supabase puis synchronise un `User` local ;
- le catalogue public utilise un filtre générique `availability + isPublished` pour les services et formules ;
- le parcours de réservation possède une chaîne frontend → Server Action → Auth → transaction → disponibilité → création de réservation/paiement/allocation ;
- les dashboards ont des contrôles RBAC explicites dans le code ;
- le formulaire de contact public écrit bien un `ContactMessage`.

Les limites importantes sont :

- paiement réel non câblé à une UI ou à une Server Action ;
- génération de facture non câblée à une UI ou à une Server Action ;
- bouton `Encaisser` sans action ;
- plusieurs boutons de catalogue, logistique et maintenance sans action serveur visible ;
- CRM et CMS produisent une erreur `Unauthorized` côté serveur pour un anonyme au lieu d'un comportement HTTP homogène ;
- les dashboards de rôle ont été testés sans session réelle : la logique RBAC est présente, mais le parcours authentifié n'est pas démontré ;
- la page publique galerie charge tous les `GalleryItem` sans filtre explicite de publication/visibilité ;
- la validation des entrées des Server Actions est largement manuelle et aucun schéma Zod n'a été identifié sur les parcours principaux ;
- plusieurs lectures utilisent `.all()` puis filtrent en mémoire, ce qui limite la preuve de performance et d'isolation optimale ;
- le drift Prisma/RLS déjà documenté reste gelé et n'a pas été résolu.

## 2. Vérifications exécutées

### 2.1 TypeScript

Commande :

```text
npx tsc --noEmit
```

Résultat : **PASS** — code de sortie 0.

### 2.2 Build

Commande :

```text
npm run build
```

Résultat : **PASS** — compilation, TypeScript, collecte des pages et génération statique terminées.

Avertissements observés :

- `eslint` dans `next.config.ts` n'est plus une option reconnue par Next.js 16 ;
- l'option `eslint` de `next.config.ts` est signalée comme invalide.

Le build ne constitue pas une preuve que chaque workflow métier est utilisable avec une session et des données réelles.

### 2.3 Smoke test HTTP anonyme

Serveur local démarré avec `npm run dev` sur `http://localhost:3000`.

| Route | Résultat observé |
|---|---|
| `/` | HTTP 200 |
| `/presentation` | HTTP 200 |
| `/services` | HTTP 200 |
| `/gallery` | HTTP 200 |
| `/contact` | HTTP 200 |
| `/reserver` | HTTP 200 |
| `/login` | HTTP 200 |
| `/register` | HTTP 200 |
| `/dashboard` | HTTP 307 vers `/login` |
| `/admin/logistics` | HTTP 307 vers `/login` |
| `/dashboard/client` | HTTP 200 avec boundary/état d'erreur selon le contexte |
| `/dashboard/secretary` | HTTP 200 mais `Unauthorized` journalisé côté serveur |
| `/dashboard/logistician` | HTTP 200 mais `Unauthorized` journalisé côté serveur |
| `/dashboard/supervisor` | HTTP 200 mais `Unauthorized` journalisé côté serveur |
| `/dashboard/admin` | HTTP 200 mais `Unauthorized` journalisé côté serveur |
| `/admin/crm` | HTTP 500 avec `Unauthorized` journalisé |
| `/admin/cms` | HTTP 500 avec `Unauthorized` journalisé |

La protection existe, mais la stratégie de redirection/erreur n'est pas homogène entre les routes protégées.

## 3. Cartographie des routes

### 3.1 Routes publiques

| Route | Frontend / source | Données backend |
|---|---|---|
| `/` | `src/app/(public)/page.tsx` | catalogue public, galerie, paramètres |
| `/presentation` | `src/app/(public)/presentation/page.tsx` | contenu page/public |
| `/services` | `src/app/(public)/services/page.tsx` | `getPublicFormulas`, `getPublicServices` |
| `/gallery` | `src/app/(public)/gallery/page.tsx` | `GalleryItem`, `Media`, `Gallery` |
| `/contact` | `src/app/(public)/contact/page.tsx` + `ContactFormClient` | Server Action contact |
| `/reserver` | `src/app/(public)/reserver/page.tsx` + `BookingWizardClient` | catalogue public, lieux, réservation |
| `/page/[slug]` | `src/app/(public)/page/[slug]/page.tsx` | page CMS publiée |
| `/catalogue` | `src/app/catalogue/page.tsx` | page catalogue |
| `/login` | `src/app/login/page.tsx` | Server Action `login` |
| `/register` | `src/app/register/page.tsx` | Server Action `signup` |
| `/auth/callback` | callback Supabase | session/callback Auth |

### 3.2 Routes dashboard

| Route | Rôle attendu |
|---|---|
| `/dashboard` | redirection par rôle |
| `/dashboard/client` | `CLIENT` |
| `/dashboard/reservations` | `CLIENT` |
| `/dashboard/secretary` | `SECRETARY` |
| `/dashboard/logistician` | `LOGISTICIAN` |
| `/dashboard/supervisor` | `SUPERVISOR` |
| `/dashboard/admin` | `ADMIN` |

### 3.3 Routes admin/protégées

Catalogue : `/admin/catalogue`, `/admin/catalogue/services/[id]`.

Réservations : `/admin/reservations`, `/admin/reservations/[id]`, `/admin/reservations/new`.

CRM : `/admin/crm`, `/admin/crm/clients/[id]`.

Logistique : `/admin/logistics`, `/admin/logistics/allocations`, `/admin/logistics/equipments`, `/admin/logistics/inventory`, `/admin/logistics/locations`, `/admin/logistics/maintenance`.

CMS : `/admin/cms`, `/admin/cms/pages`, `/admin/cms/pages/new`, `/admin/cms/pages/[id]`, `/admin/cms/media`, `/admin/cms/gallery`, `/admin/cms/gallery/new`, `/admin/cms/gallery/[id]`, `/admin/cms/templates`, `/admin/cms/templates/new`, `/admin/cms/templates/[id]`, `/admin/cms/settings`.

Autres : `/admin/analytics`, `/admin/contact`, `/admin/contact/[id]`, `/admin/imports`, `/admin/imports/[id]`, `/admin/notifications`, `/admin/users`.

### 3.4 API routes

Une API route applicative a été identifiée :

```text
src/app/api/auth-test/route.ts
```

`GET /api/auth-test` teste la connexion ORM, la session, `requireAuth`, `requireRole` et la présence serveur de `SUPABASE_SERVICE_ROLE_KEY`. Cette route expose volontairement un diagnostic d'authentification et de rôles ; elle n'est pas une API métier de production.

## 4. Authentification et RBAC

### 4.1 Chaîne Auth

`login/page.tsx` → `src/app/login/actions.ts:login` → `createClient()` Supabase → `signInWithPassword` → `revalidatePath` → `/dashboard`.

`register/page.tsx` → `signup` → `supabase.auth.signUp` → `/dashboard`.

`getCurrentUser()` :

1. récupère l'utilisateur Supabase ;
2. cherche `User` par `id` ;
3. crée un `User` local absent avec le rôle `CLIENT` ;
4. refuse un utilisateur `isActive = false`.

### 4.2 RBAC

`requireAuth()` refuse l'absence de session.

`requireRole()` vérifie l'appartenance à une liste de rôles.

Les rôles utilisés sont `ADMIN`, `SUPERVISOR`, `SECRETARY`, `LOGISTICIAN`, `CLIENT`.

Contrôles observés :

- Admin : dashboards admin, CMS, paramètres, médias, pages, templates, imports selon les pages ;
- Supervisor : supervision, analytics, CRM, contact, logistique et utilisateurs selon les pages/actions ;
- Secretary : réservations, analytics, CRM, contact et catalogue selon les pages/actions ;
- Logistician : logistique, inventaire, équipements, allocations, maintenance ;
- Client : espace personnel et réservations propres.

Limite : la distinction `403 Forbidden` n'est pas uniformément rendue. Plusieurs Server Components lèvent `Unauthorized`/`Forbidden` sans redirection explicite, ce qui explique les réponses 200 via error boundary ou les 500 observés.

## 5. Audit des dashboards

### 5.1 Dashboard Admin

Source : `src/app/dashboard/admin/page.tsx`.

Données dynamiques :

- `Reservation.all()` pour réservations, confirmations, terminées et chiffre d'affaires ;
- `User.all()` pour équipe ;
- `Customer` indirectement via `Reservation.customerId` ;
- `Equipment.all()`, `Inventory.all()` pour stock ;
- `LogisticsMission.all()` pour missions ;
- `EquipmentMaintenance.all()` pour maintenance.

Chaîne : page Server Component → `requireRole(['ADMIN'])` → ORM Prisma → PostgreSQL → rendu KPI/cartes/liens.

État : **PASS statique**, **PARTIAL fonctionnel** car session Admin réelle non exécutée.

Actions :

- liens vers réservations, CRM, analytics, utilisateurs, logistique ;
- les actions de détail dépendent d'autres pages ;
- aucune preuve d'encaissement ou génération de facture depuis le dashboard lui-même.

### 5.2 Dashboard Supervisor

Source : `src/app/dashboard/supervisor/page.tsx`.

Données :

- réservations du jour et à venir ;
- missions planifiées/en cours/incidentes ;
- équipements/inventaire ;
- maintenances ;
- livraisons ;
- utilisateurs.

Chaîne : `requireRole(['SUPERVISOR'])` → ORM → calculs en mémoire → KPI/liens.

État : **PASS statique**, **PARTIAL authentifié**.

Limites : les liens d'action existent, mais plusieurs écrans logistiques contiennent des boutons sans Server Action visible.

### 5.3 Dashboard Secretary

Source : `src/app/dashboard/secretary/page.tsx`.

Données :

- réservations ;
- clients ;
- factures ;
- messages contact ;
- services ;
- formules.

Chaîne : `requireRole(['SECRETARY'])` → lectures ORM globales → KPI commerciaux et priorités.

État : **PASS statique**, **PARTIAL authentifié**.

Limites :

- le bouton/flux de paiement n'est pas raccordé ;
- les factures sont lues mais la génération n'est pas accessible depuis une action démontrée ;
- accès anonyme journalisé comme `Unauthorized` avec réponse 200 via boundary.

### 5.4 Dashboard Logistician

Source : `src/app/dashboard/logistician/page.tsx`.

Données :

- missions ;
- équipements ;
- inventaire ;
- maintenance ;
- livraisons ;
- allocations ;
- lieux de stockage et lieux.

Chaîne : `requireRole(['LOGISTICIAN'])` → ORM → calcul de stock/statuts → KPI/liens.

État : **PASS statique**, **PARTIAL authentifié**.

Limites :

- les pages d'équipements, inventaire, lieux et maintenance montrent plusieurs boutons d'action dont aucune Server Action correspondante n'a été identifiée ;
- la démonstration complète mission → affectation → livraison → incident n'est pas prouvée.

### 5.5 Dashboard Client

Source : `src/app/dashboard/client/page.tsx`.

Données :

- `User.customerId` ;
- `Customer.where({ id: customerId })` ;
- `Reservation.where({ customerId })` ;
- `Invoice.where({ customerId })` ;
- `LoyaltyAccount.where({ customerId })` ;
- transactions de fidélité associées.

Chaîne : `getCurrentUser()` → contrôle `CLIENT` → contrôle `customerId` → ORM filtré → KPI/cartes/liens.

État : **PASS statique sur l'isolation**, **PARTIAL de démonstration**.

Le détail d'une réservation contrôle ensuite `reservation.customerId === user.customerId`. La page client lit bien ses données par `customerId`.

Limites :

- une session client réelle n'a pas été fournie pour exécuter le parcours ;
- le bouton vers paiement n'est pas un paiement réel ;
- le client peut voir des factures existantes, mais aucune génération n'est câblée.

## 6. Audit des actions frontend

### 6.1 Actions réellement câblées

| Fonction UI | Action/backend | État |
|---|---|---|
| Login | `login` → Supabase Auth | PASS statique |
| Inscription | `signup` → Supabase Auth | PASS statique, confirmation/erreur UI non démontrée |
| Logout | Server Action inline → `signOut` | PASS statique |
| Réservation publique | `createReservationAction` | PASS statique |
| Contact public | `submitContactMessageAction` | PASS statique |
| Statut message contact | `updateContactMessageStatusAction` | PASS statique |
| CMS pages | `create/update/deletePageAction` | PASS statique |
| CMS galerie | actions galerie | PASS statique |
| CMS médias | upload/delete actions | PASS statique |
| CMS templates | create/update/delete actions | PASS statique |
| CMS settings | get/update actions | PASS statique |
| CRM | read actions | PASS statique |
| Fidélité CRM | summary action | PASS statique |
| Notifications | mark read/delete/read all inline/actions | PASS statique |
| Imports | submit import action | PASS statique |

### 6.2 UI avec bouton mais sans action serveur démontrée

Les éléments suivants donnent une impression de fonctionnalité mais n'aboutissent pas à une action métier identifiée dans le code audité :

- `app/admin/reservations/[id]/page.tsx` : bouton `Encaisser` sans `onClick`, `form action` ou action importée ;
- `app/(protected)/admin/catalogue/page.tsx` : boutons de création/gestion sans action visible dans la page ;
- `app/(protected)/admin/catalogue/services/[id]/page.tsx` : bouton de gestion des ressources sans action visible ;
- `app/(protected)/admin/logistics/equipments/page.tsx` : création et réapprovisionnement sans action visible ;
- `app/(protected)/admin/logistics/inventory/page.tsx` : import/ajustement sans action visible ;
- `app/(protected)/admin/logistics/locations/page.tsx` : boutons de création/modification sans action visible ;
- `app/(protected)/admin/logistics/maintenance/page.tsx` : bouton `Clôturer` sans action visible ;
- `app/admin/crm/clients/[id]/page.tsx` : bouton d'action CRM sans câblage serveur visible ;
- `AppHeader.tsx` : notification affichée mais bouton non câblé à un affichage ou chargement ;
- `AppHeader.tsx` : recherche désactivée explicitement.

Ces cas sont **FAIL** pour une démonstration d'action de bout en bout, même si les pages et modèles existent.

## 7. Audit backend par domaine

### 7.1 Auth

| Fonction | Appelant | Validation | DB | État |
|---|---|---|---|---|
| login | `login/page.tsx` | présence email/password | Supabase Auth | PASS statique |
| register | `register/page.tsx` | présence email/password | Supabase Auth puis User lazy-sync | PARTIAL |
| session | `getCurrentUser` | utilisateur + `isActive` | User ORM | PASS statique |
| lazy sync | `getCurrentUser` | fallback unique catch | User.create | PARTIAL : catch large |
| logout | header/action | aucune donnée | Supabase Auth | PASS statique |

### 7.2 Catalogue/publication

`src/lib/public-catalogue.ts` centralise :

- formules `availability = true`, `isPublished = true` ;
- services `availability = true`, `isPublished = true` ;
- contrôle publication du service parent.

État : **PASS statique** pour le catalogue et la réservation publique.

Les pages admin utilisent en revanche des lectures globales, ce qui est cohérent avec leur rôle mais ne constitue pas un catalogue public.

### 7.3 Réservation

`createReservationAction` :

1. exige l'authentification ;
2. refuse `LOGISTICIAN` et `SUPERVISOR` ;
3. dérive `customerId` de la session pour un `CLIENT` ;
4. crée ou rattache un `Customer` si nécessaire ;
5. transmet `publicFormulaOnly` pour un client ;
6. appelle `createReservation`.

`createReservation` :

- transaction ;
- verrou `SELECT ... FOR UPDATE` sur la formule ;
- relecture de la formule ;
- filtre publication pour un client public ;
- vérification du service parent ;
- disponibilité/capacité/ressources ;
- création `Reservation` ;
- création `ReservationItem` ;
- création d'historique ;
- création de `Payment` initial ;
- allocations d'inventaire.

État : **PASS statique**, non exécuté avec une session réelle.

Point de vigilance : `CreateReservationData` et l'action utilisent `any`; les validations structurées sont limitées.

### 7.4 Disponibilité/capacité

`checkFormulaAvailability` vérifie :

- existence de formule ;
- `availability` ;
- capacité maximale ;
- réservations `CONFIRMED`/`COMPLETED` qui se chevauchent ;
- participants déjà utilisés ;
- ressources et stock ;
- allocations qui se chevauchent.

État : **PASS statique**, mais aucune endpoint autonome de disponibilité n'a été identifiée. La disponibilité est contrôlée au submit de réservation.

### 7.5 Paiement

`src/lib/services/payment.ts` fournit `addPayment` et `addRefund`.

La chaîne métier interne est présente :

- verrou de paiement/transaction ;
- contrôle montant positif ;
- contrôle du reste dû ;
- création `PaymentTransaction` ;
- mise à jour `Payment` ;
- mise à jour `Reservation.paymentStatus` ;
- historique de transaction ;
- remboursement plafonné par montant déjà remboursé.

Cependant :

- aucune Server Action de paiement n'a été identifiée ;
- aucune route API de paiement n'a été identifiée ;
- aucun appel frontend à `addPayment` ou `addRefund` n'a été identifié ;
- le bouton `Encaisser` est sans action.

État : **FAIL pour le workflow frontend → backend**, **PARTIAL pour le service isolé**.

### 7.6 Facturation

`src/lib/services/invoice.ts` fournit `generateInvoice`.

La fonction :

- charge la réservation ;
- évite une facture active en doublon ;
- charge les `ReservationItem` ;
- calcule sous-total et total ;
- génère un numéro ;
- crée `Invoice` ;
- crée les `InvoiceItem`.

Cependant :

- aucune Server Action de génération n'a été identifiée ;
- aucun appel UI à `generateInvoice` n'a été identifié ;
- les dashboards lisent des factures existantes mais ne peuvent pas démontrer leur création.

État : **FAIL pour la chaîne présentable**, **PARTIAL pour le service isolé**.

### 7.7 CRM

`crm-actions.ts` protège les lectures par `ADMIN`, `SUPERVISOR`, `SECRETARY`.

`crm.ts` agrège clients, réservations, factures, paiements et transactions.

État : **PASS statique pour lecture**, **PARTIAL pour actions d'édition** : une action visible pour les notes CRM n'a pas été reliée à une UI clairement démontrée dans les pages auditées.

### 7.8 Fidélité

Lecture summary : action protégée par `ADMIN`, `SUPERVISOR`, `SECRETARY`.

Le service contient aussi `earnLoyaltyPoints` et `redeemLoyaltyReward`, mais aucun parcours frontend public/client appelant ces fonctions n'a été identifié.

État : **PARTIAL** : lecture staff présente, earn/redeem orphelins pour la présentation.

### 7.9 Stock, équipements et logistique

Les services et modèles existent pour :

- inventaire ;
- mouvements ;
- allocations ;
- équipements ;
- maintenance ;
- missions ;
- livraisons ;
- lieux.

Les dashboards lisent réellement ces modèles via ORM. En revanche, plusieurs écrans affichent des boutons d'action sans Server Action ou service appelé visible.

État :

- lectures dashboard : **PASS statique** ;
- mutations UI : **FAIL/PARTIAL selon l'écran** ;
- workflow complet réservation → allocation → mission → livraison : **PARTIAL**, non démontré de bout en bout.

### 7.10 CMS/contact/notifications/imports/audit

- CMS pages : actions admin présentes et revalidation visible ;
- galerie : actions admin présentes ;
- médias : upload/delete présents côté action ;
- templates : actions présentes ;
- settings : lecture/mise à jour présentes ;
- contact public : INSERT SQL direct présent ;
- contact admin : mise à jour de statut présente ;
- notifications : lecture/marquage présent ;
- imports : action admin présente ;
- audit : utilisé par plusieurs services.

État global : **PARTIAL à PASS statique** ; les parcours nécessitent encore une exécution avec comptes de rôles réels et données de démonstration contrôlées.

## 8. Prisma et PostgreSQL

### 8.1 Prisma

Le code utilise `db.orm.public.<Model>` et `db.transaction`.

Modèles directement observés dans les parcours :

`User`, `Customer`, `ServiceCategory`, `Service`, `Formula`, `ServiceResource`, `Reservation`, `ReservationItem`, `ReservationStatusHistory`, `Payment`, `PaymentTransaction`, `PaymentTransactionHistory`, `Refund`, `Invoice`, `InvoiceItem`, `LoyaltyAccount`, `LoyaltyTransaction`, `Equipment`, `EquipmentCategory`, `Inventory`, `InventoryAllocation`, `InventoryMovement`, `EquipmentMaintenance`, `LogisticsMission`, `Delivery`, `DeliveryItem`, `Location`, `StorageLocation`, `Gallery`, `GalleryItem`, `Media`, `ContentPage`, `ContactMessage`, `Notification`, `ImportJob`, `AuditLog`.

Transactions observées :

- réservation ;
- disponibilité/allocations dans la transaction de réservation ;
- paiement/remboursement ;
- génération de facture ;
- opérations CMS selon le service.

Verrous `FOR UPDATE` observés sur formule et paiement/transaction.

Le drift Prisma déjà documenté reste hors périmètre. Aucune tentative de résolution n'a été faite.

### 8.2 PostgreSQL

La chaîne applicative lit et écrit les tables applicatives via Prisma et utilise ponctuellement du SQL paramétré pour contact, CMS et verrous.

Les contrôles FK applicatifs déjà audités sont cohérents avec le contrat Prisma. Le total physique PostgreSQL inclut des contraintes hors périmètre applicatif (auth/Supabase/système).

Le rôle `postgres` ne prouve pas le comportement d'un futur rôle runtime non-bypass.

## 9. Données de démonstration et fixtures

Recherches effectuées sur `TEST_`, `MOCK`, `FIXTURE`, `DEMO`, `SEED`.

Origines identifiées :

- scripts `validate_phase*.ts`, `test_*.ts`, `test-concurrency.ts` pouvant créer des données de test ;
- scripts de suppression ciblant `TEST_SERVICE`, `TEST_FORMULA` et variantes ;
- migration `20260915T1057_add_publication_flags` qui dépublie explicitement :
  - `TEST_FORMULA` ;
  - `TEST_B3_FORMULA` ;
  - `TEST_SERVICE` ;
  - `TEST_B3_SERVICE`.

Règle publique observée :

- ce n'est pas uniquement une blacklist côté UI ;
- `getPublicFormulas` et `getPublicServices` exigent publication et disponibilité ;
- la réservation publique exige également la publication du service parent ;
- la règle générique est donc présente.

Limite :

- la page publique galerie ne possède pas de filtre de publication/visibilité explicite ;
- les dashboards internes utilisent des lectures globales, ce qui peut inclure des fixtures internes si elles sont liées à ces modèles ;
- aucune suppression de fixtures n'a été effectuée pendant cet audit.

## 10. Erreurs et états UI

### Erreurs correctement représentées

- `BookingWizardClient` affiche l'erreur retournée par la Server Action ;
- contact affiche l'erreur ou le succès ;
- pages publiques disposent de `error.tsx`, `loading.tsx` et `not-found.tsx` selon le segment ;
- dashboards possèdent plusieurs loading/error boundaries ;
- l'anonyme est redirigé proprement par `/dashboard` et certaines routes protégées.

### Problèmes observés

- `getCurrentUser` retourne `null` en cas d'erreur Auth sans distinguer les causes ;
- plusieurs pages protégées lèvent `Unauthorized` au lieu d'appeler une redirection contrôlée ;
- `/admin/crm` et `/admin/cms` retournent HTTP 500 en accès anonyme ;
- certaines Server Actions catchent `any` et retournent seulement `err.message` ;
- le formulaire d'inscription ne rend pas explicitement les erreurs de query string dans la page ;
- absence de validation Zod identifiable pour les données de réservation/contact/actions administratives ;
- `submitContactMessageAction` valide seulement présence minimale des champs ;
- des `catch` dans layout/settings ignorent silencieusement les erreurs (`PublicLayout` fallback settings).

## 11. Audit responsive/accessibilité ciblé

Éléments positifs :

- menu public mobile avec `aria-expanded` et `aria-controls` ;
- sidebar protégée mobile avec `aria-expanded`, `aria-controls` et fermeture Escape ;
- tables protégées avec conteneur de scroll mobile ;
- labels de formulaire présents sur les principaux formulaires ;
- focus styles présents sur plusieurs champs/boutons.

Limites :

- aucun test navigateur authentifié par rôle n'a été exécuté ;
- aucun test clavier complet de chaque dashboard n'a été réalisé dans cet audit ;
- plusieurs boutons sont sans action, ce qui est aussi un défaut d'accessibilité fonctionnelle ;
- les cartes de sélection de formule et lieu dans `BookingWizardClient` sont des `<div onClick>` non équivalents à des contrôles clavier natifs ;
- le focus initial, l'aria-modal et le trap complet de la lightbox doivent être vérifiés séparément selon l'implémentation actuelle ;
- le bouton notification du header n'a pas de flux UI associé.

## 12. Workflows complets

### A. Client

| Étape | Chaîne | État |
|---|---|---|
| Inscription | register → signup → Supabase | PASS statique |
| Connexion | login → signInWithPassword → dashboard | PASS statique |
| Catalogue | page publique → public-catalogue → ORM/DB | PASS |
| Réservation | wizard → action → auth → transaction → DB | PASS statique, session réelle manquante |
| Paiement | dashboard/détail → bouton Encaisser | FAIL |
| Facture | service invoice présent, aucune UI/action | FAIL |
| Dashboard | getCurrentUser → customerId → ORM filtré | PASS statique |
| Fidélité | lecture summary staff, mutation client absente | PARTIAL |

### B. Secrétaire

Connexion → `requireRole(SECRETARY)` → dashboard et CRM/contact/réservations.

État : **PARTIAL**. Les lectures sont présentes, mais paiement/facture et plusieurs mutations catalogue ne sont pas démontrées. L'accès anonyme n'a pas un retour HTTP propre et homogène.

### C. Logisticien

Connexion → `requireRole(LOGISTICIAN)` → logistique/inventaire/équipements/allocations/maintenance.

État : **PARTIAL**. Les données sont réellement lues ; les mutations de démonstration (ajustement, clôture, affectation, livraison) ne sont pas toutes câblées.

### D. Superviseur

Connexion → `requireRole(SUPERVISOR)` → supervision → réservations/logistique/stock/maintenance/équipe.

État : **PARTIAL**. Les KPI et liens existent ; les actions métier complètes et la session réelle ne sont pas démontrées.

### E. Admin

Connexion → `requireRole(ADMIN)` → utilisateurs/catalogue/réservations/finances/CRM/logistique/CMS/analytics.

État : **PARTIAL**. Large couverture de lecture et actions CMS ; paiement/facture et plusieurs mutations opérationnelles restent incomplètes.

## 13. Matrice finale par domaine

| Domaine | Frontend | Action/API | Service | Prisma | DB | Retour UI | État |
|---|---|---|---|---|---|---|---|
| Auth login | Oui | `login` | Supabase Auth | User lazy-sync | Auth + User | redirect dashboard | PASS statique |
| Inscription | Oui | `signup` | Supabase Auth | User lazy-sync ultérieur | Auth + User | redirect | PARTIAL |
| Catalogue | Oui | lecture directe Server Component | public-catalogue | Service/Formula | PostgreSQL | cartes | PASS |
| Réservation | Wizard | `createReservationAction` | reservation + availability | transaction | Reservation/Item/Payment/Allocation | succès/erreur | PASS statique |
| Disponibilité | Wizard submit | indirecte | availability | lecture réservations/stock | PostgreSQL | erreur submit | PASS statique |
| Paiement | bouton non câblé | absente | `addPayment` existe | Payment/Transaction | PostgreSQL | aucun retour | FAIL |
| Remboursement | absente | absente | `addRefund` existe | Refund | PostgreSQL | aucun retour | FAIL |
| Facturation | lecture facture | absente | `generateInvoice` existe | Invoice/Item | PostgreSQL | facture existante seulement | FAIL |
| Dashboard client | Oui | Server Component | auth + lectures | filtres customerId | PostgreSQL | cartes/table | PASS statique |
| CRM | Oui | read actions | crm | Customer/Reservation/Invoice/Payment | PostgreSQL | table/fiche | PARTIAL |
| Fidélité | lecture fiche | summary action | loyalty | LoyaltyAccount/Transaction | PostgreSQL | résumé | PARTIAL |
| Stock | Oui | actions incomplètes | logistics/availability | Inventory/Allocation | PostgreSQL | KPI/liens | PARTIAL |
| Mission/livraison | Oui | mutations non prouvées | logistics | Mission/Delivery | PostgreSQL | KPI/liens | PARTIAL |
| Maintenance | Oui | bouton clôture non câblé | modèle présent | EquipmentMaintenance | PostgreSQL | listes | PARTIAL |
| CMS pages | Oui | actions CRUD | cms | ContentPage | PostgreSQL | revalidation | PASS statique |
| Galerie | Oui | admin actions | gallery/media | Gallery/Media | PostgreSQL | grille | PARTIAL/RISK |
| Contact | Oui | `submitContactMessageAction` | SQL direct | ContactMessage | PostgreSQL | succès/erreur | PASS statique |
| Notifications | Oui | mark/read actions | notification(s) | Notification | PostgreSQL | listes | PARTIAL |
| Imports | Oui | submit import | imports | ImportJob/Error | PostgreSQL | page import | PARTIAL |

## 14. Matrice dashboards

| Dashboard | Fonction | Backend | Données réelles | Action réelle | RBAC | État |
|---|---|---|---|---|---|---|
| Admin | KPI globaux | ORM direct | Oui | Partielle | ADMIN | PARTIAL |
| Admin | CRM | actions/services | Oui | Lecture réelle, mutations incomplètes | ADMIN | PARTIAL |
| Admin | CMS | Server Actions | Oui | CRUD pages/media/gallery/templates/settings | ADMIN | PASS statique |
| Admin | Paiement/facture | service isolé | Modèles présents | Non câblé | Staff | FAIL |
| Supervisor | opérations | ORM direct | Oui | Liens, mutations incomplètes | SUPERVISOR | PARTIAL |
| Secretary | commercial/contact | ORM/actions | Oui | contact et statuts, paiement absent | SECRETARY | PARTIAL |
| Logistician | stock/missions | ORM direct | Oui | mutations non toutes câblées | LOGISTICIAN | PARTIAL |
| Client | réservation/historique | ORM filtré | Oui | création réservation | CLIENT | PASS statique / PARTIAL workflow |

## 15. Problèmes classés

| Problème | Sévérité | Impact présentation | Cause | Correction nécessaire |
|---|---|---|---|---|
| Paiement impossible depuis l'UI | P0 | empêche démonstration paiement | aucune Server Action/UI pour `addPayment` | câbler action protégée et formulaire |
| Facture non générable depuis l'UI | P0 | empêche démonstration facture | aucune action/UI pour `generateInvoice` | câbler action protégée et retour |
| Bouton Encaisser sans action | P0 | écran trompeur | bouton décoratif | connecter à paiement |
| Workflow réservation authentifié non exécuté | P1 | preuve finale absente | pas de session de test disponible | exécuter avec comptes réels non destructifs |
| Mutations logistique/maintenance incomplètes | P1 | bloque démonstration opérationnelle | boutons sans actions visibles | câbler ou retirer du scénario |
| CRM/CMS HTTP 500 anonyme | P1 | comportement d'accès non propre | `requireAuth` lève dans Server Component | uniformiser redirection/error boundary |
| Galerie sans filtre publication explicite | P1 | risque d'exposition | lecture globale GalleryItem/Media | appliquer règle publique avant présentation |
| Fidélité earn/redeem non raccordée | P1 | parcours fidélité incomplet | services orphelins | connecter UI/actions ou marquer hors scénario |
| Validation d'entrées faible | P2 | erreurs et abus possibles | `any`, checks minimaux, pas de Zod identifié | validation structurée |
| Actions boutons catalogue sans backend visible | P2 | impression de faux fonctionnement | UI incomplète | câbler ou désactiver clairement |
| Recherche header désactivée | P3 | UX incomplète | explicitement disabled | implémenter ultérieurement |
| Diagnostic `/api/auth-test` exposé | P2 | fuite d'informations opérationnelles possible | endpoint diagnostic accessible | limiter ou retirer en production |

## 16. Priorisation

### P0 — BLOQUANTS

- Paiement non démontrable de bout en bout.
- Facture non générable de bout en bout.
- Bouton `Encaisser` sans action serveur.

### P1 — À CORRIGER AVANT PRÉSENTATION

- Exécuter les parcours avec de vrais comptes `CLIENT`, `SECRETARY`, `SUPERVISOR`, `LOGISTICIAN`, `ADMIN`.
- Décider et vérifier le périmètre des mutations logistiques/maintenance.
- Uniformiser les réponses des routes protégées anonymes, en particulier CRM/CMS.
- Vérifier/isoler la galerie publique par une règle de publication explicite.
- Rendre le parcours fidélité réellement démontrable ou le retirer du scénario.
- Vérifier la chaîne réservation → disponibilité → DB avec une donnée non destructive.

### P2 — À CORRIGER APRÈS PRÉSENTATION

- Validation structurée des Server Actions et suppression progressive des `any`.
- Câblage des boutons catalogue, CRM, stock, équipements, lieux et maintenance.
- Réduction des lectures `.all()` suivies de filtres en mémoire.
- Uniformisation des erreurs `401/403/500`.
- Encadrement du endpoint `/api/auth-test`.

### P3 — AMÉLIORATIONS

- Recherche du header.
- Pagination et filtres avancés.
- Accessibilité native des cartes cliquables du BookingWizard.
- Tests navigateur clavier/responsive authentifiés complets.

## 17. Limites de preuve

- Aucun compte de démonstration n'a été utilisé dans cet audit.
- Les mutations n'ont pas été exécutées afin de respecter la règle lecture seule.
- Aucun paiement, remboursement, facture, création de réservation ou mutation CMS/logistique n'a été lancé contre la base.
- Les résultats HTTP anonymes ne prouvent pas le comportement d'un utilisateur authentifié.
- Le drift Prisma/RLS et les 47 différences déjà documentées sont laissés volontairement gelés.
- Le rôle `postgres` ne permet pas de conclure au comportement d'un rôle runtime non-bypass.

## VERDICT GLOBAL : NOT READY

La base technique compile et plusieurs chaînes de lecture/authentification/catalogue/réservation sont présentes et cohérentes. L'application n'est toutefois pas prête pour une présentation complète des parcours annoncés : le paiement et la facturation ne sont pas reliés au frontend, des boutons opérationnels sont sans action backend, certaines routes protégées répondent par erreur 500 pour un anonyme et la galerie publique n'a pas de filtre de publication explicite démontré.

Ce verdict ne recommande aucune modification immédiate dans le cadre de cet audit ; il établit uniquement l'état réel observé.
