# BRIDGE 4.3.1 — Bloc 1.4 — Audit read-only de reconciliation Prisma

## 1. Cadre et etat actuel

- Date/heure : `2026-09-15T12:31:34.2216976+01:00`
- Projet : `C:\laragon\www\CHATEAU DU MWANA`
- Mode : **READ-ONLY strict**.
- Aucun schema, migration, code, RLS, contrainte ou donnee modifie.
- Aucune commande `migrate`, `migrate resolve`, `migrate dev`, `migrate deploy`, `db push`, `db reset`, `db pull`, seed ou SQL mutateur executee.

### Contrats et migrations

- Contrat courant : storage hash `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60`.
- Profile hash courant : `3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2`.
- Snapshot initial : `3da8eac623684af82c16039df326d8ff7b2ad0cb5eaa780663d86f6c75de77f0`.
- Migration initiale sur disque : `20260911T1730_init`, hash `92182508b2a3ece581a77449256c9a5dc3c6fd877295c8c47c96a28aa3268d49`, 187 operations.
- Migration publication sur disque : `20260915T1057_add_publication_flags`, hash `68028fd8eefad37d24973a94473e13eb2eba7d02c4b0d961a7280e598632567f`, 3 operations.

### Marqueur et statut

`migration log --json` ne connait qu'une migration appliquee :

- `20260911T1730_init`, appliquee le 2026-09-11 17:30:39.228Z.

`migration status --json` indique :

- marqueur courant : `3da8eac...` ;
- cible courante : `398bb216...` ;
- `20260915T1057_add_publication_flags` : **pending** ;
- resume : 1 migration pending, sans diagnostic de statut.

La migration publication n'est donc toujours pas marquee `applied`.

Graphe observe :

```text
EMPTY
  |
  +-- 20260911T1730_init
        |
        +-- 20260915T1057_add_publication_flags
              |
              +-- CURRENT CONTRACT (398bb216...)

CURRENT DATABASE MARKER = INIT (3da8eac...)
```

La divergence apparait entre la fin physique attendue de la migration publication et le marqueur Prisma : le schema physique contient deja les colonnes de publication, mais le marqueur reste sur l'init. Une seconde divergence, plus ancienne, existe entre le snapshot/contrat initial et les metadonnees du schema reel.

## 2. Etat physique des colonnes de publication

`db verify --schema-only --json` observe :

| Objet | Type | Nullabilite | Default | Etat |
| --- | --- | --- | --- | --- |
| `public.service.isPublished` | `bool` | `NOT NULL` | `false` | present, forme attendue |
| `public.formula.isPublished` | `bool` | `NOT NULL` | `false` | present, forme attendue |

Cette observation ne change pas le marqueur et ne prouve pas que la migration est journalisee comme appliquee.

## 3. Tableau des 47 differences

Le diagnostic autorise `npx prisma db verify --schema-only --json` retourne exactement **47 issues**, une par table publique. Chaque issue compare l'objet table complet ; elle peut contenir plusieurs sous-differences. Les categories ci-dessous sont la normalisation des chemins `expected`/`actual` du diagnostic Prisma.

Conventions :

- Attendu Prisma : forme du snapshot/contrat emis, avec metadonnees Prisma minimales.
- Present DB : metadonnees introspectees dans PostgreSQL local.
- Impact : l'impact est certain pour la verification Prisma, mais l'impact runtime est indique comme fonctionnel seulement lorsqu'il est demontrable.
- Origine : `init/historique` signifie que l'ecart porte sur une table creee par l'init ; la cause exacte reste **origine non demontree**.

