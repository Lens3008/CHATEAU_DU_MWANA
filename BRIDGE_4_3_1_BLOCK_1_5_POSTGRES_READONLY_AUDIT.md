# BRIDGE 4.3.1 — Bloc 1.5 — Audit PostgreSQL direct read-only

## 1. Cadre

- Date/heure : `2026-09-15T12:31:34.2216976+01:00`
- Projet : `C:\laragon\www\CHATEAU DU MWANA`
- Connexion : `DATABASE_URL` existante, scheme PostgreSQL uniquement ; aucune valeur d'URL, identifiant ou secret n'est imprime dans ce rapport.
- Mode : **READ-ONLY strict**.

Les lectures ont utilise le driver `pg` deja present dans `node_modules`, avec des requetes `SELECT` uniquement sur `pg_class`, `pg_namespace`, `pg_constraint`, `pg_attribute`, `pg_policies` et `information_schema.columns`. Aucun package n'a ete installe. Aucun fichier de code, schema, migration, RLS, contrainte ou donnee n'a ete modifie.

Commandes Prisma precedemment etablies et confirmees par lecture :

- contrat courant : `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60` ;
- profile hash : `3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2` ;
- init appliquee : `20260911T1730_init` ;
- publication pending : `20260915T1057_add_publication_flags` ;
- hash publication : `68028fd8eefad37d24973a94473e13eb2eba7d02c4b0d961a7280e598632567f`.

## 2. RLS direct PostgreSQL

### Resultat `pg_class` / `pg_namespace` / `pg_policies`

| Mesure | Nombre |
| --- | ---: |
| Tables du schema `public` | 47 |
| Tables avec `relrowsecurity=true` | 47 |
| Tables avec `relforcerowsecurity=true` | 0 |
| Policies presentes dans `pg_policies` | 0 |
| Tables RLS sans policy | 47 |

Pour chaque table publique, la ligne `pg_policies` correspondante est absente : `policyname`, `permissive`, `roles`, `cmd`, `qual` et `with_check` sont donc `NULL`. Les 47 tables sont RLS-enabled, aucune n'est forcee en RLS, et aucune policy PostgreSQL n'est actuellement enregistree dans `pg_policies`.

### Liste exhaustive des tables RLS sans policy

```text
auditLog, contactMessage, contentPage, customer, delivery, deliveryItem,
documentTemplate, equipment, equipmentCategory, equipmentMaintenance,
equipmentStatusHistory, formula, gallery, galleryItem, importError, importJob,
inventory, inventoryAllocation, inventoryMovement, invoice, invoiceItem, location,
logisticsHistory, logisticsMission, loyaltyAccount, loyaltyLevel, loyaltyReward,
loyaltyTransaction, media, notification, payment, paymentTransaction,
paymentTransactionHistory, permission, refund, reservation, reservationItem,
reservationStatusHistory, role, rolePermission, service, serviceCategory,
serviceResource, siteSettings, storageLocation, user, userRoleAssignment
```

### Interpretation

C'est une protection PostgreSQL reelle : RLS est active sur les 47 tables. L'absence de policy signifie qu'il n'existe aucune regle `SELECT/INSERT/UPDATE/DELETE` dans `pg_policies` pour ces tables. `relforcerowsecurity=false` signifie que le proprietaire de table peut conserver les privileges speciaux du proprietaire ; les roles non proprietaires restent soumis au comportement RLS par defaut. Ce point est potentiellement dangereux a modifier ou a ignorer.

Les lectures directes demontrent donc une configuration RLS physique, mais pas son intention historique. Elle n'est pas declaree dans le contrat Prisma courant ni dans la migration publication. Il serait incorrect de la supprimer ou de l'harmoniser automatiquement avec Prisma.

Policies SELECT, INSERT, UPDATE, DELETE et roles concernes : **aucune policy ne couvre ces operations**, puisque le nombre de policies est zero. Il n'y a donc aucune expression `USING` ni `WITH CHECK` a afficher.

## 3. Foreign keys directes

Lecture directe de `pg_constraint` : 57 FK. Les noms, colonnes, ordre et actions sont les suivants. Les codes PostgreSQL ont ete convertis en libelles :

