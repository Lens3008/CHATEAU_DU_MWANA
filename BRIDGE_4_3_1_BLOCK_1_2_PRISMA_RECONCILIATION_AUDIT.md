# BRIDGE 4.3.1 — Bloc 1.2 — Audit read-only de reconciliation Prisma

Date de l'audit : 2026-09-15
Projet : `C:\laragon\www\CHATEAU DU MWANA`

## Verdict

**Verdict technique :** `NEEDS_INVESTIGATION`

Les deux colonnes de publication existent dans le schema vivant avec la forme attendue, et la migration ciblee est complete sur disque. En revanche, Prisma ne reconnait pas cette migration comme appliquee : le marqueur de la base est encore au contrat initial. Le controle `schema-only` signale toujours 47 objets de table divergents. Les valeurs actuelles des lignes n'ont pas ete relues dans cet audit, conformement a l'interdiction d'executer des requetes de donnees. Une reconciliation ne doit donc pas etre appliquee sur la seule preuve d'existence des colonnes.

## 1. Etat initial et perimetre

Le contexte Bloc 1.1 indique que :

- `Service.isPublished` et `Formula.isPublished` ont ete ajoutes au contrat ;
- l'isolation runtime publique est fonctionnelle ;
- une application SQL ciblee de `20260915T1057_add_publication_flags` a deja ete faite localement ;
- `npx prisma db migrate --yes` reste bloque par 47 ecarts historiques.

Garde-fous respectes pendant cet audit :

- aucun fichier de code, schema ou migration modifie ;
- aucune commande SQL executee directement ;
- aucun `migrate resolve`, reset, suppression, recreation ou modification de donnees ;
- aucun `git reset`, `restore`, `clean`, `checkout`, `revert`, merge, commit ou push ;
- le seul fichier cree est le present rapport.

Commandes de diagnostic read-only utilisees :

- `npx prisma migration status --json`
- `npx prisma migration list --json`
- `npx prisma migration graph --json`
- `npx prisma migration log --json`
- `npx prisma migration show 20260915T1057_add_publication_flags --json`
- `npx prisma db verify --json`
- `npx prisma db verify --schema-only --json`
- `npx prisma db verify --marker-only --json`
- `npx prisma db schema --json`

## 2. Etat Git

HEAD : `8d3e129 Initial commit from Create Next App`.

Le checkout est fortement modifie. Les changements pertinents observes sont notamment :

- `package.json` et `package-lock.json` modifies ;
- `prisma/`, `migrations/`, `prisma.config.ts` et les rapports Bridge sont non suivis ;
- `BRIDGE_4_3_1_BLOCK_1_1_PUBLICATION_FIX_REPORT.md` et `BRIDGE_4_3_1_CORRECTIVE_REPORT.md` sont non suivis ;
- de nombreux autres fichiers applicatifs sont modifies ou non suivis.

Consequence : Git ne fournit pas ici une base historique fiable pour dater les fichiers Prisma ou prouver leur etat avant Bloc 1.1. L'attribution temporelle ci-dessous distingue explicitement preuve, declaration des rapports precedents et hypothese.

## 3. Etat du contrat Prisma

`prisma.config.ts` charge `prisma/schema.prisma` et configure une connexion Postgres par `DATABASE_URL`.

Dans `prisma/schema.prisma` :

```text
Service.isPublished  Boolean @default(false)
Formula.isPublished  Boolean @default(false)
```

Les artefacts emis sont presents :

- `prisma/schema.json` contient les deux champs, codec `pg/bool@1`, non nullable, default logique `false` ;
- `prisma/schema.d.ts` contient les types input/output et les mappings `column: 'isPublished'` pour ces champs ;
- le contrat courant a le storage hash `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60` ;
- le profile hash courant est `3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2`.

Le contrat courant est donc coherent avec le changement Bloc 1.1. Cela ne constitue pas une preuve que la base est au meme contrat.

## 4. Etat du systeme de migrations

