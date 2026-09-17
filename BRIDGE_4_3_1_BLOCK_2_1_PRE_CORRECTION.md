# BRIDGE 4.3.1 — BLOC 2.1
# Audit ciblé pré-correction P0/P1

## Mode et périmètre

Audit strictement en lecture seule du checkout réel :

`C:\laragon\www\CHATEAU DU MWANA`

Ce rapport ne modifie pas le code, Prisma, les migrations, la base, RLS, Auth, RBAC, les données ou Git. Aucun compte, paiement, facture, réservation ou mutation logistique n'a été créé pendant l'audit.

Sources principales recoupées :

- `BRIDGE_4_3_1_FULL_STACK_FORENSIC_AUDIT.md`
- `src/lib/services/payment.ts`
- `src/lib/services/invoice.ts`
- `src/app/admin/reservations/[id]/page.tsx`
- `src/components/public/BookingWizardClient.tsx`
- `src/lib/actions/reservation-actions.ts`
- `src/lib/services/reservation.ts`
- `src/lib/services/availability.ts`
- `src/lib/auth/user.ts`
- actions CRM/CMS/contact/loyalty
- pages logistiques et maintenance
- `prisma/schema.prisma`

## Verdict de préparation

### READY_FOR_IMPLEMENTATION

Les causes P0/P1 sont localisées avec suffisamment de précision pour une implémentation minimale et chirurgicale. Les services métier de paiement et de facturation existent déjà ; le manque principal est le pont sécurisé Server Action → service → retour UI. La galerie est différente : le schéma `Gallery`/`GalleryItem`/`Media` ne possède pas actuellement de champ de publication, donc aucune réutilisation directe de la règle `isPublished` de `ContentPage` n'est possible sans décision de périmètre.

---

## 1. P0 — Paiement : chaîne exacte

### 1.1 Modèle et service existants

Fichier : `src/lib/services/payment.ts`

#### `addPayment`

Signature :

```ts
addPayment(data: {
  reservationId: string
  amount: number
  method: PaymentMethod
  reference?: string
  performedById?: string
})
```

Chaîne interne :

1. ouvre `db.transaction`;
2. exécute un verrou SQL `SELECT 1 FROM Payment WHERE "reservationId" = ... FOR UPDATE`;
3. charge les `Payment` et trouve le paiement de la réservation ;
4. refuse l'absence de paiement ;
5. convertit le montant en nombre ;
6. refuse un montant `<= 0` ;
7. calcule `remaining = totalExpected - totalPaid` ;
8. refuse un montant supérieur au reste dû ;
9. crée `PaymentTransaction` avec `status: 'SUCCESS'` ;
10. recalcule `totalPaid` et le statut `PAID` ou `PARTIAL` ;
11. met à jour `Payment` ;
12. met à jour `Reservation.paymentStatus` ;
13. crée `PaymentTransactionHistory` avec `newStatus: 'SUCCESS'` ;
14. retourne `{ transaction, newStatus, newTotalPaid }`.

### 1.2 `addPayment` : contrôles présents et absents

Présents dans le service :

- transaction ;
- verrou de paiement ;
- réservation ciblée par `reservationId` ;
- contrôle d'existence du paiement ;
- montant positif ;
- interdiction du surpaiement ;
- recalcul serveur du solde et du statut ;
- création de transaction et d'historique.

Absents du service :

- aucun `requireAuth` ;
- aucun `requireRole` ;
- aucune vérification de l'identité du demandeur ;
- aucun contrôle explicite de `customerId` ;
- aucun contrôle que `method` appartient réellement à l'enum avant l'appel ;
- aucun contrôle explicite d'état de réservation annulée/terminée dans cette fonction ;
- `performedById` est défini dans le type mais n'est pas persisté dans `PaymentTransaction` ou l'historique par cette fonction.

Le service est donc une primitive métier interne, pas une frontière d'autorisation publique.

### 1.3 `addRefund`

