# BRIDGE 4.3.1 — BLOC 1.12
# Audit FK + préparation du rôle runtime non-bypass

> Document généré en lecture seule, sans modification du projet, sans migration, sans création de rôle, sans modification de Prisma ni de RLS.

## 1. Résumé exécutif

- Source de vérité applicative : `prisma/schema.prisma`.
- Source de vérité physique : PostgreSQL `pg_constraint`, `pg_attribute`, `pg_class`, `pg_namespace`.
- Inventaire valide : 57 relations FK de l’application déclarées dans Prisma (`@relation(fields: [...])`).
- Inventaire physique global PostgreSQL : 86 contraintes FK, dont 29 appartiennent à des tables système / Supabase / auth / extension et ne sont pas des relations applicatives de cette base fonctionnelle.
- Aucune divergence fonctionnelle démontrée entre le contrat Prisma et la base PostgreSQL pour les 57 FK applicatives.
- Aucun correctif recommandé sur les FK de l’application dans ce bloc.
- Le rôle actuel `postgres` ne constitue pas une preuve suffisante du comportement attendu d’un rôle runtime dédié non-bypass.
- Le bloc doit rester en statut `READ_ONLY_COMPLETE` tant que le rôle runtime cible et la gouvernance de privilèges ne sont pas validés par une étape humaine dédiée.

### Conclusion courte

Le contrat Prisma et la couche PostgreSQL sont cohérents pour les relations applicatives du projet. Les FK de l’application ne présentent pas de divergence fonctionnelle prouvée. La cause principale de la différence de nombre (57 vs 86) est la présence de tables système / auth / Supabase hors contrat applicatif.

## 2. Méthode d’audit

Le contrôle a été strictement lecture seule :

- inspection du fichier `prisma/schema.prisma` ;
- inspection des contraintes PostgreSQL via `pg_constraint` ;
- inspection des colonnes de référence via `pg_attribute` ;
- comparaison des actions `ON DELETE` / `ON UPDATE` ;
- vérification des tables critiques demandées ;
- exclusion explicite des objets non applicatifs (`auth.*`, tables système Supabase, etc.) du compte de référence applicatif.

## 3. Inventaire des 57 FK applicatives

### 3.1 Comptes de référence

- Prisma applicatif : 57 FK.
- PostgreSQL physique total : 86 FK.
- Différence de `29` : objets hors contrat applicatif (auth, système, extensions).

### 3.2 Matrice exhaustive des FK001-FK057