### Migrations connues sur disque

Le graphe Prisma contient exactement deux migrations dans l'espace `app` :

1. `20260911T1730_init`
   - `from`: empty/null
   - `to`: `3da8eac623684af82c16039df326d8ff7b2ad0cb5eaa780663d86f6c75de77f0`
   - hash : `92182508b2a3ece581a77449256c9a5dc3c6fd877295c8c47c96a28aa3268d49`
   - 187 operations
   - creee le 2026-09-11 17:30:17.811Z

2. `20260915T1057_add_publication_flags`
   - `from`: `3da8eac623684af82c16039df326d8ff7b2ad0cb5eaa780663d86f6c75de77f0`
   - `to`: `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60`
   - hash : `68028fd8eefad37d24973a94473e13eb2eba7d02c4b0d961a7280e598632567f`
   - 3 operations
   - creee le 2026-09-15 10:57:30.285Z

Le graphe est lineaire :

```text
empty -> 20260911T1730_init -> 20260915T1057_add_publication_flags
```

Aucun repertoire `refs/` ni fichier de ref n'a ete observe sous `migrations/app/`. Les snapshots des deux contrats existent sous `migrations/snapshots/`.

### Etat marque par la base

`migration log --json` retourne une seule migration appliquee :

- `20260911T1730_init`, appliquee le 2026-09-11 17:30:39.228Z.

`migration status --json` retourne :

- contrat courant lu depuis le marqueur : `3da8eac623684af82c16039df326d8ff7b2ad0cb5eaa780663d86f6c75de77f0` ;
- contrat cible : `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60` ;
- `20260915T1057_add_publication_flags` : **pending** ;
- diagnostic de statut : aucun ;
- resume : 1 migration pending.

`db verify --json` et `db verify --marker-only --json` retournent tous deux :

- `CONTRACT.MARKER_MISMATCH` ;
- attendu : `398bb216...` ;
- marqueur reel : `3da8eac...`.

Le systeme n'indique aucun `MIGRATION.HASH_MISMATCH` pour la migration ciblee via `migration list` ou `migration show`. La migration est lisible et son hash de package est reconnu. Cela ne signifie pas qu'elle est appliquee.

## 5. Les 47 differences exactes

### Definition du comptage

Le nombre **47** est le nombre d'issues retournes par `db verify --schema-only`. Chaque issue est un objet `postgres-table` complet compare au contrat. Ce ne sont pas 47 nouvelles colonnes et ce ne sont pas 47 operations de la migration Bloc 1.1.

La base contient les 47 tables concernees. Pour chacune, Prisma trouve la table reelle, mais sa representation complete ne correspond pas au contrat emis. La migration historique supposee pour ces ecarts est `20260911T1730_init`, qui a cree le modele initial. La migration de publication ne porte que sur `formula.isPublished`, `service.isPublished` et le backfill.

| # | Objet | Type | Attendu par le contrat | Present en base | Migration historique supposee |
| ---: | --- | --- | --- | --- | --- |
| 1 | `auditLog` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 2 | `contactMessage` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 3 | `contentPage` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 4 | `customer` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 5 | `delivery` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 6 | `deliveryItem` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 7 | `documentTemplate` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 8 | `equipment` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 9 | `equipmentCategory` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 10 | `equipmentMaintenance` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 11 | `equipmentStatusHistory` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 12 | `formula` | table PostgreSQL | forme complete + `isPublished bool NOT NULL DEFAULT false` | oui ; colonne conforme au schema vivant | init + migration publication |
| 13 | `gallery` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 14 | `galleryItem` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 15 | `importError` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 16 | `importJob` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 17 | `inventory` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 18 | `inventoryAllocation` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 19 | `inventoryMovement` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 20 | `invoice` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 21 | `invoiceItem` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 22 | `location` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 23 | `logisticsHistory` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 24 | `logisticsMission` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 25 | `loyaltyAccount` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 26 | `loyaltyLevel` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 27 | `loyaltyReward` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 28 | `loyaltyTransaction` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 29 | `media` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 30 | `notification` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 31 | `payment` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 32 | `paymentTransaction` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 33 | `paymentTransactionHistory` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 34 | `permission` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 35 | `refund` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 36 | `reservation` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 37 | `reservationItem` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 38 | `reservationStatusHistory` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 39 | `role` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 40 | `rolePermission` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 41 | `service` | table PostgreSQL | forme complete + `isPublished bool NOT NULL DEFAULT false` | oui ; colonne conforme au schema vivant | init + migration publication |
| 42 | `serviceCategory` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 43 | `serviceResource` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 44 | `siteSettings` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 45 | `storageLocation` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 46 | `user` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |
| 47 | `userRoleAssignment` | table PostgreSQL | forme complete de l'init | oui, mais metadata divergente | `20260911T1730_init` |