| # | Table | Element | Attendu Prisma | Present DB | Categorie | Impact | Origine probable |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | `auditLog` | default, FK, RLS, PK | contrat init sans ces metadonnees | default/FK/PK introspectes, RLS actif | G, C/D, A, B | verification Prisma | init/historique; origine non demontree |
| 2 | `contactMessage` | default, RLS, PK, CHECK | contrat init | defaults, PK, check et RLS differents | G, A, B, F | verification Prisma; check a examiner | init/historique; origine non demontree |
| 3 | `contentPage` | default, UNIQUE, RLS, PK | contrat init | contrainte unique nommee, PK nommee, RLS | G, E, A, B | nominal + verification Prisma | init/historique; origine non demontree |
| 4 | `customer` | default, UNIQUE, RLS, PK | contrat init | unique/PK nommees, RLS | G, E, A, B | nominal + verification Prisma | init/historique; origine non demontree |
| 5 | `delivery` | default, FK, RLS, PK, CHECK | contrat init | FK/check/default/PK, RLS | G, C/D, A, B, F | certaines actions FK/check potentiellement fonctionnelles | init/historique; origine non demontree |
| 6 | `deliveryItem` | default, FK, RLS, PK | contrat init | FK/default/PK, RLS | G, C/D, A, B | FK a comparer; verification Prisma | init/historique; origine non demontree |
| 7 | `documentTemplate` | default, RLS, PK, CHECK | contrat init | default/check/PK, RLS | G, A, B, F | verification Prisma; check a examiner | init/historique; origine non demontree |
| 8 | `equipment` | default, FK, RLS, PK | contrat init | FK/default/PK, RLS | G, C/D, A, B | FK a comparer | init/historique; origine non demontree |
| 9 | `equipmentCategory` | UNIQUE, RLS, PK | contrat init | unique/PK nommees, RLS | E, A, B | principalement nominal + RLS | init/historique; origine non demontree |
| 10 | `equipmentMaintenance` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 11 | `equipmentStatusHistory` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 12 | `formula` | default, FK, RLS, PK | contrat + colonne publication | colonne conforme; FK/default/PK, RLS differentes | G, C/D, A, B | publication conforme; drift historique reste | init + changement publication; origine historique non demontree |
| 13 | `gallery` | default, RLS, PK | contrat init | default/PK, RLS | G, A, B | verification Prisma | init/historique; origine non demontree |
| 14 | `galleryItem` | default, FK, UNIQUE, RLS, PK | contrat init | FK/unique/PK/default, RLS | G, C/D, E, A, B | FK/unique a comparer | init/historique; origine non demontree |
| 15 | `importError` | default, FK, RLS, PK | contrat init | FK/default/PK, RLS | G, C/D, A, B | FK a comparer | init/historique; origine non demontree |
| 16 | `importJob` | default, RLS, PK, CHECK | contrat init | default/PK/check, RLS | G, A, B, F | verification Prisma; check a examiner | init/historique; origine non demontree |
| 17 | `inventory` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 18 | `inventoryAllocation` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 19 | `inventoryMovement` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 20 | `invoice` | default, FK, UNIQUE, RLS, PK, CHECK | contrat init | FK/unique/default/PK/check, RLS | G, C/D, E, A, B, F | FK/unique/check a comparer | init/historique; origine non demontree |
| 21 | `invoiceItem` | default, FK, RLS, PK | contrat init | FK/default/PK, RLS | G, C/D, A, B | FK a comparer | init/historique; origine non demontree |
| 22 | `location` | default, FK, RLS, PK | contrat init | FK/default/PK, RLS | G, C/D, A, B | FK a comparer | init/historique; origine non demontree |
| 23 | `logisticsHistory` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 24 | `logisticsMission` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 25 | `loyaltyAccount` | default, FK, UNIQUE, RLS, PK | contrat init | FK/unique/default/PK, RLS | G, C/D, E, A, B | FK/unique a comparer | init/historique; origine non demontree |
| 26 | `loyaltyLevel` | UNIQUE, RLS, PK | contrat init | unique/PK nommees, RLS | E, A, B | principalement nominal + RLS | init/historique; origine non demontree |
| 27 | `loyaltyReward` | RLS, PK | contrat init | PK nommee, RLS | A, B | principalement nominal + RLS | init/historique; origine non demontree |
| 28 | `loyaltyTransaction` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 29 | `media` | default, RLS, PK, CHECK | contrat init | default/PK/check, RLS | G, A, B, F | verification Prisma; check a examiner | init/historique; origine non demontree |
| 30 | `notification` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 31 | `payment` | default, FK, UNIQUE, RLS, PK, CHECK | contrat init | FK/unique/default/PK/check, RLS | G, C/D, E, A, B, F | FK/unique/check a comparer | init/historique; origine non demontree |
| 32 | `paymentTransaction` | default, FK, UNIQUE, RLS, PK, CHECK | contrat init | FK/unique/default/PK/check, RLS | G, C/D, E, A, B, F | FK/unique/check a comparer | init/historique; origine non demontree |
| 33 | `paymentTransactionHistory` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 34 | `permission` | UNIQUE, RLS, PK | contrat init | unique/PK nommees, RLS | E, A, B | principalement nominal + RLS | init/historique; origine non demontree |
| 35 | `refund` | default, FK, RLS, PK | contrat init | FK/default/PK, RLS | G, C/D, A, B | FK a comparer | init/historique; origine non demontree |
| 36 | `reservation` | default, FK, UNIQUE, RLS, PK, CHECK | contrat init | FK/unique/default/PK/check, RLS | G, C/D, E, A, B, F | FK/unique/check a comparer | init/historique; origine non demontree |
| 37 | `reservationItem` | default, FK, RLS, PK | contrat init | FK/default/PK, RLS | G, C/D, A, B | FK a comparer | init/historique; origine non demontree |
| 38 | `reservationStatusHistory` | default, FK, RLS, PK, CHECK | contrat init | FK/default/PK/check, RLS | G, C/D, A, B, F | FK/check a comparer | init/historique; origine non demontree |
| 39 | `role` | UNIQUE, RLS, PK | contrat init | unique/PK nommees, RLS | E, A, B | principalement nominal + RLS | init/historique; origine non demontree |
| 40 | `rolePermission` | FK, RLS, PK | contrat init | FK/PK, RLS | C/D, A, B | FK a comparer | init/historique; origine non demontree |
| 41 | `service` | default, FK, RLS, PK | contrat + colonne publication | colonne conforme; FK/default/PK, RLS differentes | G, C/D, A, B | publication conforme; drift historique reste | init + changement publication; origine historique non demontree |
| 42 | `serviceCategory` | UNIQUE, RLS, PK | contrat init | unique/PK nommees, RLS | E, A, B | principalement nominal + RLS | init/historique; origine non demontree |
| 43 | `serviceResource` | default, FK, UNIQUE, RLS, PK | contrat init | FK/unique/default/PK, RLS | G, C/D, E, A, B | FK/unique a comparer | init/historique; origine non demontree |
| 44 | `siteSettings` | UNIQUE, RLS, PK | contrat init | unique/PK nommees, RLS | E, A, B | principalement nominal + RLS | init/historique; origine non demontree |
| 45 | `storageLocation` | UNIQUE, RLS, PK | contrat init | unique/PK nommees, RLS | E, A, B | principalement nominal + RLS | init/historique; origine non demontree |
| 46 | `user` | default, FK, UNIQUE, RLS, PK, CHECK | contrat init | FK/unique/default/PK/check, RLS | G, C/D, E, A, B, F | FK/unique/check a comparer | init/historique; origine non demontree |
| 47 | `userRoleAssignment` | FK, RLS, PK | contrat init | FK/PK, RLS | C/D, A, B | FK a comparer | init/historique; origine non demontree |

