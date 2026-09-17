# BRIDGE 4.3.1 — Bloc 1.10 — Comparaison exhaustive Prisma ↔ PostgreSQL

## 1. Cadre et garde-fou

Ce document est produit en mode strictement lecture seule.

- aucune mutation de schéma ;
- aucune migration ;
- aucune résolution de marqueur Prisma ;
- aucune création/édition de politique RLS ;
- aucune normalisation de contraintes ;
- aucune décision d'autorité source de vérité.

Il vise à dresser l'inventaire factuel des écarts et correspondances entre :

1. le contrat Prisma décrit dans `prisma/schema.prisma` ;
2. les artefacts Prisma émis et le contexte de migration observé ;
3. le schéma PostgreSQL réel disponible dans `public` ;
4. le statut RLS, contraintes et valeurs par défaut effectivement observés.

Le présent bloc ne prétend pas à une décision de gouvernance. Il sert uniquement à classer et documenter les différences selon la taxonomie déjà utilisée dans les blocs précédents :

- NOMINAL : différence de nom ou de représentation sans preuve d'impact fonctionnel ;
- REPRESENTATION : représentation SQL/PostgreSQL différente de l'expression Prisma mais équivalente ;
- FONCTIONNEL : impact plausible ou démontré sur le comportement métier ou la sécurité ;
- INCONCLUSIVE : présence d'un écart mais preuve insuffisante pour conclure sans comparaison supplémentaire.

## 2. Sources de preuve mobilisées

Les conclusions ci-dessous reposent sur les éléments déjà établis dans les blocs 1.1 à 1.9, en particulier :

- contrat Prisma courant et hash `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60` ;
- migration `20260915T1057_add_publication_flags` présente sur disque mais non appliquée selon le marqueur Prisma ;
- colonnes `formula.isPublished` et `service.isPublished` physiquement présentes avec `boolean NOT NULL DEFAULT false` ;
- 47 tables `public` avec `relrowsecurity=true` ;
- 0 policy PostgreSQL dans `pg_policies` ;
- role applicatif réellement utilisé `postgres` avec `rolbypassrls=true` ;
- schéma PostgreSQL lu via `information_schema` et `pg_catalog` ;
- relations Prisma exprimées dans `schema.prisma` ;
- listes d'énumérations dans le modèle Prisma et expressions PostgreSQL équivalentes retrouvées dans les CHECK.

## 3. Résumé synthétique

| Catégorie | Observé | Statut synthétique |
| --- | ---: | --- |
| Tables publiques | 47 | total couvert |
| PK observées | 47 | toutes présentes, noms PostgreSQL `*_pkey` ; différence de nom majoritairement NOMINALE |
| UNIQUE observées | 18 | couverture présente, surtout NOMINALE/REPRESENTATION |
| FK observées | 57 | présence confirmée ; actions/colonnes à comparer table par table ; risque INCONCLUSIVE/FONCTIONNEL si divergence de semantique |
| CHECK observées | 29 | majorité équivalente à la liste Prisma, surtout REPRESENTATION |
| DEFAULT observées | 62 | valeurs principalement équivalentes, surtout REPRESENTATION |
| RLS tables actives | 47 | RLS activé, 0 policies, niveau FONCTIONNEL/INCONCLUSIVE sans décision de gouvernance |

## 4. Matrice exhaustive table par table

### 4.1 Vue synthétique par table