### Sous-differences observees dans ces 47 issues

La comparaison recursive du resultat Prisma montre principalement des differences de metadata et de representation :

- `rlsEnabled` : 47 cas ; attendu `false`, reel `true`.
- nom de cle primaire : 47 cas ; le contrat ne porte pas le nom introspecte, la base expose des noms du type `*_pkey`.
- noms de foreign keys : 45 occurrences dans les noeuds de foreign keys ; la base expose des noms `*_fkey` absents du contrat emis.
- ordre ou representation des colonnes/references de foreign keys : 32 occurrences sur `foreignKeys[*].columns` et 31 sur `foreignKeys[*].referencedTable` dans la comparaison structurelle.
- `onDelete` de foreign keys : 22 occurrences de representation divergente.
- noms de contraintes uniques : 16 occurrences, plus 2 differences de representation de leurs colonnes/noms.
- expressions de checks : 29 occurrences (`checks[*].expression` et `checks.expression`), avec representation SQL differente.
- defaults : 62 occurrences ; la base expose aussi un attribut SQL textuel `default` en plus de la valeur normalisee `resolvedDefault`.

Ces differences ne demontrent pas que les contraintes metier sont toutes fausses. Elles demontrent que la base locale a ete creee/introspectee avec des metadonnees, de la RLS et des representations qui ne correspondent pas au contrat de l'init.

### Presence et origine probable

- **Present en base** : les 47 tables sont presentes, sinon Prisma aurait rapporte des objets absents plutot que 47 comparaisons de tables completes.
- **Attendu** : le snapshot du contrat initial utilise par `20260911T1730_init`, puis le contrat courant pour `formula` et `service`.
- **Origine demontree** : la difference est observee aujourd'hui contre le contrat ; les noms/ordres/RLS correspondent a une derive ou a une creation externe au modele emis.
- **Origine non demontree** : la cause exacte de chaque changement (Supabase, creation manuelle, autre outil ou autre execution) n'est pas prouvable avec les artefacts presents. Aucune origine ne doit etre inventee.

## 6. Etat exact de `20260915T1057_add_publication_flags`

### Package

Le repertoire est present sur disque avec les trois fichiers attendus :

- `migration.json` present ;
- `ops.json` present ;
- `migration.ts` present.

`migration show --json` reconnait le package, son hash et ses trois operations, sans diagnostic de corruption ou de checksum.

### Operations

1. `column.public.formula.isPublished` — additive.
2. `column.public.service.isPublished` — additive.
3. `data_migration.backfill_catalogue_publication_flags` — data.

Le SQL structurel genere est exactement :

```sql
ALTER TABLE "public"."formula" ADD COLUMN "isPublished" bool DEFAULT false NOT NULL
ALTER TABLE "public"."service" ADD COLUMN "isPublished" bool DEFAULT false NOT NULL
```

Le bloc data declare :

- publication par defaut des formules existantes ;
- publication par defaut des services existants ;
- retour a `false` pour `TEST_FORMULA` et `TEST_B3_FORMULA` ;
- retour a `false` pour `TEST_SERVICE` et `TEST_B3_SERVICE`.