Signature :

```ts
addRefund(transactionId: string, amount: number, reason?: string)
```

Chaîne interne :

1. ouvre une transaction ;
2. verrouille `PaymentTransaction` par `transactionId` ;
3. charge la transaction ;
4. rattache le paiement correspondant ;
5. refuse une transaction absente ou non `SUCCESS` ;
6. additionne les `Refund` déjà associés ;
7. calcule le maximum remboursable ;
8. refuse un montant supérieur au maximum ;
9. crée `Refund` ;
10. recalcule `Payment.totalPaid` ;
11. calcule `FULLY_REFUNDED` ou `PARTIAL_REFUNDED` ;
12. met à jour `Payment` ;
13. met à jour `Reservation.paymentStatus` ;
14. retourne le remboursement créé.

Contrôle notable : le code refuse le dépassement du montant remboursable, mais ne refuse pas explicitement `amount <= 0`. Il n'existe toutefois aucun appel UI/action trouvé pendant cet audit.

### 1.4 Modèles impliqués

Les modèles Prisma utilisés sont :

- `Payment` : paiement 1:1 de la réservation, `totalExpected`, `totalPaid`, `status`, `reservationId` ;
- `PaymentTransaction` : opérations de paiement rattachées à `Payment` ;
- `PaymentTransactionHistory` : historique de statut d'une transaction ;
- `Refund` : remboursement rattaché à `PaymentTransaction`.

Les relations et contraintes FK correspondantes sont présentes dans `prisma/schema.prisma`.

### 1.5 Appels existants et appels potentiels

Recherches effectuées :

- `addPayment(` ;
- `addRefund(` ;
- `PaymentTransaction` ;
- `PaymentTransactionHistory` ;
- `Refund` ;
- imports dans `src/app`, `src/components`, `src/lib/actions`, `src/app/api`.

Résultat :

- `addPayment` est défini mais aucun appel frontend, Server Action, action inline ou API route n'a été trouvé ;
- `addRefund` est défini mais aucun appel frontend, Server Action, action inline ou API route n'a été trouvé ;
- les modèles de paiement sont lus dans le détail réservation, CRM et analytics ;
- aucune action de mutation de paiement n'existe actuellement.

### 1.6 Pont minimal nécessaire

Le plus petit pont pour le paiement est :

```text
UI de détail réservation
→ Server Action dédiée
→ requireAuth + rôle staff autorisé
→ addPayment({ reservationId, amount, method, reference, performedById })
→ revalidation de la page réservation
→ résultat success/error affiché dans l'UI
```

La logique de solde, de statut, de transaction et d'historique doit rester dans `addPayment`. Il ne faut pas la dupliquer dans l'action.

La Server Action doit au minimum :

- vérifier l'authentification ;
- limiter l'appel aux rôles métier autorisés pour l'encaissement ;
- valider la forme et les types des données reçues ;
- transmettre `user.id` comme `performedById` si ce champ est conservé ;
- appeler uniquement `addPayment` ;
- retourner une réponse exploitable et revalider le détail.

La portée exacte des rôles autorisés doit être confirmée par la gouvernance métier existante. Le bouton actuel est visible pour tout rôle non `CLIENT`, donc potentiellement `ADMIN`, `SUPERVISOR` et `SECRETARY`, mais la primitive ne l'impose pas.

### 1.7 Risques et tests requis

Risques :

- action non protégée permettant un encaissement arbitraire si elle était exposée sans RBAC ;
- montant/méthode mal typés côté client ;
- double soumission malgré le verrou, à tester ;
- absence de règle explicite sur réservation annulée ou remboursement.

Tests non mutatifs à préparer avant exécution :

1. anonyme : action refusée ;
2. CLIENT : action refusée ;
3. rôle staff autorisé : action atteignable ;
4. montant `0` ou négatif : refus ;
5. montant supérieur au reste : refus ;
6. montant partiel : `Payment` devient `PARTIAL`, réservation synchronisée ;
7. solde exact : `PAID` ;
8. double appel concurrent : pas de surpaiement ;
9. historique créé ;
10. UI revalidée avec résultat positif ou message d'erreur.