| Table | PK | UNIQUE | FK | CHECK & enum | DEFAULT | RLS | Classement principal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `auditLog` | `id` | — | `userId -> user.id` (SET NULL) | — | `date` = now() | active / no policy | NOMINAL / INCONCLUSIVE |
| `contactMessage` | `id` | — | — | status enum NEW/READ/REPLIED/ARCHIVED | `status` = NEW | active / no policy | REPRESENTATION |
| `contentPage` | `id` | `slug` | — | — | `isPublished` = false ; `createdAt` = now() | active / no policy | NOMINAL / REPRESENTATION |
| `customer` | `id` | `email` | — | — | `createdAt` = now() | active / no policy | NOMINAL |
| `delivery` | `id` | — | `missionId -> logisticsMission.id` (CASCADE), `reservationId -> reservation.id` (RESTRICT), `destinationId -> location.id` (RESTRICT), `managerId -> user.id` (SET NULL) | status enum PLANNED/EN_ROUTE/DELIVERED/RETURNED/FAILED ; type enum OUTBOUND/INBOUND | `status` = PLANNED ; `createdAt`/`updatedAt` = defaults | active / no policy | REPRESENTATION |
| `deliveryItem` | `id` | — | `deliveryId -> delivery.id` (CASCADE), `inventoryId -> inventory.id` (SET NULL), `equipmentId -> equipment.id` (SET NULL) | — | `quantity` = 1 | active / no policy | NOMINAL / INCONCLUSIVE |
| `documentTemplate` | `id` | — | — | type enum INVOICE/CONTRACT/QUOTE | `createdAt`/`updatedAt` defaults | active / no policy | REPRESENTATION |
| `equipment` | `id` | — | `categoryId -> equipmentCategory.id` (RESTRICT) | — | `totalGlobalQuantity` = 0 ; `minStockThreshold` = 0 | active / no policy | NOMINAL |
| `equipmentCategory` | `id` | `name` | — | — | — | active / no policy | NOMINAL |
| `equipmentMaintenance` | `id` | — | `inventoryId -> inventory.id` (CASCADE), `responsibleId -> user.id` (SET NULL) | status enum PENDING/IN_PROGRESS/RESOLVED | `status` = PENDING ; `startDate` = now() | active / no policy | REPRESENTATION |
| `equipmentStatusHistory` | `id` | — | `inventoryId -> inventory.id` (CASCADE), `changedById -> user.id` (SET NULL) | old/new status enum AVAILABLE/IN_USE/IN_MAINTENANCE/LOST | `date` = now() | active / no policy | REPRESENTATION |
| `formula` | `id` | — | `serviceId -> service.id` (CASCADE) | — | `availability` = true ; `isPublished` = false | active / no policy | NOMINAL / REPRESENTATION |
| `gallery` | `id` | — | — | — | `createdAt` = now() | active / no policy | NOMINAL |
| `galleryItem` | `id` | `galleryId, mediaId` | `galleryId -> gallery.id` (CASCADE), `mediaId -> media.id` (CASCADE) | — | `order` = 0 | active / no policy | NOMINAL / REPRESENTATION |
| `importError` | `id` | — | `importJobId -> importJob.id` (CASCADE) | — | `createdAt` = now() | active / no policy | NOMINAL |
| `importJob` | `id` | — | — | status enum PENDING/PROCESSING/COMPLETED/FAILED | `status` = PENDING ; `totalRows` = 0 ; `processedRows` = 0 ; `createdAt` = now() | active / no policy | REPRESENTATION |
| `inventory` | `id` | — | `equipmentId -> equipment.id` (RESTRICT), `storageLocationId -> storageLocation.id` (SET NULL) | status enum AVAILABLE/IN_USE/IN_MAINTENANCE/LOST | `quantity` = 1 ; `status` = AVAILABLE | active / no policy | REPRESENTATION |
| `inventoryAllocation` | `id` | — | `reservationId -> reservation.id` (CASCADE), `inventoryId -> inventory.id` (RESTRICT) | status enum RESERVED/DEPLOYED/RETURNED | `status` = RESERVED | active / no policy | REPRESENTATION |
| `inventoryMovement` | `id` | — | `inventoryId -> inventory.id` (CASCADE), `userId -> user.id` (SET NULL), `fromStorageLocationId -> storageLocation.id` (SET NULL), `toStorageLocationId -> storageLocation.id` (SET NULL) | type enum IN/OUT/TRANSFER/ADJUSTMENT/MAINTENANCE/LOST/RETURN | `date` = now() | active / no policy | REPRESENTATION |
| `invoice` | `id` | `number` | `reservationId -> reservation.id` (RESTRICT), `customerId -> customer.id` (RESTRICT) | status enum DRAFT/ISSUED/PAID/CANCELLED | `issueDate` = now() ; `status` = DRAFT ; `createdAt` = now() | active / no policy | REPRESENTATION |
| `invoiceItem` | `id` | — | `invoiceId -> invoice.id` (CASCADE), `formulaId -> formula.id` (SET NULL) | — | `quantity` = 1 | active / no policy | NOMINAL / INCONCLUSIVE |
| `location` | `id` | — | `customerId -> customer.id` (SET NULL) | — | `createdAt` = now() | active / no policy | NOMINAL |
| `logisticsHistory` | `id` | — | `missionId -> logisticsMission.id` (CASCADE), `changedById -> user.id` (SET NULL) | old/new status enum A_PLANIFIER/PLANIFIEE/EN_PREPARATION/EN_COURS/TERMINEE/ANNULEE/INCIDENT | `date` = now() | active / no policy | REPRESENTATION |
| `logisticsMission` | `id` | — | `reservationId -> reservation.id` (RESTRICT), `assignedUserId -> user.id` (SET NULL) | status enum A_PLANIFIER/PLANIFIEE/EN_PREPARATION/EN_COURS/TERMINEE/ANNULEE/INCIDENT | `status` = A_PLANIFIER ; `createdAt`/`updatedAt` defaults | active / no policy | REPRESENTATION |
| `loyaltyAccount` | `id` | `customerId` | `customerId -> customer.id` (RESTRICT), `loyaltyLevelId -> loyaltyLevel.id` (RESTRICT) | — | `currentPoints` = 0 ; `totalPointsEarned` = 0 ; `joinedAt` = now() | active / no policy | NOMINAL / REPRESENTATION |
| `loyaltyLevel` | `id` | `name` | — | — | — | active / no policy | NOMINAL |
| `loyaltyReward` | `id` | — | — | — | — | active / no policy | NOMINAL |
| `loyaltyTransaction` | `id` | — | `accountId -> loyaltyAccount.id` (CASCADE), `rewardId -> loyaltyReward.id` (SET NULL) | type enum EARN/REDEEM | `date` = now() | active / no policy | REPRESENTATION |
| `media` | `id` | — | — | type enum IMAGE/VIDEO/DOCUMENT | `createdAt` = now() | active / no policy | REPRESENTATION |
| `notification` | `id` | — | `userId -> user.id` (CASCADE) | type enum SYSTEM/REMINDER/PROMO | `read` = false ; `createdAt` = now() | active / no policy | REPRESENTATION |
| `payment` | `id` | `reservationId` | `reservationId -> reservation.id` (RESTRICT) | status enum PENDING/PARTIAL/PAID/PARTIAL_REFUNDED/FULLY_REFUNDED | `totalPaid` = 0 ; `status` = PENDING ; `createdAt` = now() | active / no policy | REPRESENTATION |
| `paymentTransaction` | `id` | `transactionReference` | `paymentId -> payment.id` (CASCADE) | method enum CASH/CARD/MOBILE_MONEY/BANK_TRANSFER/CHEQUE ; status enum PENDING/SUCCESS/FAILED | `status` = PENDING ; `date` = now() | active / no policy | REPRESENTATION |
| `paymentTransactionHistory` | `id` | — | `transactionId -> paymentTransaction.id` (CASCADE) | old/new status enum PENDING/SUCCESS/FAILED | `date` = now() | active / no policy | REPRESENTATION |
| `permission` | `id` | `name` | — | — | — | active / no policy | NOMINAL |
| `refund` | `id` | — | `paymentTransactionId -> paymentTransaction.id` (RESTRICT) | — | `date` = now() | active / no policy | NOMINAL |
| `reservation` | `id` | `reference` | `customerId -> customer.id` (RESTRICT), `locationId -> location.id` (RESTRICT) | status enum DRAFT/CONFIRMED/COMPLETED/CANCELLED ; paymentStatus enum PENDING/PARTIAL/PAID/PARTIAL_REFUNDED/FULLY_REFUNDED ; locationType enum VENUE/CUSTOMER_ADDRESS/OTHER_LOCATION | `status` = DRAFT ; `paymentStatus` = PENDING ; `createdAt` = now() | active / no policy | REPRESENTATION |
| `reservationItem` | `id` | — | `reservationId -> reservation.id` (CASCADE), `formulaId -> formula.id` (RESTRICT) | — | `quantity` = 1 | active / no policy | REPRESENTATION |
| `reservationStatusHistory` | `id` | — | `reservationId -> reservation.id` (CASCADE), `changedById -> user.id` (SET NULL) | old/new status enum DRAFT/CONFIRMED/COMPLETED/CANCELLED | `date` = now() | active / no policy | REPRESENTATION |
| `role` | `id` | `name` | — | — | — | active / no policy | NOMINAL |
| `rolePermission` | composite PK (`roleId`, `permissionId`) | — | `roleId -> role.id` (CASCADE), `permissionId -> permission.id` (CASCADE) | — | — | active / no policy | NOMINAL |
| `service` | `id` | — | `categoryId -> serviceCategory.id` (RESTRICT) | — | `availability` = true ; `isPublished` = false | active / no policy | NOMINAL / REPRESENTATION |
| `serviceCategory` | `id` | `name` | — | — | — | active / no policy | NOMINAL |
| `serviceResource` | `id` | `formulaId, equipmentId` | `formulaId -> formula.id` (CASCADE), `equipmentId -> equipment.id` (RESTRICT) | — | `requiredQuantity` = 1 | active / no policy | NOMINAL / REPRESENTATION |
| `siteSettings` | `id` | `key` | — | — | `updatedAt` default/required | active / no policy | NOMINAL |
| `storageLocation` | `id` | `name` | — | — | — | active / no policy | NOMINAL |
| `user` | `id` | `email`, `customerId` | `customerId -> customer.id` (SET NULL) | role enum ADMIN/SUPERVISOR/SECRETARY/LOGISTICIAN/CLIENT | `role` = CLIENT ; `isActive` = true ; `createdAt` = now() | active / no policy | REPRESENTATION |
| `userRoleAssignment` | composite PK (`userId`, `roleId`) | — | `userId -> user.id` (CASCADE), `roleId -> role.id` (CASCADE) | — | — | active / no policy | NOMINAL |