| ID | Table source | Colonne(s) source | Table cible | Colonne(s) cible | PG ON DELETE | PG ON UPDATE | Prisma attendu | Classification | Impact fonctionnel |
|---|---|---|---|---|---|---|---|---|---|
| FK001 | User | customerId | Customer | id | SET NULL | NO ACTION | `@relation(fields: [customerId], references: [id], onDelete: SetNull)` | EQUIVALENT | Aucun |
| FK002 | RolePermission | roleId | Role | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK003 | RolePermission | permissionId | Permission | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK004 | UserRoleAssignment | userId | User | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK005 | UserRoleAssignment | roleId | Role | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK006 | LoyaltyAccount | customerId | Customer | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK007 | LoyaltyAccount | loyaltyLevelId | LoyaltyLevel | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK008 | LoyaltyTransaction | accountId | LoyaltyAccount | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK009 | LoyaltyTransaction | rewardId | LoyaltyReward | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK010 | Location | customerId | Customer | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK011 | Service | categoryId | ServiceCategory | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK012 | Formula | serviceId | Service | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK013 | Reservation | customerId | Customer | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK014 | Reservation | locationId | Location | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK015 | ReservationItem | reservationId | Reservation | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK016 | ReservationItem | formulaId | Formula | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK017 | ReservationStatusHistory | reservationId | Reservation | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK018 | ReservationStatusHistory | changedById | User | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK019 | Invoice | reservationId | Reservation | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK020 | Invoice | customerId | Customer | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK021 | InvoiceItem | invoiceId | Invoice | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK022 | InvoiceItem | formulaId | Formula | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK023 | Payment | reservationId | Reservation | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK024 | PaymentTransaction | paymentId | Payment | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK025 | Refund | paymentTransactionId | PaymentTransaction | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK026 | PaymentTransactionHistory | transactionId | PaymentTransaction | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK027 | Equipment | categoryId | EquipmentCategory | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK028 | ServiceResource | formulaId | Formula | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK029 | ServiceResource | equipmentId | Equipment | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK030 | Inventory | equipmentId | Equipment | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK031 | Inventory | storageLocationId | StorageLocation | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK032 | InventoryMovement | inventoryId | Inventory | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK033 | InventoryMovement | userId | User | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK034 | InventoryMovement | fromStorageLocationId | StorageLocation | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK035 | InventoryMovement | toStorageLocationId | StorageLocation | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK036 | InventoryAllocation | reservationId | Reservation | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK037 | InventoryAllocation | inventoryId | Inventory | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK038 | EquipmentMaintenance | inventoryId | Inventory | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK039 | EquipmentMaintenance | responsibleId | User | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK040 | EquipmentStatusHistory | inventoryId | Inventory | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK041 | EquipmentStatusHistory | changedById | User | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK042 | LogisticsMission | reservationId | Reservation | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK043 | LogisticsMission | assignedUserId | User | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK044 | LogisticsHistory | missionId | LogisticsMission | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK045 | LogisticsHistory | changedById | User | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK046 | Delivery | missionId | LogisticsMission | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK047 | Delivery | reservationId | Reservation | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK048 | Delivery | destinationId | Location | id | RESTRICT | NO ACTION | `onDelete: Restrict` | EQUIVALENT | Aucun |
| FK049 | Delivery | managerId | User | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK050 | DeliveryItem | deliveryId | Delivery | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK051 | DeliveryItem | inventoryId | Inventory | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK052 | DeliveryItem | equipmentId | Equipment | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |
| FK053 | GalleryItem | galleryId | Gallery | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK054 | GalleryItem | mediaId | Media | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK055 | Notification | userId | User | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK056 | ImportError | importJobId | ImportJob | id | CASCADE | NO ACTION | `onDelete: Cascade` | EQUIVALENT | Aucun |
| FK057 | AuditLog | userId | User | id | SET NULL | NO ACTION | `onDelete: SetNull` | EQUIVALENT | Aucun |

## 4. Analyse détaillée des actions ON DELETE / ON UPDATE

### 4.1 ON DELETE

Les actions PostgreSQL observées sur les 57 FK applicatives sont cohérentes avec les déclarations Prisma :

- `CASCADE` : 18 relations applicatives ; correspond à `onDelete: Cascade` dans Prisma.
- `RESTRICT` : 15 relations applicatives ; correspond à `onDelete: Restrict` dans Prisma.
- `SET NULL` : 12 relations applicatives ; correspond à `onDelete: SetNull` dans Prisma.
- `NO ACTION` : valeur implicite du moteur PostgreSQL lorsqu’aucune action n’est explicitement définie ; équivalent au comportement Prisma par défaut.

Autrement dit, aucune action PostgreSQL ne diverge d’une manière fonctionnelle de la déclaration Prisma sur le périmètre applicatif.

### 4.2 ON UPDATE

Dans toutes les contraintes applicatives vérifiées, `ON UPDATE` est `NO ACTION` dans PostgreSQL, ce qui correspond au comportement par défaut Prisma. Il n’y a pas de preuve d’une divergence fonctionnelle sur l’update.

### 4.3 Cas de représentation vs. nommage

Les différences de nom de table ou de contrainte (par exemple `"user"` vs `User`, `"logisticsMission"` vs `LogisticsMission`) sont des différences de représentation SQL/Prisma, pas des anomalies fonctionnelles. Elles ne changent ni la cardinalité ni les règles de référence.

## 5. Analyse des relations inverses

Les relations inverses sont cohérentes avec les modèles Prisma. La plupart des relations sont univoques :

- `Reservation` -> `ReservationItem` (1:N) ; `ReservationItem` -> `Reservation` (N:1)
- `Inventory` -> `InventoryMovement` / `InventoryAllocation` / `EquipmentMaintenance` / `EquipmentStatusHistory` ; relations inverses cohérentes
- `Delivery` -> `DeliveryItem` ; `LogisticsMission` -> `Delivery` ; `Reservation` -> `Payment` / `Invoice` ; etc.
- Les relations sur `User` (audit, assignments, deliveries, mission assignment, notifications, maintenance, status history, movement authoring) sont bien mappées sur des champs distincts et des noms Prisma dissociés.

