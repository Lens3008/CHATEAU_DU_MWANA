# BRIDGE 4.3.1 — Bloc 1.8 — Decision Prisma/RLS

## Objet

Document de decision technique prepare uniquement a partir des preuves des Blocs 1.1 a 1.7.

Ce document ne modifie rien et n'applique aucune option. Aucun `migrate resolve`, `db push`, `db reset`, `ALTER`, `GRANT`, `REVOKE`, changement RLS, changement de schema, changement de migration ou changement Git n'a ete effectue.

## 1. Etat actuel constate

### Prisma

- Contrat courant : storage hash `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60`.
- Profile hash : `3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2`.
- Migration initiale appliquee : `20260911T1730_init`, hash `92182508...`.
- Migration publication sur disque : `20260915T1057_add_publication_flags`, hash `68028fd8eefad37d24973a94473e13eb2eba7d02c4b0d961a7280e598632567f`.
- Migration publication : **pending** dans Prisma.
- Marqueur vivant `prisma_contract.marker` : contrat initial `3da8eac623684af82c16039df326d8ff7b2ad0cb5eaa780663d86f6c75de77f0`.
- Aucun ref `db`, `staging` ou `production` observe dans `migrations/app/refs/`.
- `db verify --schema-only` retourne 47 issues historiques, une par table publique.

### Donnees de publication

- `formula.isPublished` existe, type `boolean`, `NOT NULL`, default `false`.
- `service.isPublished` existe, type `boolean`, `NOT NULL`, default `false`.
- Les quatre fixtures `TEST_*` sont `availability=true`, `isPublished=false`.
- Les donnees commerciales attendues restent publiees.
- Verdict Bloc 1.3 : `DATA_SAFE`.

### PostgreSQL/Supabase

- 47 tables du schema `public` ont `relrowsecurity=true`.
- `relforcerowsecurity=false` sur les 47 tables.
- 0 policy dans `pg_policies`.
- Les 47 tables RLS n'ont donc aucune policy PostgreSQL documentee par la base.
- Toutes les tables publiques sont possedees par `postgres`.
- `postgres`, `service_role` et plusieurs roles Supabase ont `rolbypassrls=true`.

## 2. Ce que Prisma controle actuellement

Prisma controle ou represente :

- le contrat de donnees emis depuis `prisma/schema.prisma` ;
- les types, colonnes, relations, defaults et contraintes exprimes dans le contrat ;
- le graphe des migrations presentes sur disque ;
- le hash du contrat courant et les hashes de migration ;
- la position Prisma de la base via `prisma_contract.marker` ;
- le statut `applied`/`pending` des migrations selon ce marqueur et le graphe.

Prisma ne controle pas actuellement :

- les policies RLS PostgreSQL ;
- l'intention gouvernance de RLS ;
- les privileges reels de chaque role applicatif ;
- les roles Supabase hors contrat ;
- le fait que les validations utilisent un role bypass RLS.

Prisma constate une divergence structurelle, mais il ne peut pas deduire seul si les ecarts sont acceptes, externes ou dangereux.

## 3. Ce que PostgreSQL/Supabase controle actuellement

PostgreSQL est la source de verite physique pour :

- les tables et colonnes reellement presentes ;
- les contraintes PK, FK, UNIQUE et CHECK ;
- les defaults physiques ;
- RLS, proprietaires et attributs des roles ;
- les privileges effectifs ;
- les policies effectivement presentes dans `pg_policies`.

L'etat observe est particulier : RLS est active sur les 47 tables, mais aucune policy n'est presente. Les roles privilegies peuvent contourner RLS, tandis que le comportement de roles non bypass n'a pas ete valide dans les Blocs 1.1 a 1.7.

L'autorisation metier actuelle est realisee cote serveur par Supabase Auth, `requireAuth`, `requireRole`, RBAC applicatif, filtrage de publication et revalidation dans les services metier. Cette couche fonctionne avec la connexion Prisma privilegiee ; elle ne constitue pas une preuve d'equivalence avec une gouvernance RLS PostgreSQL.