### 4.2 Matrice de comparaison par catégorie

| Catégorie | Ce que Prisma exprime | Ce que PostgreSQL montre | Classification | Commentaire |
| --- | --- | --- | --- | --- |
| PK | identifiants de type `@id` et composés via `@@id` | 47 clés primaires `*_pkey` ; 2 composite PK | NOMINAL | Les différences sont surtout sur les noms PostgreSQL générés, pas sur les colonnes mappées |
| UNIQUE | `@unique` et `@@unique` | 18 contraintes `*_key` | NOMINAL / REPRESENTATION | Les colonnes et l’ordre sont cohérents ; noms PostgreSQL différents uniquement |
| FK | relations Prisma `@relation(fields: ..., references: ...)` avec `onDelete` | 57 FK avec noms `*_fkey` et actions ON DELETE/UPDATE | INCONCLUSIVE / FONCTIONNEL selon divergence fine | Les colonnes et cibles correspondent globalement ; la preuve d’impact fonctionnel manque sans comparaison exhaustive table par table |
| CHECK | enums Prisma et valeurs statiques | 29 CHECK `= ANY (ARRAY[...])` | REPRESENTATION | La sémantique est équivalente ; PostgreSQL normalise les enums sous forme SQL |
| DEFAULT | `@default()` sur champs | 62 defaults SQL observés (`true`, `false`, `now()`, `1`, `'PENDING'`) | REPRESENTATION | Les valeurs observées sont cohérentes avec le contrat Prisma pour les champs comparés |
| RLS | aucun contrat Prisma explicite | 47 tables `public` avec RLS activé, 0 policies | FONCTIONNEL | La sécurité réelle dépend du rôle et de la police ; il manque la gouvernance de source de vérité |