### Categories absentes ou non retenues

- **H Index** : aucune difference d'index n'a ete identifiee dans la classification des issues.
- **I Type/colonne** : aucune difference de type ou de colonne historique n'explique les 47 issues ; les deux nouvelles colonnes sont presentes et conformes.
- **J Autre** : aucune categorie autre n'est necessaire pour les 47 issues.
- `onUpdate` n'est pas expose comme difference distincte dans la sortie structurelle exploitee ; `onDelete` et la representation des FK le sont. L'absence d'un champ dans la sortie n'est pas interpretee comme preuve d'une equivalence complete.

## 4. RLS et policies

### Ce qui est prouve

`npx prisma db schema --json` rapporte :

- 47 tables publiques ;
- PostgreSQL `17.6` ;
- `rlsEnabled=true` sur les 47 tables ;
- `policies=[]` pour les 47 tables dans le document expose par Prisma ;
- 0 policy detaillee exposee par cette commande.

Les schemas existants incluent `auth`, `extensions`, `graphql`, `graphql_public`, `pgbouncer`, `prisma_contract`, `public`, `realtime`, `storage` et `vault`, ce qui est compatible avec une base Supabase/PostgreSQL enrichie, mais ne constitue pas a lui seul une preuve de l'origine de chaque modification.

### Ce qui n'est pas demontre

Le present environnement ne fournit pas de client `psql`/`pgcli`, et l'API de schema Prisma ne retourne aucun detail `pg_policies`. Les elements suivants ne peuvent donc pas etre affirmes factuellement dans cet audit :