---

## 2. P0 — Facturation : chaîne exacte

### 2.1 `generateInvoice`

Fichier : `src/lib/services/invoice.ts`

Signature :

```ts
generateInvoice(reservationId: string)
```

Chaîne interne :

1. ouvre `db.transaction`;
2. charge toutes les réservations ;
3. trouve la réservation ciblée ;
4. refuse une réservation absente ;
5. charge toutes les factures ;
6. refuse une facture existante non `CANCELLED` pour cette réservation ;
7. charge tous les `ReservationItem` ;
8. refuse une réservation sans item ;
9. calcule le sous-total à partir des `item.totalPrice` ;
10. fixe `taxAmount = 0` ;
11. calcule le total serveur ;
12. génère un numéro `INV-année-random` et évite les collisions observées ;
13. calcule une échéance à 30 jours ;
14. crée `Invoice` avec `reservationId`, `customerId` de la réservation, montants et statut `ISSUED` ;
15. charge les formules ;
16. crée un `InvoiceItem` par item de réservation ;
17. retourne la facture.

### 2.2 Propriétés et limites

Présents :

- transaction ;
- rattachement à la réservation ;
- `customerId` dérivé de la réservation ;
- calcul serveur des montants ;
- protection contre facture active en doublon ;
- création des lignes ;
- numéro généré côté serveur.

Limites :

- aucun `requireAuth` ;
- aucun `requireRole` ;
- aucune validation de l'appelant ;
- idempotence applicative par recherche préalable, mais pas une preuve d'unicité DB examinée ici ;
- recherche de doublon et numéro par `.all()` puis filtrage en mémoire ;
- aucun appel UI/action trouvé.

### 2.3 Modèles impliqués

- `Invoice` : réservation, client, numéro, dates, statut, montants ;
- `InvoiceItem` : facture, description, quantité, prix unitaire, total, formule éventuelle ;
- `ReservationItem` : source des montants facturés.

### 2.4 Appels existants

`generateInvoice` n'est appelé par aucune Server Action, action inline, API route ou composant frontend trouvé.

Les factures sont seulement lues par :

- `src/app/dashboard/client/page.tsx` ;
- `src/app/dashboard/secretary/page.tsx` ;
- `src/app/admin/reservations/[id]/page.tsx` indirectement via paiement/détail ;
- `src/lib/services/crm.ts` ;
- analytics/finance.

### 2.5 Pont minimal nécessaire

```text
UI détail réservation ou action staff
→ Server Action dédiée
→ requireAuth + rôle staff autorisé
→ generateInvoice(reservationId)
→ revalidation détail/CRM
→ retour facture ou erreur à l'UI
```

La Server Action ne doit pas recalculer les montants et ne doit pas recréer les `InvoiceItem`. Elle doit uniquement sécuriser l'appel, appeler le service existant, gérer l'erreur et revalider.

### 2.6 Risques et tests requis

Risques :

- génération possible pour une réservation qui ne devrait pas encore être facturée si aucune règle d'état n'est ajoutée à la frontière ;
- concurrence entre deux générations : le service protège au niveau applicatif mais le comportement doit être testé ;
- numéro pseudo-aléatoire non garanti absolument unique par contrainte examinée ;
- aucune UI de téléchargement/affichage de facture générée identifiée.

Tests :

1. anonyme/CLIENT : refus de l'action staff ;
2. staff autorisé : facture créée avec `customerId` de la réservation ;
3. réservation absente : erreur exploitable ;
4. réservation sans item : erreur ;
5. deuxième génération active : refus sans doublon ;
6. montant facture = somme serveur des `ReservationItem` ;
7. nombre de `InvoiceItem` conforme aux items ;
8. transaction rollback si une ligne échoue ;
9. résultat affiché et page revalidée.