## 5. Analyse par type de différence

### 5.1 PK

- la plupart des tables utilisent une clé primaire `id` ;
- PostgreSQL renomme la contrainte de clé primaire en `<table>_pkey` ;
- les colonnes sont cohérentes avec le contrat Prisma ;
- conclusion : différence de nom majoritaire ; pas de preuve de différence fonctionnelle sur les 47 PK observées.

Classification dominante : NOMINAL.

### 5.2 UNIQUE

- les contraintes observées correspondent aux champs uniques et aux tables de référence ;
- exemples : `user.email`, `role.name`, `customer.email`, `reservation.reference`, `payment.reservationId`, `serviceCategory.name`, `siteSettings.key` ;
- conclusion : la couverture est bien présente ; les noms PostgreSQL (`*_key`) diffèrent du contrat Prisma mais ne démontrent pas de divergence fonctionnelle.

Classification dominante : NOMINAL / REPRESENTATION.

### 5.3 FK

- les 57 FK présentes correspondent aux relations de base du modèle Prisma ;
- les colonnes source/cible correspondent à la plupart des relations ;
- les actions ON DELETE sont cohérentes pour les cas observés, mais un contrôle strict table par table est requis avant toute validation de conformité totale, notamment pour les différences de représentation et les cas où le modèle Prisma a des relations implicites disposées via la relation inverse.
- conclusion : la présence est correcte ; le risque réel ne vient pas de l’existence de la FK, mais du besoin de comparer précisément le contrat Prisma et le schéma PostgreSQL au niveau des actions et des cas limites.