- noms reels des policies ;
- operations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `ALL`) ;
- roles ;
- expressions `USING` ;
- expressions `WITH CHECK`.

`policies=[]` dans le document Prisma signifie **policies non exposees par ce diagnostic**, pas necessairement absence de policies PostgreSQL.

### Interpretation

RLS est une protection de base externe au contrat Prisma courant : le schema Prisma et les snapshots inspectes ne declarent pas les policies RLS comme operations de migration. Il serait incorrect de conclure que RLS est une erreur parce que le contrat Prisma attend `rlsEnabled=false`. L'ecart prouve est une divergence entre la representation Prisma et la protection physique de la base ; son acceptabilite fonctionnelle reste a etablir par lecture directe de `pg_policies` avec un outil approprie.

## 5. Contraintes

### Primary keys

Les 47 tables possedent une PK en base, avec des noms PostgreSQL du type `*_pkey` (`formula_pkey`, `service_pkey`, etc.). Le contrat Prisma compare les colonnes de PK mais ne porte pas ces noms introspectes dans les noeuds attendus. Cette difference est principalement nominale pour les tables ou les colonnes correspondent ; elle reste bloquante pour la verification structurelle Prisma.

### Foreign keys

Les differences FK concernent selon les tables :

- noms de contraintes PostgreSQL `*_fkey` exposes en base ;
- ordre/representation des colonnes source et cible ;
- table cible representee differemment dans le noeud compare ;
- `onDelete` dans 22 occurrences de la comparaison ;
- `onUpdate` non differencie explicitement dans la sortie exploitee.

Une difference de nom seule est nominale. Une difference de colonnes, d'ordre ou d'action referentielle peut etre fonctionnelle et potentiellement dangereuse. Le diagnostic actuel ne prouve pas que chaque action FK est incorrecte ; il prouve qu'elle n'est pas representee comme le contrat l'attend.

### UNIQUE

Les contraintes uniques de la base ont des noms PostgreSQL (`*_key`) alors que le contrat attendu omet souvent ces noms. La plupart des differences uniques sont donc probablement nominales si les colonnes sont identiques. Deux differences de representation de colonnes/noms ont aussi ete observees ; elles doivent etre confirmees avant toute action.

### CHECK

Les checks reels contiennent des expressions PostgreSQL normalisees, par exemple `ANY (ARRAY[...])`, alors que le contrat attendu utilise une autre representation de l'expression. Ces differences peuvent etre purement textuelles, mais une expression differente peut aussi changer le domaine autorise. Elles sont donc potentiellement fonctionnelles jusqu'a comparaison semantique, non renommees automatiquement.

### Defaults

La base expose un attribut SQL textuel `default` en plus de `resolvedDefault`. La comparaison a produit de nombreuses differences de representation de defaults, alors que les valeurs normalisees peuvent etre equivalentes. Cette sortie ne demontre pas une valeur par defaut incorrecte pour chaque colonne.

## 6. Origine historique

### Ce qui etablit le preexistant

Le rapport Bloc 1.1 documente que le blocage par 47 ecarts a ete observe avant l'application SQL ciblee de la migration publication. Le diagnostic courant montre encore que les ecarts couvrent les 47 tables, alors que la migration publication ne touche structurellement que deux colonnes de `formula` et `service`.

Les categories RLS, PK, FK, uniques, checks et defaults sont donc incompatibles avec l'hypothese selon laquelle les 47 issues auraient ete causees par l'ajout de `isPublished`. La migration publication ne peut pas expliquer les ecarts de `auditLog`, `payment`, `user`, etc.

### Ce qui reste non prouve

- date exacte d'introduction de chaque difference ;
- outil ou acteur ayant active RLS ou cree les contraintes nommees ;
- whether RLS vient de Supabase, d'un script externe ou d'une operation PostgreSQL distincte ;
- equivalence semantique de chaque check, FK et default ;
- existence ou contenu reel des policies non exposees par Prisma.

Conclusion historique : **les 47 differences sont tres probablement preexistantes au Bloc 1.1, mais leur origine exacte est non demontree**. Elles ne sont pas expliquees par `20260915T1057_add_publication_flags`.

## 7. Analyse de la migration publication

Les artefacts sur disque sont coherents entre eux : `migration.json`, `ops.json` et `migration.ts` existent ; le hash est `68028fd8...` ; le package est reconnu par `migration show` sans `MIGRATION.HASH_MISMATCH`.