---

## 3. P0 — Bouton « Encaisser »

Fichier exact :

`src/app/admin/reservations/[id]/page.tsx`

Localisation :

- section `Suivi Financier` ;
- autour de la ligne 218 dans l'état audité ;
- bouton texte `Encaisser`.

Condition d'affichage :

```tsx
{user.role !== 'CLIENT' && (
  <button>Encaisser</button>
)}
```

Réservation concernée :

- la réservation chargée par `params.id` ;
- les paiements chargés par `Payment.where({ reservationId: id })`.

Rôles concernés :

- visible pour tout utilisateur autorisé par la page et dont le rôle n'est pas `CLIENT` ;
- la page autorise en amont `ADMIN`, `SUPERVISOR`, `SECRETARY`, `CLIENT` ;
- en pratique, le bouton est visible pour `ADMIN`, `SUPERVISOR`, `SECRETARY`.

Pourquoi aucune action n'est branchée :

- le bouton n'a ni `onClick` ;
- aucun `form action` ;
- aucune Server Action importée ;
- aucun modal ;
- aucun champ montant/méthode/référence ;
- aucun import de `addPayment` ou d'une action de paiement ;
- aucun retour UI.

Correction minimale préparée :

- ajouter le plus petit contrôle d'interface nécessaire au montant/méthode ;
- appeler la Server Action de paiement ;
- laisser `addPayment` gérer le calcul, le verrou, le statut et les écritures ;
- revalider la page et afficher le résultat.

Risques :

- ne pas autoriser le CLIENT ;
- ne pas permettre à l'UI de choisir un `customerId` ;
- éviter une logique de solde dupliquée dans le composant ;
- gérer la double soumission et les erreurs de transaction.

---

## 4. P1 — Réservation réelle

### 4.1 Frontend

Fichier : `src/components/public/BookingWizardClient.tsx`.

Le wizard collecte :

- `formulaId` ;
- `participants` ;
- `startDate` ;
- `startTime` ;
- `locationId`.

Il appelle :

```ts
createReservationAction({
  formulaId,
  startDate: dateObj.toISOString(),
  participants,
  locationId,
  locationType
})
```

Le navigateur n'envoie pas `customerId`.

### 4.2 Server Action et identité

Fichier : `src/lib/actions/reservation-actions.ts`.

La Server Action :

1. appelle `requireAuth` ;
2. refuse `LOGISTICIAN` et `SUPERVISOR` ;
3. utilise `user.customerId` pour `CLIENT` ;
4. si le client n'a pas encore de `customerId`, recherche ou crée un `Customer` par email puis met à jour `User.customerId` ;
5. impose `publicFormulaOnly: user.role === 'CLIENT'` ;
6. impose `performedById: user.id` ;
7. convertit les dates ;
8. appelle `createReservation`.

### 4.3 Service et transaction

Fichier : `src/lib/services/reservation.ts`.

La transaction :

- verrouille la formule ;
- charge la formule publiée et disponible pour un client ;
- vérifie le service parent publié et disponible ;
- charge les ressources ;
- calcule la date de fin par durée si absente ;
- appelle `checkFormulaAvailability` ;
- génère une référence ;
- recalcule le prix depuis la formule ;
- crée la réservation `CONFIRMED`, paiement `PENDING` et historique ;
- crée les allocations d'inventaire ;
- rollback si l'allocation finale échoue.

### 4.4 Prérequis exacts pour un test réel avec un CLIENT existant

Sans créer de compte ni de donnée, il faut disposer de :

1. un utilisateur Supabase existant et connecté dans le navigateur ;
2. un `User` local avec le même `id` Supabase, actif ;
3. un rôle `CLIENT` ;
4. un `customerId` valide, ou un utilisateur dont l'email permet le lazy-sync existant ;
5. une `Customer` correspondante si le test veut éviter le chemin de création lazy ;
6. au moins une `Formula` avec :
   - `availability = true` ;
   - `isPublished = true` ;
   - service parent disponible et publié ;
   - prix et durée cohérents ;