| Source | Contrainte | Colonne(s) source | Cible | Colonne(s) cible | ON DELETE | ON UPDATE |
| --- | --- | --- | --- | --- | --- | --- |
| `auditLog` | `auditLog_userId_fkey` | userId | `user` | id | SET NULL | NO ACTION |
| `delivery` | `delivery_destinationId_fkey` | destinationId | `location` | id | RESTRICT | NO ACTION |
| `delivery` | `delivery_managerId_fkey` | managerId | `user` | id | SET NULL | NO ACTION |
| `delivery` | `delivery_missionId_fkey` | missionId | `logisticsMission` | id | CASCADE | NO ACTION |
| `delivery` | `delivery_reservationId_fkey` | reservationId | `reservation` | id | RESTRICT | NO ACTION |
| `deliveryItem` | `deliveryItem_deliveryId_fkey` | deliveryId | `delivery` | id | CASCADE | NO ACTION |
| `deliveryItem` | `deliveryItem_equipmentId_fkey` | equipmentId | `equipment` | id | SET NULL | NO ACTION |
| `deliveryItem` | `deliveryItem_inventoryId_fkey` | inventoryId | `inventory` | id | SET NULL | NO ACTION |
| `equipment` | `equipment_categoryId_fkey` | categoryId | `equipmentCategory` | id | RESTRICT | NO ACTION |
| `equipmentMaintenance` | `equipmentMaintenance_inventoryId_fkey` | inventoryId | `inventory` | id | CASCADE | NO ACTION |
| `equipmentMaintenance` | `equipmentMaintenance_responsibleId_fkey` | responsibleId | `user` | id | SET NULL | NO ACTION |
| `equipmentStatusHistory` | `equipmentStatusHistory_changedById_fkey` | changedById | `user` | id | SET NULL | NO ACTION |
| `equipmentStatusHistory` | `equipmentStatusHistory_inventoryId_fkey` | inventoryId | `inventory` | id | CASCADE | NO ACTION |
| `formula` | `formula_serviceId_fkey` | serviceId | `service` | id | CASCADE | NO ACTION |
| `galleryItem` | `galleryItem_galleryId_fkey` | galleryId | `gallery` | id | CASCADE | NO ACTION |
| `galleryItem` | `galleryItem_mediaId_fkey` | mediaId | `media` | id | CASCADE | NO ACTION |
| `importError` | `importError_importJobId_fkey` | importJobId | `importJob` | id | CASCADE | NO ACTION |
| `inventory` | `inventory_equipmentId_fkey` | equipmentId | `equipment` | id | RESTRICT | NO ACTION |
| `inventory` | `inventory_storageLocationId_fkey` | storageLocationId | `storageLocation` | id | SET NULL | NO ACTION |
| `inventoryAllocation` | `inventoryAllocation_inventoryId_fkey` | inventoryId | `inventory` | id | RESTRICT | NO ACTION |
| `inventoryAllocation` | `inventoryAllocation_reservationId_fkey` | reservationId | `reservation` | id | CASCADE | NO ACTION |
| `inventoryMovement` | `inventoryMovement_fromStorageLocationId_fkey` | fromStorageLocationId | `storageLocation` | id | SET NULL | NO ACTION |
| `inventoryMovement` | `inventoryMovement_inventoryId_fkey` | inventoryId | `inventory` | id | CASCADE | NO ACTION |
| `inventoryMovement` | `inventoryMovement_toStorageLocationId_fkey` | toStorageLocationId | `storageLocation` | id | SET NULL | NO ACTION |
| `inventoryMovement` | `inventoryMovement_userId_fkey` | userId | `user` | id | SET NULL | NO ACTION |
| `invoice` | `invoice_customerId_fkey` | customerId | `customer` | id | RESTRICT | NO ACTION |
| `invoice` | `invoice_reservationId_fkey` | reservationId | `reservation` | id | RESTRICT | NO ACTION |
| `invoiceItem` | `invoiceItem_formulaId_fkey` | formulaId | `formula` | id | SET NULL | NO ACTION |
| `invoiceItem` | `invoiceItem_invoiceId_fkey` | invoiceId | `invoice` | id | CASCADE | NO ACTION |
| `location` | `location_customerId_fkey` | customerId | `customer` | id | SET NULL | NO ACTION |
| `logisticsHistory` | `logisticsHistory_changedById_fkey` | changedById | `user` | id | SET NULL | NO ACTION |
| `logisticsHistory` | `logisticsHistory_missionId_fkey` | missionId | `logisticsMission` | id | CASCADE | NO ACTION |
| `logisticsMission` | `logisticsMission_assignedUserId_fkey` | assignedUserId | `user` | id | SET NULL | NO ACTION |
| `logisticsMission` | `logisticsMission_reservationId_fkey` | reservationId | `reservation` | id | RESTRICT | NO ACTION |
| `loyaltyAccount` | `loyaltyAccount_customerId_fkey` | customerId | `customer` | id | RESTRICT | NO ACTION |
| `loyaltyAccount` | `loyaltyAccount_loyaltyLevelId_fkey` | loyaltyLevelId | `loyaltyLevel` | id | RESTRICT | NO ACTION |
| `loyaltyTransaction` | `loyaltyTransaction_accountId_fkey` | accountId | `loyaltyAccount` | id | CASCADE | NO ACTION |
| `loyaltyTransaction` | `loyaltyTransaction_rewardId_fkey` | rewardId | `loyaltyReward` | id | SET NULL | NO ACTION |
| `notification` | `notification_userId_fkey` | userId | `user` | id | CASCADE | NO ACTION |
| `payment` | `payment_reservationId_fkey` | reservationId | `reservation` | id | RESTRICT | NO ACTION |
| `paymentTransaction` | `paymentTransaction_paymentId_fkey` | paymentId | `payment` | id | CASCADE | NO ACTION |
| `paymentTransactionHistory` | `paymentTransactionHistory_transactionId_fkey` | transactionId | `paymentTransaction` | id | CASCADE | NO ACTION |
| `refund` | `refund_paymentTransactionId_fkey` | paymentTransactionId | `paymentTransaction` | id | RESTRICT | NO ACTION |
| `reservation` | `reservation_customerId_fkey` | customerId | `customer` | id | RESTRICT | NO ACTION |
| `reservation` | `reservation_locationId_fkey` | locationId | `location` | id | RESTRICT | NO ACTION |
| `reservationItem` | `reservationItem_formulaId_fkey` | formulaId | `formula` | id | RESTRICT | NO ACTION |
| `reservationItem` | `reservationItem_reservationId_fkey` | reservationId | `reservation` | id | CASCADE | NO ACTION |
| `reservationStatusHistory` | `reservationStatusHistory_changedById_fkey` | changedById | `user` | id | SET NULL | NO ACTION |
| `reservationStatusHistory` | `reservationStatusHistory_reservationId_fkey` | reservationId | `reservation` | id | CASCADE | NO ACTION |
| `rolePermission` | `rolePermission_permissionId_fkey` | permissionId | `permission` | id | CASCADE | NO ACTION |
| `rolePermission` | `rolePermission_roleId_fkey` | roleId | `role` | id | CASCADE | NO ACTION |
| `service` | `service_categoryId_fkey` | categoryId | `serviceCategory` | id | RESTRICT | NO ACTION |
| `serviceResource` | `serviceResource_equipmentId_fkey` | equipmentId | `equipment` | id | RESTRICT | NO ACTION |
| `serviceResource` | `serviceResource_formulaId_fkey` | formulaId | `formula` | id | CASCADE | NO ACTION |
| `user` | `user_customerId_fkey` | customerId | `customer` | id | SET NULL | NO ACTION |
| `userRoleAssignment` | `userRoleAssignment_roleId_fkey` | roleId | `role` | id | CASCADE | NO ACTION |
| `userRoleAssignment` | `userRoleAssignment_userId_fkey` | userId | `user` | id | CASCADE | NO ACTION |