### Colonnes en base

`db verify --schema-only` observe actuellement :

- `public.formula.isPublished` : present, `bool`, non nullable, default `false` ;
- `public.service.isPublished` : present, `bool`, non nullable, default `false`.

La forme du schema vivant est donc exactement celle attendue pour les deux colonnes. Cela ne change pas le statut Prisma : le marqueur est encore sur le contrat precedent et la migration reste pending.

### Fixtures et backfill

Le rapport Bloc 1.1 contient une lecture live datee apres l'application ciblee :

```text
TEST_FORMULA      availability=true  isPublished=false
TEST_B3_FORMULA   availability=true  isPublished=false
TEST_SERVICE      availability=true  isPublished=false
TEST_B3_SERVICE   availability=true  isPublished=false

Formules disponibles et publiees : 26
Services disponibles et publies : 17
```

Cette information est une preuve documentaire anterieure, pas une nouvelle lecture effectuee par le present audit. Une nouvelle lecture de lignes aurait execute une requete de donnees et a donc ete volontairement exclue. Conclusion stricte :

- valeurs rapportees apres l'application ciblee : conformes au backfill declare ;
- valeurs actuelles au moment exact de cet audit : non revalidees sous les garde-fous ;
- colonnes et defaults actuels : verifies directement par `db verify --schema-only`.

## 7. Preexistant avant Bloc 1.1 ou cause par Bloc 1.1

### Preuve forte en faveur du preexistant

Le rapport Bloc 1.1 indique que `db migrate` a tente de verifier le contrat complet et a rencontre 47 ecarts historiques, avant que l'application SQL ciblee ne soit faite pour permettre la validation runtime. Le resultat actuel montre encore que :

- le marqueur est reste au contrat init `3da8...` ;
- l'init est la seule migration du journal applique ;
- les 47 issues couvrent pratiquement tout le schema, pas seulement `formula` et `service` ;
- les ecarts dominants sont RLS, noms de contraintes, ordres de foreign keys, checks et defaults, qui ne sont pas generes par l'ajout de deux colonnes.

Cela rend tres improbable que Bloc 1.1 ait cause ces 47 ecarts historiques.

### Ce qui est prouve et ce qui reste une hypothese

- **Prouve** : les 47 issues existent maintenant ; elles concernent 47 tables ; la migration ciblee n'est pas marquee appliquee ; les deux colonnes existent.
- **Prouve par le rapport precedent** : le blocage par 47 ecarts a ete observe pendant Bloc 1.1 avant l'application SQL ciblee ; les fixtures ont alors ete rapportees privees.
- **Hypothese fortement supportee** : les 47 ecarts existaient avant le changement de publication et sont rattaches a l'histoire/schema local anterieur.
- **Non prouve** : la date exacte de chaque derive et son auteur/outillage.
- **Non prouve dans cet audit** : l'etat courant des valeurs de toutes les lignes et la persistance courante des quatre valeurs `false`.

Le changement Bloc 1.1 a bien ajoute une difference contractuelle nouvelle entre `3da8...` et `398bb...` : les deux colonnes et le backfill. Il n'explique pas les 47 differences de tables historiques.

## 8. Risques

- Le marqueur Prisma et le schema physique ne racontent pas la meme histoire.
- Relancer une commande mutatrice pourrait refuser avant DDL, appliquer un chemin inattendu ou aggraver l'ambiguite historique selon la strategie choisie.
- `migrate status` peut indiquer une migration pending alors que ses deux colonnes sont deja physiquement presentes : le journal Prisma ne doit pas etre deduit du schema seul.
- Le backfill declare un comportement commercial important : les donnees existantes sont publiees par defaut sauf les quatre fixtures. Cette decision doit etre preservee ou revalidee avant reconciliation.
- Les 47 ecarts incluent RLS et contraintes. Une reparation generique pourrait modifier des protections ou des contraintes non liees au Bloc 1.1.
- Les migrations et snapshots sont non suivis dans Git dans le checkout actuel. Une strategie de reparation doit d'abord conserver une copie/audit externe, sans reecrire l'historique existant avant decision explicite.