7. au moins un `Location` utilisable, idéalement `isChateau = true` ;
8. une capacité suffisante si `Formula.capacity` n'est pas `null` ;
9. les équipements/ressources requis disponibles si la formule en possède ;
10. un créneau sans chevauchement bloquant ;
11. une session navigateur avec cookies Supabase valides.

Test recommandé, mais non exécuté :

- choisir une formule publique réelle ;
- choisir un lieu réel ;
- sélectionner une date future libre ;
- sélectionner `participants >= 1` et ne dépassant pas la capacité ;
- soumettre ;
- vérifier uniquement en lecture la réponse UI et les lignes créées.

### 4.5 Points de vigilance non corrigés

- validation frontend des dates limitée ;
- `data` est de type `any` ;
- la valeur finale du prix vient du serveur, ce qui est correct ;
- `totalPrice` local est calculé mais non utilisé, la réservation reste au prix forfaitaire `formula.price` ;
- la capacité `null` signifie pas de plafond affiché et le service retourne `9999` pour `availableCapacity` ;
- pas d'endpoint séparé de prévisualisation de disponibilité ;
- aucune exécution réelle n'a été faite dans ce bloc.

---

## 5. P1 — Logistique et maintenance

### 5.1 Actions réellement câblées dans le périmètre

Les mutations logistiques réellement identifiées sont surtout indirectes :

- la réservation appelle `createReservation` et peut créer des `InventoryAllocation` ;
- les pages CMS ont des actions, mais elles sont hors mutation logistique ;
- les pages logistiques auditées chargent les données mais n'importent pas d'actions métier pour leurs boutons.

### 5.2 Boutons sans mutation démontrée

#### Équipements

Fichier : `src/app/(protected)/admin/logistics/equipments/page.tsx`

- `Nouvel équipement` : bouton sans action ;
- `Ajouter une famille` : bouton sans action.

Chaîne observée :

```text
UI → aucune action/API → aucun service → aucune écriture Prisma → aucune DB
```

#### Inventaire

Fichier : `src/app/(protected)/admin/logistics/inventory/page.tsx`

- `Transférer` : bouton sans action ;
- `Entrée / Sortie` : bouton sans action ;
- `Ajuster` par lot : bouton sans action.

Chaîne :

```text
UI → aucune action/API → aucun service de mouvement identifié depuis la page → aucune écriture
```

#### Lieux

Fichier : `src/app/(protected)/admin/logistics/locations/page.tsx`

- `Ajouter` pour les lieux de stockage : bouton sans action ;
- `Ajouter` pour les lieux physiques : bouton sans action.

Les lectures utilisent `StorageLocation` et `Location`, mais aucune mutation n'est branchée par ces boutons.

#### Maintenance

Fichier : `src/app/(protected)/admin/logistics/maintenance/page.tsx`

- `Déclarer une panne` : bouton sans action ;
- `Clôturer` pour les tâches non résolues : bouton sans action.

Les tâches sont lues depuis `EquipmentMaintenance`, mais aucune action de création ou de clôture n'est appelée depuis cette page.

#### Catalogue lié aux opérations

Fichier : `src/app/(protected)/admin/catalogue/page.tsx` et page de service.

- création/gestion de catalogue ;
- gestion des ressources.

Les boutons observés n'ont pas de Server Action ou formulaire branché dans les fichiers audités.

### 5.3 Partiellement câblé

- les dashboards et pages de détail lisent réellement `Equipment`, `Inventory`, `InventoryAllocation`, `EquipmentMaintenance`, `LogisticsMission`, `Delivery`, `Location` ;
- la réservation crée réellement les allocations dans sa transaction ;
- les liens vers les pages existent ;
- les mutations opérationnelles affichées comme CTA ne sont pas reliées.