### Comparaison Prisma

Les 57 FK sont presentes dans le schema reel avec les colonnes et cibles attendues par le modele. Les ecarts signales par Prisma portent surtout sur la representation, les noms PostgreSQL, l'ordre introspecte et `onDelete`. Une difference de nom est **NOMINALE** ; une difference de colonnes ou d'action referentielle est **INCONCLUSIVE** ou potentiellement **FONCTIONNELLE** tant que sa semantique n'est pas comparee au snapshot champ par champ. Aucun changement de FK n'est demontre comme cause du Bloc 1.1.

## 4. PRIMARY KEY

Lecture directe : 47 PK pour 47 tables publiques. Les 45 tables simples ont une PK `id`; les deux PK composees sont :

| Table | Nom reel | Colonnes dans l'ordre |
| --- | --- | --- |
| `rolePermission` | `rolePermission_pkey` | roleId, permissionId |
| `userRoleAssignment` | `userRoleAssignment_pkey` | userId, roleId |

Les 45 autres PK sont de la forme `<table>_pkey` sur la colonne `id`. Le contrat Prisma encode les colonnes, pas les noms PostgreSQL introspectes. Conclusion : difference de nom **NOMINALE** quand les colonnes correspondent ; 47 differences de nom PK ne prouvent pas une difference fonctionnelle.