## 4. Role de `DATABASE_URL`

La session ouverte avec `DATABASE_URL` a utilise :

```text
current_user  = postgres
session_user  = postgres
current_role  = postgres
rolsuper      = false
rolbypassrls  = true
```

Le role `postgres` dispose des privileges effectifs `SELECT`, `INSERT`, `UPDATE` et `DELETE` sur les 21 tables critiques controlees. Il est proprietaire des tables et contourne RLS.

Consequences :

- les validations ORM precedentes reussissent avec un role privilegie ;
- elles peuvent masquer un refus d'acces pour un role non bypass ;
- elles ne valident pas le comportement RLS des roles `anon`, authentifies ou metiers ;
- la connexion applicative actuelle a une capacite DML beaucoup plus large que la seule autorisation metier attendue.

## 5. Risques de conserver l'architecture actuelle

- Le role applicatif peut contourner RLS et dispose de privileges DML complets sur les tables critiques.
- Les validations peuvent donner un faux sentiment de securite, car elles ne passent pas par une policy RLS.
- L'absence de policies rend les acces de roles non bypass potentiellement refuses par defaut.
- La gouvernance RLS n'est pas versionnee dans les migrations, le schema Prisma ou la documentation du depot.
- Le marqueur Prisma reste sur l'init alors que les colonnes de publication existent physiquement.
- Les 47 divergences historiques restent non attribuees a une source de verite explicite.
- L'absence de refs Prisma rend les futurs plans ambigus.
- La production pourrait differer de cet environnement sans detection claire, car le role et les policies de production n'ont pas ete audites.

## 6. Risques de modifier RLS

Modifier, desactiver ou ajouter des policies sans decision humaine pourrait :

- exposer des donnees a des roles qui ne doivent pas les lire ;
- bloquer des parcours applicatifs existants ;
- modifier les acces de `service_role`, roles Supabase ou roles metiers ;
- rendre les validations actuelles non reproductibles ;
- introduire une seconde couche d'autorisation incoherente avec Auth/RBAC ;
- modifier les effets des operations DML et des fonctions serveur ;
- créer une divergence supplementaire si la modification n'est pas versionnee.

L'absence actuelle de policy ne permet pas de conclure qu'il faut les creer. Elle impose d'abord de connaitre les roles reels, les privileges attendus et l'environnement cible.

## 7. Risques de `migrate resolve`

`migrate resolve` pourrait aligner le marqueur Prisma avec une migration deja appliquee physiquement, mais il :

- ne corrigerait pas les 47 differences historiques ;
- ne gouvernerait pas RLS ;
- ne creerait aucune policy ;
- ne verifierait pas le comportement des roles non bypass ;
- pourrait faire croire que la base est entierement alignee avec le contrat ;
- rendrait l'historique Prisma plus difficile a distinguer de l'etat physique externe ;
- ne serait pas reversible sans une nouvelle decision et une nouvelle modification du marqueur.

Le fait que les colonnes et les donnees de publication soient conformes ne suffit pas a autoriser `migrate resolve`, car les validations ont ete effectuees avec `postgres` bypass RLS et la gouvernance des 47 ecarts reste indeterminee.

## 8. Options possibles, sans application

### Option A — Conserver l'etat actuel temporairement

| Dimension | Evaluation |
| --- | --- |
| Avantages | Aucun risque immediat de modification ; preserve les donnees, RLS et migrations actuelles. |
| Risques | Maintient le role bypass, le marqueur pending, les 47 divergences et l'absence de gouvernance explicite. |
| Impact Prisma | Aucun changement ; migration publication reste pending. |
| Impact RLS | Aucun changement ; RLS reste active sans policy. |
| Impact donnees | Aucun changement immediat. |
| Retour arriere | Sans objet : l'etat courant est conserve. |