État global logistique/maintenance : **PARTIAL**, avec plusieurs boutons **FAIL** individuellement.

### 5.4 Risques et tests nécessaires

Risques :

- présentation trompeuse d'un stock modifiable alors que le bouton ne fait rien ;
- absence de journalisation de mutation depuis ces écrans ;
- divergence entre allocation créée par réservation et actions logistiques manuelles inexistantes.

Tests futurs :

- vérifier qu'une action autorisée appelle le bon rôle ;
- vérifier transaction et historique pour mouvement/maintenance ;
- vérifier quantité, statut, inventaire et allocation après mutation ;
- vérifier refus hors rôle ;
- vérifier retour UI et revalidation.

---

## 6. P1 — CRM / CMS : accès anonymes

### 6.1 `/admin/crm`

Fichier : `src/app/admin/crm/page.tsx`.

Chaîne :

```text
GET /admin/crm
→ CRMPage()
→ requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY'])
→ requireAuth()
→ getCurrentUser()
→ throw new Error('Unauthorized') si aucune session
```

La page n'entoure pas cet appel d'une redirection locale. Le résultat observé en smoke test est HTTP 500 avec `Unauthorized` journalisé.

Après autorisation, la page appelle aussi :

- `getCRMDashboardStatsAction()` ;
- `getCustomersAction()` ;
- ces actions répètent `requireRole`.

### 6.2 `/admin/cms`

Fichier : `src/app/admin/cms/page.tsx`.

Chaîne :

```text
GET /admin/cms
→ CMSDashboard()
→ requireAuth()
→ throw new Error('Unauthorized') si aucune session
```

Le test de rôle suivant n'est atteint qu'après authentification :

```ts
await requireRole(['ADMIN'])
```

Le résultat anonyme observé est HTTP 500, également journalisé comme `Unauthorized`.

### 6.3 Correction minimale à choisir

L'architecture contient déjà :

- `redirect('/login')` dans le layout protégé ;
- `getCurrentUser`/`requireAuth` ;
- pages `error.tsx` et `loading.tsx`.

La correction minimale cohérente est de faire entrer CRM/CMS dans la même stratégie que les autres routes protégées : redirection login lorsqu'il n'y a pas de session, puis contrôle de rôle pour produire un refus métier contrôlé si le rôle est insuffisant.

Un simple `401` API n'est pas la stratégie adaptée à ces Server Components HTML. Un `403` pourrait convenir à un utilisateur authentifié sans rôle, mais ne doit pas être simulé par un `Unauthorized` non géré. La décision d'implémentation doit réutiliser les conventions déjà présentes plutôt que créer une nouvelle API.

### 6.4 Tests nécessaires

1. anonyme `/admin/crm` → redirection `/login` ;
2. anonyme `/admin/cms` → redirection `/login` ;
3. CLIENT authentifié → refus contrôlé, sans fuite de données ;
4. SECRETARY/SUPERVISOR CRM → accès ;
5. non-ADMIN CMS → refus contrôlé ;
6. ADMIN → page et données ;
7. aucune réponse 500 pour un cas d'accès attendu.

---

## 7. P1 — Galerie

### 7.1 Chaîne publique

Fichiers :

- `src/app/(public)/gallery/page.tsx` ;
- `src/app/(public)/page.tsx` pour la galerie de la home ;
- `src/components/public/GalleryGrid.tsx` ;
- `src/components/public/Lightbox.tsx`.

La page publique fait :

```text
GalleryItem.include('media').include('gallery').all()
→ tri par order
→ projection media.url / gallery.name / gallery.description
→ GalleryGrid
```

La home suit la même logique avec `GalleryItem` et limite à six éléments.

### 7.2 Champs disponibles

Dans `prisma/schema.prisma` :