## 5. UNIQUE

Lecture directe : 18 contraintes UNIQUE.

| Table | Nom reel | Colonnes dans l'ordre |
| --- | --- | --- |
| `contentPage` | `contentPage_slug_key` | slug |
| `customer` | `customer_email_key` | email |
| `equipmentCategory` | `equipmentCategory_name_key` | name |
| `galleryItem` | `galleryItem_galleryId_mediaId_key` | galleryId, mediaId |
| `invoice` | `invoice_number_key` | number |
| `loyaltyAccount` | `loyaltyAccount_customerId_key` | customerId |
| `loyaltyLevel` | `loyaltyLevel_name_key` | name |
| `payment` | `payment_reservationId_key` | reservationId |
| `paymentTransaction` | `paymentTransaction_transactionReference_key` | transactionReference |
| `permission` | `permission_name_key` | name |
| `reservation` | `reservation_reference_key` | reference |
| `role` | `role_name_key` | name |
| `serviceCategory` | `serviceCategory_name_key` | name |
| `serviceResource` | `serviceResource_formulaId_equipmentId_key` | formulaId, equipmentId |
| `siteSettings` | `siteSettings_key_key` | key |
| `storageLocation` | `storageLocation_name_key` | name |
| `user` | `user_customerId_key` | customerId |
| `user` | `user_email_key` | email |

Les colonnes et leur ordre correspondent aux uniques attendues par le contrat emis selon l'introspection Prisma disponible. Les differences observees sont donc principalement **NOMINALES** (`*_key` present en base, nom absent du noeud attendu). Aucune difference de couverture de colonnes n'est demontree.

## 6. CHECK constraints

Lecture directe : 29 CHECK. Les expressions exactes PostgreSQL sont :