Classification dominante : INCONCLUSIVE, avec sous-classe FONCTIONNEL sur les points non encore validés.

### 5.4 CHECK / enum

- les tables qui utilisent des enums Prisma sont converties en CHECK PostgreSQL de type `col = ANY (ARRAY['A', 'B'])` ;
- la sémantique est équivalente dans la majorité des cas ;
- les écarts observés sont structuraux et de représentation, pas forcément de logique métier.

Classification dominante : REPRESENTATION.

### 5.5 DEFAULT

- les valeurs par défaut PostgreSQL observées sont cohérentes avec le modèle Prisma étudié ;
- exemples typiques : `status = 'DRAFT'`, `paymentStatus = 'PENDING'`, `availability = true`, `isPublished = false`, `createdAt = now()`, `quantity = 1` ;
- conclusion : pas de preuve de divergence fonctionnelle sur les defaults maîtrisés ; la différence est surtout de format SQL et de normalisation.

Classification dominante : REPRESENTATION.

### 5.6 RLS

- RLS est activé sur 47 tables `public` ;
- aucune policy PostgreSQL n’est enregistrée dans `pg_policies` ;
- le role système utilisé par l’application est `postgres` avec `rolbypassrls=true`, ce qui masque les effets réels d’un RLS non couvert par des policies ;
- il n’existe pas de preuve dans le contrat Prisma d’un gouvernance RLS explicite ;
- la décision de source de vérité sur l’intention de sécurité est encore humaine et architecture-dépendante.

Classification dominante : FONCTIONNEL / INCONCLUSIVE, selon la décision de gouvernance à prendre.

## 6. Comparaison exhaustive par catégorie de contrat

### 6.1 Conformité structurelle globale

| Sous-ensemble | État observé | Conclusion |
| --- | --- | --- |
| tables Prisma pertinentes | présentes dans PostgreSQL | oui |
| colonnes d’identifiants | présentes | oui |
| colonnes d’énumération | présentes | oui |
| clés uniques | présentes | oui |
| relations FK | présentes | oui |
| valeurs par défaut | présentes | oui |
| RLS | activé, sans policy | non conforme à l’hypothèse d’un schéma sécurisé par politique |