**Appropriation :** recommandee provisoirement en developpement et obligatoire tant que la decision humaine n'est pas prise.

### Option B — Gouverner explicitement RLS comme couche externe a Prisma

| Dimension | Evaluation |
| --- | --- |
| Avantages | Separer clairement schema/migrations Prisma et securite PostgreSQL/Supabase ; permettre une gouvernance dediee. |
| Risques | Necessite un inventaire des roles, policies et environnements ; risque de divergence si la gouvernance externe n'est pas versionnee. |
| Impact Prisma | Prisma reste responsable du contrat et des migrations de donnees ; RLS est declare hors contrat avec une procedure de controle. |
| Impact RLS | Aucun changement obligatoire dans cette option ; toute policy future devrait etre decidee et versionnee separement. |
| Impact donnees | Aucun changement direct si aucune policy n'est appliquee. |
| Retour arriere | Facile pour la documentation ; toute policy appliquee ensuite demanderait une procedure de rollback testee. |

**Appropriation :** option structurelle plausible, mais non complete tant que les roles reels ne sont pas identifies.

### Option C — Utiliser un role applicatif non bypass et tester ses privileges

| Dimension | Evaluation |
| --- | --- |
| Avantages | Reduit le privilege de la connexion applicative et rend les tests plus representatifs des roles reels. |
| Risques | Peut casser les lectures/ecritures actuelles ; sans policy, les acces soumis a RLS peuvent etre refuses ; privilegies actuels masquent le perimetre a accorder. |
| Impact Prisma | Le contrat ne change pas ; la connexion runtime et les validations changeraient. |
| Impact RLS | RLS deviendrait effectivement observable par l'application ; les refus par defaut deviendraient visibles. |
| Impact donnees | Risque de fonctionnalites bloquees, mais aucune suppression necessaire par nature. |
| Retour arriere | Possible en reconfigurant la connexion, mais cela restaurerait le role privilegie et son risque. |

**Appropriation :** recommandation de securite a etudier separement, jamais a appliquer sans matrice de privileges et environnement de test.

### Option D — Ajouter et gouverner des policies RLS

| Dimension | Evaluation |
| --- | --- |
| Avantages | Permettre une autorisation au niveau PostgreSQL en complement ou remplacement partiel du controle serveur. |
| Risques | Risque eleve de blocage ou d'exposition ; incoherence possible avec Auth/RBAC ; besoin de JWT, roles et expressions corrects. |
| Impact Prisma | Les policies ne seraient pas gerees par le contrat actuel ; elles devraient avoir un canal de versionnement distinct ou une extension explicite. |
| Impact RLS | Changement direct et potentiellement global sur les 47 tables. |
| Impact donnees | Pas de modification de lignes par definition, mais acces et DML changes. |
| Retour arriere | Possible seulement avec policies de rollback connues et teste ; non trivial en production. |

**Appropriation :** non recommandee avant decision de gouvernance et tests avec roles non bypass.

### Option E — `migrate resolve --applied` pour la migration publication

| Dimension | Evaluation |
| --- | --- |
| Avantages | Aligner le marqueur Prisma avec les colonnes et le backfill deja observes. |
| Risques | Certifier l'historique Prisma sans resoudre RLS, les 47 divergences ni les roles ; peut masquer la source de verite reelle. |
| Impact Prisma | Le marqueur passerait potentiellement au contrat `398bb...`; la migration deviendrait reconnue applied. |
| Impact RLS | Aucun changement direct, mais l'etat RLS resterait non gouverne. |
| Impact donnees | Aucun DDL/DML attendu par la resolution elle-meme, mais l'historique serait modifie. |
| Retour arriere | Non trivial ; demanderait une nouvelle operation de correction du marqueur et une decision explicite. |

**Appropriation :** non autorisee actuellement.

### Option F — Baseline ou nouvelle migration corrective