Les cas multi-relations sur `User` / `Location` / `StorageLocation` / `Delivery` ne créent pas de divergence : les noms Prisma de relation inverse (`MissionAssignedUser`, `DeliveryManager`, `DeliveryDestination`, `StorageMovementFrom`, `StorageMovementTo`, etc.) sont explicitement dissociés et le schéma SQL les reflète correctement.

## 6. FK fonctionnelles, nominales, équivalentes

### 6.1 Comptage

- Nombre FK nominales : 0
- Nombre représentationnelles : 0
- Nombre équivalentes : 57
- Nombre fonctionnelles : 0
- Nombre inconclusives : 0

### 6.2 État des FK

Aucune FK de l’application ne requiert une correction de sécurité ou de cohérence fonctionnelle dans cette étape. Toutes les 57 relations applicatives sont fonctionnellement équivalentes entre Prisma et PostgreSQL.

### 6.3 FK potentiellement à corriger

Aucune.

### 6.4 FK nécessitant preuve supplémentaire

Aucune pour les 57 FK applicatives. Les différences observées ne sont pas fonctionnelles mais liées à la diffusion des objets système et aux conventions de représentation.

### 6.5 FK sans action nécessaire

Les 57 FK applicatives listées ci-dessus sont sans action nécessaire.

## 7. Audit du futur rôle runtime non-bypass

### 7.1 Problème essentiel

Le rôle actuel `postgres` est un rôle de maintenance. Il ne peut pas servir de preuve pour un rôle runtime cible non-bypass, par définition :

- il possède normalement des privilèges de maintenance ;
- il est distinct de la cible applicative ;
- il n’a pas la même politique de sécurité que le rôle dédié au runtime ;
- il est inapte à valider un rôle avec un modèle de privilèges limités.

### 7.2 Principe de séparation

- Rôle maintenance : `postgres` (ou équivalent de gestion d’infra)
- Rôle migration : rôle dédié à la création / validation de schéma / scripts de migration
- Rôle runtime : rôle d’application avec privilèges minimum pour les opérations réellement utilisées par l’app

### 7.3 Privilèges minimum envisagés

Le rôle runtime n’a pas besoin de droits de migration ou de maintenance. Il a besoin au minimum de :

- `SELECT` sur les tables applicatives nécessaires ;
- `INSERT` sur les tables que l’application écrit ;
- `UPDATE` sur les colonnes réellement modifiées ;
- `DELETE` seulement si le flux métier l’exige ;
- `USAGE` sur les séquences nécessaires ;
- accès aux objets de relation (FK, index) via le modèle fonctionnel, sans permission de changement de structure ;
- pas de `ALTER TABLE`, pas de `DROP`, pas de `CREATE ROLE`, pas de changement de RLS, pas de prise de propriété.

### 7.4 Réalité constatée

Le rôle `postgres` ne montre que la capacité de maintenance globale ; il ne démontre en aucun cas le comportement d’un runtime restreint ou non-bypass.

## 8. Séparation des rôles

### 8.1 Rôle maintenance

- Objectif : opérations de gestion infra / correction de schéma / vérification de l’environnement
- Niveau : élevé
- Bypass RLS : autorisé selon l’architecture de maintenance
- Usage autorisé : inspection, diagnostiques, patchs, maintenance, diagnostic SQL
- Usage interdit : exécution applicative courante, manipulation en production du business logic, privilèges de runtime

### 8.2 Rôle migration

- Objectif : exécuter les changements structuraux planifiés
- Niveau : intermédiaire
- Bypass RLS : non requis pour la logique applicative ; dépend de l’architecture de la migration
- Usage autorisé : création / validation / revue de migration
- Usage interdit : exécution transactionnelle métier routinière, lecture des données “runtime” sans nécessité

### 8.3 Rôle runtime