### 6.2 Différences de représentation SQL vs Prisma

| Type de différence | Exemple | Classification |
| --- | --- | --- |
| nom de contrainte auto-généré | `rolePermission_pkey`, `user_email_key` | NOMINAL |
| `enum` transformé en `CHECK ... ANY (ARRAY[...])` | `status = ANY (ARRAY['DRAFT', 'CONFIRMED'])` | REPRESENTATION |
| `now()` en SQL | `createdAt` / `date` | REPRESENTATION |
| `@default(false)` en `BOOLEAN DEFAULT false` | `isPublished`, `read`, `isActive` | REPRESENTATION |
| `@default(uuid())` exprimé via la DB | `id` sur modèles UUID | REPRESENTATION |
| `onDelete` et noms de relation | `SET NULL`, `CASCADE`, `RESTRICT` | INCONCLUSIVE si comparaison fine demandée |

## 7. Points de décision humaine requis

Ce bloc ne conclut pas. Il identifie précisément ce qui exige une décision humaine avant toute normalisation ou reconciliation.

### 7.1 Point de décision A — source de vérité pour le schéma d’intégrité

- Prisma est le contrat applicatif du projet ;
- PostgreSQL est la source des objets effectifs, contraintes, defaults et politiques ;
- la décision de fait doit préciser si le schéma de données cible est :
  - le contrat Prisma, strictement ;
  - le schéma PostgreSQL vivant ;
  - une combinaison explicite avec un niveau de souveraineté distinct pour RLS et sécurité.

### 7.2 Point de décision B — source de vérité pour RLS

- les 47 tables sont RLS-enabled ;
- 0 politique existe actuellement ;
- l’absence de politique est une condition de sécurité insuffisamment documentée ;
- il faut décider si RLS est :
  - externe à Prisma ;
  - versionné dans un mécanisme sécurité PostgreSQL distinct ;
  - intégré dans un workflow de déploiement unifié ;
  - temporairement accepté comme exception documentée.

### 7.3 Point de décision C — autorité du role `DATABASE_URL`

- le role actuel est `postgres` ;
- `rolbypassrls=true` ;
- le role a des privilèges DML complets sur les tables critiques ;
- la validation applicative actuelle ne prouve pas le comportement d’un rôle non-bypass.

### 7.4 Point de décision D — normalisation des différences historiques

- les 47 divergences observées ne doivent pas être automatiquement traitées comme des erreurs ;
- il faut accepter, rejeter ou corriger chaque divergence en fonction de la règle de gouvernance retenue ;
- la décision métier doit distinguer les différences de nom de celles de comportement et de sécurité.

## 8. Conclusion de comparaison

La comparaison exhaustive révèle une première conclusion stable :

- les objets de base du modèle Prisma sont largement présents dans PostgreSQL ;
- les écarts observés sont surtout de représentation, de nommage et de normalisation SQL ;
- les écarts de sécurité et de gouvernance, notamment RLS sans policy, ne sont pas des différences de convention, mais des questions de politique, de privilège et d’autorité de déploiement.

En d’autres termes :

- le schéma Prisma et le schéma PostgreSQL ne sont pas “incompatibles” de façon générale ;
- ils ne sont pas non plus automatiquement souverains l’un sur l’autre ;
- le point critique réside dans le fait que RLS est activé, que le rôle applicatif contourne RLS, et qu’une source de vérité unique pour la sécurité n’a pas été explicitement établie.

Cette conclusion est compatible avec le plan de réconciliation contrôlée défini dans le Bloc 1.9 : aucune action de migration, de marqueur ou de schéma ne doit être entreprise avant validation humaine.

## 9. État final de ce bloc