Operations declarees :

1. ajout de `formula.isPublished`, `bool`, `NOT NULL`, `DEFAULT false` ;
2. ajout de `service.isPublished`, `bool`, `NOT NULL`, `DEFAULT false` ;
3. backfill data `backfill_catalogue_publication_flags`.

Le backfill declare :

- publier les formules existantes par defaut ;
- publier les services existants par defaut ;
- remettre `false` pour `TEST_FORMULA` et `TEST_B3_FORMULA` ;
- remettre `false` pour `TEST_SERVICE` et `TEST_B3_SERVICE`.

Comparaison physique : les deux colonnes sont presentes avec `bool NOT NULL DEFAULT false`. Cela est techniquement coherent avec les deux operations additives et avec les donnees controlees au Bloc 1.3. Le journal Prisma reste toutefois pending, car le marqueur n'a pas avance.

## 8. Analyse des strategies, sans application

| Strategie | Avantage | Risque | Prerequis | Modifications possibles | Recommandation actuelle |
| --- | --- | --- | --- | --- | --- |
| `migrate resolve --applied` | aligner rapidement le marqueur avec une application manuelle deja faite | masquer des ecarts schema/RLS et certifier une migration sans verification complete | preuve des DDL et du backfill, decision explicite sur drift | marqueur Prisma uniquement, mais effet durable sur l'historique | non recommandee |
| Baseline | declarer un nouvel etat de depart reconnu | perdre la chaine historique ou rendre les environnements incompatibles | contrat de baseline, inventaire complet et accord multi-environnements | historique/ref et potentiellement futur chemin de migration | non recommandee maintenant |
| Migration corrective | rendre explicites les differences | blast radius eleve : RLS, FK, checks, defaults, contraintes | comparaison semantique table par table et plan revu | schema, contraintes, RLS selon le plan | non recommandee maintenant |
| Reecriture historique | faire correspondre l'histoire aux faits locaux | checksum, reproductibilite et environnements deja appliques compromis | decision de gouvernance et sauvegarde hors depot | migrations historiques et hashes | interdite dans ce contexte |
| Nouvelle migration de reconciliation | conserver l'histoire et ajouter un correctif explicite | peut reproduire ou modifier des protections externes non comprises | policies, invariants et environnement cible connus | schema/contraintes/RLS selon operations | non recommandee avant preuves |
| Investigation directe `pg_catalog`/`pg_policies` | lever les inconnues sans muter | cout de diagnostic | outil de lecture PostgreSQL et autorisation SELECT | aucune si strictement SELECT | recommandee comme prochaine preuve |

## 9. Risques

- Marquer la migration appliquee sur la seule presence des colonnes laisserait les 47 divergences structurelles non expliquees.
- Une action corrective sur les FK, checks ou RLS peut modifier le comportement de securite ou l'integrite des donnees.
- L'activation RLS sur les 47 tables peut etre intentionnelle et externe a Prisma ; la supprimer ou la desactiver serait potentiellement critique.
- Les contraintes nommees peuvent etre seulement nominales, mais les differences d'ordre, d'action FK ou d'expression CHECK ne doivent pas etre traitees comme nominales sans preuve semantique.
- La base contient des schemas Supabase additionnels ; une reconciliation limitee au schema Prisma `public` pourrait ignorer des invariants externes.
- Le marqueur Prisma est un historique de contrat, pas une preuve suffisante de l'etat complet des policies et contraintes PostgreSQL.

## 10. Recommandation principale

`RECOMMANDATION = NE PAS MODIFIER`

La preuve manque encore pour :

1. enumerer directement les policies PostgreSQL et leurs `USING`/`WITH CHECK` ;
2. demontrer l'intention des 47 activations RLS ;
3. prouver l'equivalence semantique de chaque FK, `onDelete`/`onUpdate` et CHECK ;
4. determiner si les noms et representations de contraintes sont acceptes comme invariants locaux ;
5. choisir entre resolve, baseline, migration corrective ou reconciliation sans risque d'environnement.

Aucune strategie ne doit etre appliquee sur la seule base de cet audit.

## Verdict final

**`PRISMA_RECONCILIATION_NEEDS_EVIDENCE`**

L'origine Bloc 1.1 des 47 differences est suffisamment exclue, mais l'origine historique exacte et la strategie sure de reconciliation ne sont pas suffisamment demontrees.