- Objectif : servir l’application et les flux métiers
- Niveau : minimum nécessaire au fonctionnement
- Bypass RLS : non-prévu pour un rôle de runtime dédié; le rôle cible ne doit pas contourner les règles de sécurité métier
- Usage autorisé : lecture/écriture métier limitées et justement autorisées
- Usage interdit : changement de schéma, création de rôle, modification de privilèges, maintenance globale

## 9. Plan de test futur du rôle non-bypass

Le plan ci-dessous doit être exécuté dans un environnement dédié, plus tard, avec un vrai rôle runtime non-bypass, et non avec `postgres`.

1. `SELECT` autorisé sur tables applicatives
2. `INSERT` autorisé sur flux métier autorisés
3. `UPDATE` autorisé sur colonnes métier précises
4. `DELETE` autorisé uniquement si requis et limité
5. accès interdit aux objets de maintenance / schema admin / rôles / extensions
6. comportement RLS validé séparément de la permission de rôle
7. comportement `CLIENT` vérifié
8. comportement `SECRETARY` vérifié
9. comportement `SUPERVISOR` vérifié
10. comportement `LOGISTICIAN` vérifié
11. isolement `Customer A` / `Customer B`
12. réservation
13. paiement
14. facture
15. stock
16. livraison
17. maintenance

Ces tests doivent être exécutés en dehors de ce bloc, sans utiliser `postgres` pour conclure au succès du rôle cible.

## 10. Impact sur `add_publication_flags`

- La migration `add_publication_flags` est physiquement présente dans l’arborescence des migrations.
- Les colonnes booléennes de publication sont présentes dans le modèle de données.
- Les données sont déjà validées sur le périmètre qui a été vérifié dans le bloc précédent.
- Le marqueur Prisma est encore `pending` ; cela ne démontre pas une divergence SQL fonctionnelle sur la FK, mais indique un état de synchronisation non finalisé au niveau du contrat / migration.
- Aucune modification, réconciliation automatique ou migration corrective n’est autorisée dans ce bloc.

## 11. Risques

- Risque réel de confusion entre `postgres` et un rôle runtime de production.
- Risque de considérer les objets système / Supabase comme des relations d’application.
- Risque de sur-privilèges si la séparation runtime / migration / maintenance n’est pas explicitée.
- Risque de faux positif si on compare simplement les noms des tables sans comparer les contraintes réelles et les opérations SQL.

## 12. Recommandations

1. Ne pas corriger de FK tant qu’aucune divergence fonctionnelle n’est démontrée.
2. Séparer explicitement les rôles maintenance / migration / runtime.
3. Valider la gouvernance du runtime avant toute réconciliation de marqueur Prisma ou migration corrective.
4. Tracer les privilèges minimum à l’échelle de chaque flux métier.
5. Utiliser un vrai rôle de runtime dédié avec tests de non-bypass dans une phase ultérieure.

## 13. Ce qui ne doit pas être exécuté

- aucune modification Prisma ;
- aucune migration ;
- aucun `prisma migrate` ;
- aucun `db push` ;
- aucun `ALTER` ;
- aucun `CREATE ROLE` ;
- aucun `DROP ROLE` ;
- aucun `GRANT` / `REVOKE` ;
- aucun changement RLS / policy ;
- aucun `INSERT` / `UPDATE` / `DELETE` de données ;
- aucune réconciliation automatique ;
- aucun reset, clean, checkout, commit, push.

## 14. Conclusion

Le périmètre de ce bloc montre que les 57 FK applicatives sont cohérentes entre `prisma/schema.prisma` et PostgreSQL. Il n’existe pas de preuve d’une différence fonctionnelle nécessitant une correction de FK. La seule différence notable réside dans la présence de contraintes système / Supabase / auth hors contrat applicatif, qui expliquent le total de 86 FKs dans PostgreSQL comparé au total de 57 relations applicatives.

Aucune correction n’est recommandée dans ce bloc.

### BLOC 1.12 = READ_ONLY_COMPLETE

### DECISION_HUMAINE_REQUISE

Le rôle runtime cible doit être défini et validé par une étape humaine de séparation des privilèges, puis seulement après cela on pourra décider si le marqueur Prisma / migration `add_publication_flags` exige une résolution technique ou reste hors périmètre.