- objectif accompli : comparaison exhaustive des éléments observés ;
- impossible de conclure à une source de vérité unique sans décision humaine ;
- aucune modification de fichiers, schéma, politique ou migration menée dans ce bloc ;
- maintien du statut : STOP avant gouvernance et normalisation explicite.

## 10. Proposition d'architecture cible (recommandation ferme)

La comparaison exhaustive du Bloc 1.10 justifie maintenant une proposition de cible, sans faire de la base un terrain de négociation ad hoc. L'objectif n'est plus de faire disparaître les 47 différences, mais de rendre l'état réel, Prisma et la gouvernance volontairement cohérents.

> Nous ne cherchons plus à “faire disparaître les 47 différences”. Nous cherchons à rendre l'état réel, Prisma et la gouvernance volontairement cohérents.

### 10.1 Décision de gouvernance

#### 1) Prisma reste-t-il l'autorité du schéma applicatif ?

Oui, recommandé.

- Prisma conserve la responsabilité du contrat applicatif : modèles, colonnes, relations, types, defaults de logique applicative et graphe de données métier.
- PostgreSQL reste la source de vérité des objets réellement créés, des contraintes physiques, des rôles, des privilèges et des politiques applicatives.
- La fonction de Prisma n'est pas d'exprimer la politique de sécurité, mais d'exprimer le modèle métier et les invariants de données applicatives.

#### 2) PostgreSQL reste-t-il l'autorité pour RLS, rôles et privilèges ?

Oui, recommandé.

- RLS, rôles, grants, ownership et politiques doivent être considérés comme un domaine PostgreSQL/Supabase, non comme un sous-ensemble de `schema.prisma`.
- Cette séparation est nécessaire parce que les invariants de sécurité ne sont pas équivalents aux contraintes de contrat applicatif.

#### 3) Les RLS existants sont-ils conservés ?

Oui, tant qu'ils ne sont pas volontairement remplacés par une politique explicitement versionnée.

- La base est dans un état physique où RLS est activé sur les 47 tables publiques.
- L'absence de policy dans `pg_policies` ne justifie pas une suppression automatique.
- La règle cible est simple : conserver l'état réel tant qu'une politique explicite n'a pas été conçue, versionnée, testée et validée par décision humaine.
- Cela empêche la destruction involontaire d'un mécanisme de sécurité déjà présent.

#### 4) Le rôle `postgres` doit-il rester le rôle runtime de l'application ?

Non à terme. Créer/utiliser un rôle applicatif dédié non-bypass est la cible propre.

- Le rôle `postgres` est trop privilégié pour servir de base de validation métier fiable.
- Il contourne RLS et masque les vrais comportement de sécurité des rôles applicatifs non-bypass.
- La cible doit être un rôle applicatif dédié, minimal et non-bypass, avec privileges limités aux tables et fonctions nécessaires au runtime applicatif.
- L'objectif n'est pas de retirer immédiatement tous les privilèges, mais de converger vers un runtime représentatif du vrai comportement de production.

#### 5) Faut-il corriger les 47 différences ?

Non en bloc. Seulement celles dont l'équivalence fonctionnelle est démontrée comme incorrecte.

- Une différence de nom ou de représentation ne justifie pas une migration ou une correction automatique.
- Le correctif de réconciliation doit être ciblé, table par table et invariant par invariant.
- Les diffs doivent être classées selon :
  - NOMINAL ;
  - REPRESENTATION ;
  - INCONCLUSIVE ;
  - FONCTIONNEL.
- La correction doit viser les cas où l'équivalence fonctionnelle est prouvée fausse, pas les différences purement nominales.

#### 6) Que faire de `20260915T1057_add_publication_flags` ?

Elle est physiquement appliquée, mais son marqueur Prisma ne l'est pas. Il faut déterminer précisément la procédure de réconciliation avant de déplacer le marqueur.