| Table | Nom | Expression exacte |
| --- | --- | --- |
| `contactMessage` | `contactMessage_status_check_4518e741` | `status = ANY (ARRAY['NEW','READ','REPLIED','ARCHIVED'])` |
| `delivery` | `delivery_status_check_fba5e1b9` | `status = ANY (ARRAY['PLANNED','EN_ROUTE','DELIVERED','RETURNED','FAILED'])` |
| `delivery` | `delivery_type_check_b5337bb0` | `type = ANY (ARRAY['OUTBOUND','INBOUND'])` |
| `documentTemplate` | `documentTemplate_type_check_eaf18084` | `type = ANY (ARRAY['INVOICE','CONTRACT','QUOTE'])` |
| `equipmentMaintenance` | `equipmentMaintenance_status_check_2e842c7c` | `status = ANY (ARRAY['PENDING','IN_PROGRESS','RESOLVED'])` |
| `equipmentStatusHistory` | `equipmentStatusHistory_newStatus_check_851024d2` | `newStatus = ANY (ARRAY['AVAILABLE','IN_USE','IN_MAINTENANCE','LOST'])` |
| `equipmentStatusHistory` | `equipmentStatusHistory_oldStatus_check_ad4c2533` | `oldStatus = ANY (ARRAY['AVAILABLE','IN_USE','IN_MAINTENANCE','LOST'])` |
| `importJob` | `importJob_status_check_48358bb5` | `status = ANY (ARRAY['PENDING','PROCESSING','COMPLETED','FAILED'])` |
| `inventory` | `inventory_status_check_1657f4be` | `status = ANY (ARRAY['AVAILABLE','IN_USE','IN_MAINTENANCE','LOST'])` |
| `inventoryAllocation` | `inventoryAllocation_status_check_08c2369b` | `status = ANY (ARRAY['RESERVED','DEPLOYED','RETURNED'])` |
| `inventoryMovement` | `inventoryMovement_type_check_705a8c12` | `type = ANY (ARRAY['IN','OUT','TRANSFER','ADJUSTMENT','MAINTENANCE','LOST','RETURN'])` |
| `invoice` | `invoice_status_check_6cdc860a` | `status = ANY (ARRAY['DRAFT','ISSUED','PAID','CANCELLED'])` |
| `logisticsHistory` | `logisticsHistory_newStatus_check_19495c99` | `newStatus = ANY (ARRAY['A_PLANIFIER','PLANIFIEE','EN_PREPARATION','EN_COURS','TERMINEE','ANNULEE','INCIDENT'])` |
| `logisticsHistory` | `logisticsHistory_oldStatus_check_762a4243` | `oldStatus = ANY (ARRAY['A_PLANIFIER','PLANIFIEE','EN_PREPARATION','EN_COURS','TERMINEE','ANNULEE','INCIDENT'])` |
| `logisticsMission` | `logisticsMission_status_check_44f07a2f` | `status = ANY (ARRAY['A_PLANIFIER','PLANIFIEE','EN_PREPARATION','EN_COURS','TERMINEE','ANNULEE','INCIDENT'])` |
| `loyaltyTransaction` | `loyaltyTransaction_type_check_bb61f4b2` | `type = ANY (ARRAY['EARN','REDEEM'])` |
| `media` | `media_type_check_7891ea4f` | `type = ANY (ARRAY['IMAGE','VIDEO','DOCUMENT'])` |
| `notification` | `notification_type_check_cc0e2314` | `type = ANY (ARRAY['SYSTEM','REMINDER','PROMO'])` |
| `payment` | `payment_status_check_df09fd67` | `status = ANY (ARRAY['PENDING','PARTIAL','PAID','PARTIAL_REFUNDED','FULLY_REFUNDED'])` |
| `paymentTransaction` | `paymentTransaction_method_check_1ecd3a38` | `method = ANY (ARRAY['CASH','CARD','MOBILE_MONEY','BANK_TRANSFER','CHEQUE'])` |
| `paymentTransaction` | `paymentTransaction_status_check_f32a67f1` | `status = ANY (ARRAY['PENDING','SUCCESS','FAILED'])` |
| `paymentTransactionHistory` | `paymentTransactionHistory_newStatus_check_141b1df9` | `newStatus = ANY (ARRAY['PENDING','SUCCESS','FAILED'])` |
| `paymentTransactionHistory` | `paymentTransactionHistory_oldStatus_check_8a48e609` | `oldStatus = ANY (ARRAY['PENDING','SUCCESS','FAILED'])` |
| `reservation` | `reservation_locationType_check_42c3f8b3` | `locationType = ANY (ARRAY['VENUE','CUSTOMER_ADDRESS','OTHER_LOCATION'])` |
| `reservation` | `reservation_paymentStatus_check_29030a90` | `paymentStatus = ANY (ARRAY['PENDING','PARTIAL','PAID','PARTIAL_REFUNDED','FULLY_REFUNDED'])` |
| `reservation` | `reservation_status_check_9b91110c` | `status = ANY (ARRAY['DRAFT','CONFIRMED','COMPLETED','CANCELLED'])` |
| `reservationStatusHistory` | `reservationStatusHistory_newStatus_check_b0e24a0d` | `newStatus = ANY (ARRAY['DRAFT','CONFIRMED','COMPLETED','CANCELLED'])` |
| `reservationStatusHistory` | `reservationStatusHistory_oldStatus_check_b8deddf7` | `oldStatus = ANY (ARRAY['DRAFT','CONFIRMED','COMPLETED','CANCELLED'])` |
| `user` | `user_role_check_22a1f566` | `role = ANY (ARRAY['ADMIN','SUPERVISOR','SECRETARY','LOGISTICIAN','CLIENT'])` |

Les expressions SQL sont une normalisation PostgreSQL de listes enumerees. Elles correspondent semantiquement aux ensembles de valeurs enum du contrat pour les tables critiques lorsque les valeurs sont comparees, meme si les chaines `expected` et `actual` ne sont pas identiques. Difference : principalement **REPRESENTATION**, pas difference fonctionnelle demontree.

## 7. Defaults

Lecture directe : 62 colonnes publiques ont un default. Les defaults critiques lus directement sont :