| Dimension | Evaluation |
| --- | --- |
| Avantages | Peut rendre explicite une base existante ou modeler les divergences dans un historique rejouable. |
| Risques | Large perimetre ; risque de toucher contraintes, defaults, RLS ou invariants Supabase ; incompatibilite avec d'autres environnements. |
| Impact Prisma | Baseline ou nouveaux edges changeraient le graphe et la source de depart des futurs plans. |
| Impact RLS | Incertain ; Prisma ne represente pas les policies et pourrait ignorer ou perturber la gouvernance externe. |
| Impact donnees | Une migration corrective pourrait modifier schema et comportements ; risque de DDL/DML selon le plan. |
| Retour arriere | Difficile ; dependrait de migrations inverses et d'un inventaire des environnements. |

**Appropriation :** non recommandee tant que la source de verite et les invariants RLS ne sont pas decides.

## 9. Recommandation pour l'environnement de developpement

Conserver temporairement l'etat actuel et **ne pas lancer `migrate resolve`**.

Pour le developpement, la priorite est de documenter la decision de gouvernance et de separer les preuves :

1. le contrat Prisma et le graphe restent la reference des changements de schema geres par Prisma ;
2. PostgreSQL/Supabase reste la reference des roles, privileges et RLS tant qu'aucun contrat externe n'est adopte ;
3. les validations actuelles sont interpretees comme des validations avec role bypass, pas comme des validations RLS ;
4. tout futur test de privilege doit utiliser un environnement et un role non bypass explicitement autorises, sans simuler de changement dans ce bloc ;
5. la decision sur le marqueur Prisma est suspendue jusqu'a l'accord humain sur les 47 divergences et RLS.

Cette recommandation conserve les donnees et evite de transformer une preuve locale limitee en historique Prisma certifie.

## 10. Recommandation pour la production

Ne pas deployer une reconciliation Prisma ou un changement RLS en production sur la base de l'etat local.

Avant toute action de production, il faut obtenir pour l'environnement cible :

- le role exact de connexion et ses attributs ;
- les policies et privileges reels des roles applicatifs ;
- la confirmation que RLS sans policy est voulu ou non ;
- le contrat Prisma et la migration history attendus ;
- la comparaison du marqueur de production avec le graphe ;
- une procedure de rollback et une validation independante des donnees.

La production ne doit pas heriter automatiquement de la decision locale, car aucun role ni policy de production n'a ete etabli par les Blocs 1.1 a 1.7.

## 11. Decisions humaines requises avant toute modification

1. L'application doit-elle continuer a utiliser `postgres`/un role bypass, ou adopter un role applicatif non bypass ?
2. RLS sans policy sur 47 tables est-elle un invariant voulu, une protection par defaut ou une configuration incomplete ?
3. Prisma doit-il gerer uniquement le schema de donnees, ou existe-t-il un processus officiel externe pour RLS/privileges ?
4. Quelle est la source de verite en cas de conflit entre contrat Prisma, marqueur Prisma et schema PostgreSQL ?
5. Les 47 divergences historiques sont-elles acceptees, ou doivent-elles etre modelisees dans un plan dedie ?
6. `20260915T1057_add_publication_flags` doit-elle etre reconnue comme appliquee apres une decision, ou rester pending ?
7. Quels roles et environnements doivent etre testes avant toute decision de production ?
8. Quelle procedure de retour arriere est approuvee pour un changement de marqueur, de role ou de RLS ?

## Conclusion

Les validations de donnees et le runtime public sont coherents, mais ils ont ete observes avec une connexion `postgres` qui contourne RLS. Prisma controle le contrat et son historique de migrations ; PostgreSQL/Supabase controle l'etat physique, les privileges et RLS. Ces deux perimetres ne sont pas encore gouvernes par une decision commune.

Aucune option ne doit etre appliquee avant la decision humaine sur le role applicatif, la gouvernance RLS et la source de verite Prisma.

DECISION_HUMAINE_REQUISE