- `Gallery` : `id`, `name`, `description`, `createdAt` ;
- `GalleryItem` : `id`, `galleryId`, `mediaId`, `order` ;
- `Media` : `id`, `url`, `storagePath`, `mimeType`, `fileName`, `sizeBytes`, `type`, `altText`, `createdAt`.

Aucun champ `isPublished`, `isVisible`, `status` ou équivalent n'existe sur `Gallery`, `GalleryItem` ou `Media`.

`ContentPage.isPublished` existe, mais il ne s'applique pas aux objets galerie.

### 7.3 Actions CMS

Fichiers :

- `src/lib/actions/gallery-actions.ts` ;
- `src/lib/services/gallery.ts` ;
- `src/lib/services/cms.ts` ;
- `src/lib/actions/media-actions.ts` ;
- `src/lib/services/media.ts`.

Les actions admin permettent :

- créer/modifier/supprimer une galerie ;
- ajouter/retirer des médias ;
- uploader/supprimer un média ;
- revalider les routes CMS.

Elles ne posent pas d'état de publication galerie/média parce qu'aucun champ correspondant n'existe.

### 7.4 Règle réutilisable existante

Une règle de publication générique existe pour :

- `ContentPage.isPublished` ;
- `Service.isPublished` ;
- `Formula.isPublished` avec service parent publié.

Elle n'est pas directement réutilisable pour la galerie sans champ ou convention déjà présente. Utiliser `ContentPage.isPublished` pour filtrer une `Gallery` serait sémantiquement incorrect.

Conclusion galerie : **RISK/PARTIAL**. La page publique expose toute relation `GalleryItem` possédant un média URL ; aucune distinction privé/public n'est démontrée par le modèle actuel.

### 7.5 Correction minimale à décider

Avant correction, il faut une décision explicite :

- soit considérer toute galerie/média existant comme public et documenter cette règle ;
- soit introduire une publication galerie/média, ce qui sort de la simple réutilisation et nécessite une décision de schéma/migration.

Ce bloc ne propose pas d'ajouter un champ.

Tests nécessaires :

1. identifier un média/galerie supposé interne ;
2. vérifier s'il existe une convention de visibilité ailleurs ;
3. vérifier la réponse publique avant/après règle décidée ;
4. vérifier home et `/gallery` simultanément ;
5. vérifier que les actions CMS ne publient pas involontairement un contenu privé.

---

## 8. P1 — Fidélité

### 8.1 Lecture

Fichier : `src/lib/actions/loyalty-actions.ts`.

```ts
getCustomerLoyaltySummaryAction(id)
→ requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY'])
→ getCustomerLoyaltySummary(id)
```

Appelant identifié :

`src/app/admin/crm/clients/[id]/page.tsx`.

Cette page affiche :

- niveau ;
- solde courant ;
- total cumulé ;
- historique indirectement via CRM/summary.

Le dashboard client lit directement `LoyaltyAccount` et `LoyaltyTransaction` filtrés par `customerId`/`accountId`, sans Server Action de mutation.

### 8.2 `getCustomerLoyaltySummary`

Fichier : `src/lib/services/loyalty.ts`.

Fonction :

- recherche le compte par `customerId` ;
- crée éventuellement un niveau par défaut ;
- crée éventuellement un compte de fidélité ;
- charge niveau et transactions ;
- retourne `account`, `level`, `transactions`.

Point important : malgré son nom de lecture, la fonction peut créer un niveau et un compte si absents. Elle n'est donc pas strictement read-only au niveau métier.

### 8.3 `earnLoyaltyPoints`

Signature :

```ts
earnLoyaltyPoints(customerId: string, points: number, referenceId?: string)
```

Contrôles :

- refuse `points <= 0` ;
- transaction ;
- recherche du compte ;
- verrou `LoyaltyAccount FOR UPDATE` ;
- relecture du solde ;
- insertion `LoyaltyTransaction` de type `EARN` ;
- mise à jour du solde et du total cumulé ;
- réévaluation du niveau.

Appelants trouvés : aucun Server Action, page ou composant.