| Table | Colonne | Type | Default PostgreSQL exact | Evaluation |
| --- | --- | --- | --- | --- |
| `formula` | availability | boolean | `true` | valeur equivalente au contrat |
| `formula` | isPublished | boolean | `false` | valeur attendue Bloc 1.1 |
| `service` | availability | boolean | `true` | valeur equivalente au contrat |
| `service` | isPublished | boolean | `false` | valeur attendue Bloc 1.1 |
| `reservation` | createdAt | timestamptz | `now()` | valeur equivalente |
| `reservation` | paymentStatus | text | `'PENDING'::text` | valeur equivalente |
| `reservation` | status | text | `'DRAFT'::text` | valeur equivalente |
| `reservationItem` | quantity | integer | `1` | valeur equivalente |
| `payment` | createdAt | timestamptz | `now()` | valeur equivalente |
| `payment` | status | text | `'PENDING'::text` | valeur equivalente |
| `payment` | totalPaid | numeric | `'0'::numeric` | valeur equivalente |
| `paymentTransaction` | date | timestamptz | `now()` | valeur equivalente |
| `paymentTransaction` | status | text | `'PENDING'::text` | valeur equivalente |
| `refund` | date | timestamptz | `now()` | valeur equivalente |
| `invoice` | createdAt | timestamptz | `now()` | valeur equivalente |
| `invoice` | issueDate | timestamptz | `now()` | valeur equivalente |
| `invoice` | status | text | `'DRAFT'::text` | valeur equivalente |
| `customer` | createdAt | timestamptz | `now()` | valeur equivalente |
| `user` | createdAt | timestamptz | `now()` | valeur equivalente |
| `user` | isActive | boolean | `true` | valeur equivalente |
| `user` | role | text | `'CLIENT'::text` | valeur equivalente |

Les autres defaults lus concernent notamment `delivery`, `deliveryItem`, `equipment`, `equipmentMaintenance`, `inventory`, `inventoryAllocation`, `location` et `logisticsMission`; ils sont inclus dans le comptage direct de 62. La sortie Prisma avait signale les defaults comme sous-differences car la base expose un texte SQL `default` en plus de `resolvedDefault`. Aucune valeur reelle differente n'est demontree dans les tables critiques.

## 8. Tables critiques

| Table | Etat direct | Difference potentiellement fonctionnelle demontree ? |
| --- | --- | --- |
| `reservation` | FK RESTRICT vers customer/location, 3 CHECK, UNIQUE reference, PK id, RLS sans policy | non demontree ; RLS peut bloquer les roles non proprietaires |
| `reservationItem` | FK CASCADE reservation, RESTRICT formula, PK id | non demontree |
| `payment` | FK RESTRICT reservation, UNIQUE reservationId, CHECK status, defaults coherents | non demontree |
| `paymentTransaction` | FK CASCADE payment, UNIQUE transactionReference, 2 CHECK | non demontree |
| `refund` | FK RESTRICT paymentTransaction | non demontree |
| `invoice` | FK RESTRICT customer/reservation, UNIQUE number, CHECK status | non demontree |
| `customer` | UNIQUE email, PK id | non demontree |
| `user` | FK SET NULL customer, UNIQUE email/customerId, CHECK role | non demontree |
| `userRoleAssignment` | PK composee, FK CASCADE user/role | non demontree |
| `role` | UNIQUE name, PK id | non demontree |
| `rolePermission` | FK CASCADE role/permission, PK composee | non demontree |
| `service` | FK RESTRICT category, publication column conforme, RLS sans policy | non demontree ; RLS peut bloquer les roles non proprietaires |
| `formula` | FK CASCADE service, publication column conforme, RLS sans policy | non demontree ; RLS peut bloquer les roles non proprietaires |
| `location` | FK SET NULL customer | non demontree |
| `inventory` | FK RESTRICT equipment, SET NULL storageLocation, CHECK status | non demontree |
| `inventoryAllocation` | FK RESTRICT inventory, CASCADE reservation, CHECK status | non demontree |
| `delivery` | 4 FK, 2 CHECK, defaults | non demontree |
| `deliveryItem` | 3 FK, quantity default 1 | non demontree |
| `logisticsMission` | 2 FK, CHECK status, default | non demontree |
| `equipment` | FK RESTRICT category | non demontree |
| `equipmentMaintenance` | 2 FK, CHECK status, default | non demontree |

Conclusion pour les tables critiques : les objets physiques, colonnes, colonnes FK, actions et checks sont presents ; les issues Prisma ne demontrent pas qu'une regle metier critique est fausse. En revanche, RLS active sans policy est un etat de securite reel et potentiellement bloquant qui doit etre preserve jusqu'a decision explicite.

## 9. Verification de la migration publication et fixtures

Les deux colonnes physiques sont confirmees :

| Colonne | Existe | Type | NOT NULL | DEFAULT |
| --- | --- | --- | --- | --- |
| `formula.isPublished` | oui | boolean | oui | false |
| `service.isPublished` | oui | boolean | oui | false |

Lecture directe des quatre fixtures :