## 9. Options de reconciliation, non appliquees

### Option A — accepter/reconcilier le marqueur

`migrate resolve` ou l'equivalent Prisma pourrait marquer la migration comme appliquee si l'equipe considere que le schema et le backfill ont deja ete appliques correctement.

Risques : le marqueur avancerait sans preuve fraiche des valeurs de lignes ; les 47 ecarts de schema resteraient ; cela pourrait masquer une derive historique et rendre les futurs deploys trompeurs. Cette option n'est pas justifiee par la seule presence des colonnes.

### Option B — baseline/reconstruction de l'historique

Construire une base historique reconnue a partir de l'etat reel, puis rattacher le contrat courant.

Risques : perte de traçabilite de l'init, baseline incorrecte si RLS/contraintes sont volontairement differentes, incompatibilite avec d'autres environnements, et risque de produire un historique qui ne rejoue pas la base.

### Option C — nouvelle migration corrective

Modeler explicitement les 47 differences puis les appliquer dans une ou plusieurs migrations correctives, avant de traiter la publication.

Risques : blast radius tres eleve, notamment RLS, checks, noms/ordres de contraintes et defaults ; migration potentiellement destructive ou difficilement reversible ; risque de modifier des comportements Supabase existants.

### Option D — reparation de l'historique existant

Corriger ou re-generer l'histoire pour refleter le schema local, puis conserver une migration publication distincte.

Risques : reecriture d'une migration historique, interdite dans le present mandat et dangereuse pour tout environnement ayant deja consomme cette histoire ; divergence de checksums et perte de reproductibilite.

### Option E — nouvelle investigation comparative

Comparer le schema local au snapshot initial `3da8...`, documenter les invariants acceptes (notamment RLS), confirmer les valeurs des quatre fixtures et le backfill commercial, puis choisir entre marqueur, baseline ou migration corrective.

Risques : cout de diagnostic supplementaire, mais c'est l'option qui evite de transformer des differences historiques non expliquees en modifications irreversibles.

## 10. Recommandation

Ne pas appliquer `migrate resolve`, baseline, migration corrective ou reparation d'historique sur la base de cet audit seul.

Recommandation : poursuivre une investigation controlee qui :

1. confirme avec l'equipe si les RLS, noms de contraintes et defaults observes sont intentionnels pour cette base Supabase ;
2. preserve les migrations existantes et leurs checksums ;
3. revalide les quatre fixtures et les comptes commerciaux par un controle de donnees explicitement autorise ;
4. compare le schema reel au snapshot initial et au contrat courant ;
5. choisit ensuite une strategie par environnement, sans supposer que le schema local est la seule source de verite.

Cette recommandation n'applique aucune strategie.

## 11. Conclusion

- Le contrat Prisma courant est coherent pour `Service.isPublished` et `Formula.isPublished`.
- Les deux colonnes existent physiquement avec `bool NOT NULL DEFAULT false`.
- La migration ciblee est presente, lisible, hashée et complete sur disque.
- Elle n'est pas marquee appliquee dans le systeme Prisma ; le marqueur local reste sur `20260911_init`.
- `db verify --schema-only` retourne 47 issues, une par table, correspondant a des differences historiques de metadata/schema et non a 47 changements introduits par Bloc 1.1.
- Le backfill et les quatre fixtures sont documentes comme conformes dans le rapport precedent, mais leurs valeurs courantes ne sont pas revalidees par cet audit read-only.
- La cause exacte de chaque ecart historique n'est pas demontrable avec les artefacts actuels.

**Verdict final : `NEEDS_INVESTIGATION`**

Bridge 4.4 n'est pas commence.