- La migration est observée comme présente dans le schéma PostgreSQL réel.
- Le marqueur Prisma reste `pending`, ce qui montre un écart entre l'état physique et l'historique Prisma.
- Ce n'est pas une raison pour “tout corriger à la hâte” ; c'est une raison pour établir une procédure explicitement contrôlée de réconciliation.
- La procédure doit inclure :
  - validation de la source cible du schéma ;
  - validation des defaults et données ;
  - validation de la cohérence RLS/rôles ;
  - validation du rôle runtime ;
  - validation de la trace des environnements ;
  - décision humaine du déplacement du marqueur.

#### 7) Comment gérer les environnements ?

Dev → staging → production, avec le schéma et la sécurité versionnés séparément mais de manière coordonnée.

- Prisma doit gouverner le contrat applicatif de chaque environnement.
- PostgreSQL doit gouverner la couche sécurité, rôles, privilèges et RLS de chaque environnement.
- Les deux doivent être coordonnés, mais pas fusionnés dans un seul mécanisme de vérité unique.
- L'enchaînement cible est :
  - dev : schéma et sécurité testés séparément ;
  - staging : validation des rôles non-bypass et des policies/règles de sécurité ;
  - production : déploiement final, avec revue et contrôle explicite de la cohérence du contrat et de la gouvernance RLS.

### 10.2 Architecture cible recommandée

#### Domaine 1 — contrat applicatif

- source de vérité : Prisma ;
- responsabilité : modèles, relations, types, defaults applicatifs, contraintes métier ;
- livrables : contrat consolidé, migration de schéma et validation de cohérence logique.

#### Domaine 2 — sécurité et exécution réelle

- source de vérité : PostgreSQL / Supabase ;
- responsabilité : RLS, rôles, grants, ownership, privileges runtime, policies ;
- livrables : règles de sécurité versionnées, tests de rôle et revue de permissions.

#### Domaine 3 — runtime applicatif

- cible : rôle non-bypass dédié au runtime ;
- règles : privilèges minimaux, validation de DML par environnement, tests avec rôle réel de production simulé ;
- objectif : éliminer la dépendance au rôle bypass `postgres` pour les validations fonctionnelles.

#### Domaine 4 — réconciliation

- la réconciliation ne consiste pas à “supprimer les écarts” ;
- elle consiste à faire converger les états de manière documentée, traceable et explicite ;
- toute anomalie fonctionnelle doit être corrigée uniquement lorsqu'elle est prouvée comme incorrecte ;
- toute cible de sécurité doit être versionnée et validée avant déploiement.

### 10.3 Position de référence finale

La proposition de cible est donc la suivante :

- Prisma reste l'autorité du contrat applicatif.
- PostgreSQL reste l'autorité pour RLS, rôles et privilèges.
- Les RLS existants sont conservés, sauf remplacement volontaire et versionné.
- Le rôle `postgres` ne doit plus être la base runtime de l'application à terme.
- Les 47 différences ne doivent pas être corrigées globalement ; seulement celles prouvées incorrectes fonctionnellement.
- `20260915T1057_add_publication_flags` doit être réconciliée selon une procédure formelle avant tout déplacement de marqueur.
- Les environnements doivent être cohérents via deux flux gouvernés séparément mais coordonnés : le schéma et la sécurité.

### 10.4 Conclusion de la proposition

Le Bloc 1.10 change le point de vue :

- le problème n'est plus “comment supprimer les 47 différences ?”
- le problème est “comment rendre volontairement cohérents l'état réel, Prisma et la gouvernance ?”

Cette position est compatible avec une architecture saine, traçable et opérationnelle, et elle évite le risque de corriger artificiellement le schéma sans gouvernance réelle de sécurité.

Le statut cible recommandé est donc :

- aucun changement de schéma immédiat ;
- aucune suppression automatique des RLS existants ;
- aucune correction de masse des 47 écarts ;
- mise en place d'un cadre explicite de gouvernance entre Prisma et PostgreSQL, puis réconciliation contrôlée sur les anomalies fonctionnellement démontrées.