| Type | Nom | ID | availability | isPublished | Parent |
| --- | --- | --- | ---: | ---: | --- |
| Formula | `TEST_FORMULA` | `adb95fbe-259c-46f1-b291-8df4f489368d` | true | false | `TEST_SERVICE`, true/false |
| Formula | `TEST_B3_FORMULA` | `96321241-b3a8-4a78-80c4-32ba07253308` | true | false | `TEST_B3_SERVICE`, true/false |
| Service | `TEST_SERVICE` | `0008a39d-a1d9-44c4-b739-4cd19d58c8f6` | true | false | 1 formule |
| Service | `TEST_B3_SERVICE` | `6e984d01-aec9-4522-9881-98e2866a523b` | true | false | 1 formule |

La migration sur disque declare bien les deux ajouts `DEFAULT false NOT NULL` et le backfill qui remet les quatre fixtures a `false`. La migration n'a pas ete appliquee ni marquee applied pendant ce bloc.

## 10. Comparaison Prisma / PostgreSQL

A. Les 47 differences sont-elles principalement des differences de representation/historique ?

**Oui, principalement.** Les 47 issues sont preexistantes au changement `isPublished` selon les preuves des Blocs 1.1/1.2 et couvrent les 47 tables. Les PK/UNIQUE sont nominales ; les CHECK sont semantiquement equivalentes pour les ensembles enumeres ; les defaults critiques sont equivalents ; les FK ont les memes formes principales mais doivent rester sous surveillance pour leurs actions.

B. Existe-t-il des differences fonctionnelles demontrees ?

**Aucune difference de colonne, type, index, couverture UNIQUE, valeur de default critique ou ensemble CHECK n'est demontree comme fonctionnellement incorrecte.** Les actions FK directes sont lues et coherentes avec les relations du modele, mais la comparaison exhaustive des snapshots n'est pas une preuve que chaque difference de representation est inoffensive. RLS sans policy est fonctionnellement un etat de securite reel, pas une simple difference de nom.

C. Existe-t-il des protections RLS reelles dangereuses a modifier ?

**Oui.** RLS est active sur les 47 tables. Meme sans policy, cet etat peut restreindre les roles non proprietaires. `relforcerowsecurity=false` ne supprime pas ce risque. Toute desactivation ou modification serait une action de securite a haut risque.

D. Est-il actuellement sûr de faire `migrate resolve` ?

**Non, pas selon les preuves disponibles.** Les colonnes et fixtures sont conformes, mais le marqueur Prisma reste pending et l'etat RLS/contraintes historiques n'est pas represente par le contrat. `resolve` pourrait marquer uniquement l'historique Prisma sans expliquer les 47 divergences et sans etablir l'intention de RLS.

## 11. Matrice synthetique

| Element | Nombre | Nominal | Fonctionnel | Inconclusif |
| --- | ---: | ---: | ---: | ---: |
| RLS | 47 tables | 0 | 47 protections actives sans policy | intention historique non demontree |
| PK | 47 | 47 noms `*_pkey` | 0 demontre | 0 |
| FK | 57 | noms/representation pour une partie | 0 demontre incorrect | comparaison semantique exhaustive des actions |
| UNIQUE | 18 | 18 noms `*_key` | 0 demontre | 0 couverture differente demontree |
| CHECK | 29 | expressions PostgreSQL normalisees | 0 demontre | equivalence textuelle de tous les details |
| DEFAULT | 62 | representation `default`/`resolvedDefault` | 0 valeur critique differente demontree | quelques representations non normalisees |

## 12. Recommandation et verdict

`RECOMMANDATION = NE PAS MODIFIER`

Ne pas executer `migrate resolve`, ne pas desactiver RLS, ne pas renommer/recreer les contraintes et ne pas appliquer de migration corrective sur la base de cet audit. Les preuves etablissent l'etat physique, mais pas une strategie sure pour aligner le marqueur Prisma avec une base qui a RLS active sans policy et un historique de metadonnees divergent.

Preuves encore manquantes pour un verdict READY :

- intention documentee de RLS active sans policy sur les 47 tables ;
- accord explicite sur les invariants PostgreSQL externes au contrat Prisma ;
- comparaison semantique et gouvernance des differences FK/check/default pour tous les environnements ;
- decision sur la source de verite du marqueur Prisma.

**Verdict : `PRISMA_RECONCILIATION_NEEDS_EVIDENCE`**