Permissions : aucune dans la fonction elle-même.

État : **orpheline pour l'UI**.

### 8.4 `redeemLoyaltyReward`

Signature :

```ts
redeemLoyaltyReward(customerId: string, rewardId: string)
```

Contrôles :

- transaction ;
- verrou du compte ;
- existence du compte ;
- existence de la récompense ;
- solde suffisant ;
- insertion `LoyaltyTransaction` de type `REDEEM` ;
- diminution du solde.

Appelants trouvés : aucun Server Action, page ou composant.

Permissions : aucune dans la fonction elle-même.

État : **orpheline pour l'UI**.

### 8.5 Démontrabilité actuelle

Possible aujourd'hui :

- démontrer la consultation fidélité depuis une fiche CRM staff ;
- démontrer la lecture du compte client si le compte existe.

Impossible aujourd'hui de démontrer depuis l'UI :

- gagner des points ;
- consommer une récompense ;
- contrôler ces mutations par rôle ;
- afficher un retour de mutation.

Risques :

- si ces fonctions sont exposées sans action sécurisée, `customerId` est contrôlable par l'appelant ;
- aucune action cliente ou staff dédiée ne fixe les permissions ;
- `getCustomerLoyaltySummary` peut écrire pendant une lecture.

Tests nécessaires avant tout câblage :

1. lecture CRM par rôles autorisés ;
2. accès CLIENT à la fiche d'un autre customer refusé si une action est ajoutée ;
3. earn positif ;
4. earn nul/négatif ;
5. concurrence earn ;
6. redeem avec solde suffisant ;
7. redeem avec solde insuffisant ;
8. récompense inexistante ;
9. concurrence redeem ;
10. revalidation UI et affichage du nouveau solde.

---

## 9. Synthèse des corrections minimales préparées

| Sujet | Pont minimal | Ne pas dupliquer |
|---|---|---|
| Paiement | Server Action sécurisée → `addPayment` → revalidation UI | solde, statut, transaction, historique |
| Facture | Server Action sécurisée → `generateInvoice` → revalidation UI | calcul, doublon, numérotation, lignes |
| Encaisser | remplacer bouton décoratif par formulaire/modal utilisant l'action paiement | logique financière |
| Réservation réelle | test avec compte CLIENT et données existantes | création de fixtures ou compte |
| Logistique/maintenance | soit câbler actions métier existantes, soit retirer les CTA trompeurs | inventer des règles sans service validé |
| CRM/CMS | homogénéiser redirection/403 avec conventions protégées existantes | API 401 artificielle pour pages HTML |
| Galerie | décision explicite sur la sémantique public/privé | réutiliser abusivement `ContentPage.isPublished` |
| Fidélité | actions sécurisées seulement si démonstration demandée | exposer directement les services sans RBAC |

## 10. Ce qui n'a pas été exécuté

- aucun paiement ;
- aucun remboursement ;
- aucune facture ;
- aucune réservation ;
- aucune création de compte ;
- aucune allocation manuelle ;
- aucun ajustement de stock ;
- aucune clôture de maintenance ;
- aucune mutation de fidélité ;
- aucune migration ;
- aucune écriture PostgreSQL.

## Conclusion

Les P0 paiement/facturation sont prêts pour une implémentation minimale autour des services existants. Le bouton `Encaisser` est précisément identifié comme un bouton sans action. Le parcours réservation est techniquement traçable mais nécessite un compte CLIENT et des données existantes pour une preuve réelle. Les P1 logistique/maintenance sont principalement des lectures avec CTA décoratifs. CRM/CMS ont un défaut d'accès anonyme localisé dans `requireAuth` appelé directement depuis leurs Server Components. La galerie ne possède pas de champ de publication propre à son domaine. La fidélité dispose de primitives transactionnelles mais `earn`/`redeem` sont orphelines et non autorisées par une action.

### READY_FOR_IMPLEMENTATION
