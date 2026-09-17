# BRIDGE 4.3.1 — Bloc 1.9 — Plan de reconciliation controlee Prisma / PostgreSQL / RLS

## 1. Resume executif

Ce document est un **PLAN_ONLY**. Il ne modifie aucun fichier, aucune donnee, aucun schema, aucune migration, aucun role et aucune policy.

Etat etabli par les Blocs 1.1 a 1.8 :

- contrat Prisma courant : `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60` ;
- profile hash : `3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2` ;
- migration init appliquee : `20260911T1730_init` ;
- migration publication sur disque : `20260915T1057_add_publication_flags`, hash `68028fd8...` ;
- migration publication toujours `pending` ;
- marqueur Prisma : contrat initial `3da8eac...` ;
- colonnes `formula.isPublished` et `service.isPublished` physiquement presentes en `boolean NOT NULL DEFAULT false` ;
- quatre fixtures privees et donnees commerciales conformes ;
- 47 tables `public` avec RLS active ;
- 0 policy PostgreSQL dans `pg_policies` ;
- role `DATABASE_URL` actuel : `postgres`, `rolbypassrls=true`, privileges DML complets sur les tables critiques ;
- validations precedentes realisees avec un role bypass RLS ;
- 47 divergences Prisma historiques non toutes expliquees ni acceptees par decision humaine.

Conclusion : aucune reconciliation ne doit etre executee avant une decision de gouvernance sur RLS, le role applicatif et la source de verite des objets PostgreSQL hors contrat Prisma.

## 2. Etat actuel

### Prisma

Prisma controle actuellement le contrat emis, les hashes, le graphe des migrations, le marqueur de contrat et le statut pending/applied derive de ce marqueur. Le graphe est :

```text
EMPTY
  -> 20260911T1730_init
  -> 20260915T1057_add_publication_flags
  -> contrat courant 398bb216...
```

La migration publication contient deux ajouts de colonnes et un backfill. Elle n'est pas marquee appliquee, meme si ses effets physiques locaux ont ete observes.

### PostgreSQL / Supabase

PostgreSQL controle l'etat reel des tables, colonnes, contraintes, defaults, proprietaires, roles, privileges et RLS. Les 47 tables publiques sont possedees par `postgres`, RLS est active, `relforcerowsecurity=false`, et aucune policy n'existe dans `pg_policies`.

### Application

L'application utilise Auth Supabase cote serveur, `requireAuth`, `requireRole`, RBAC applicatif et des revalidations metier de publication dans les services. La connexion Prisma locale utilise cependant `postgres`, qui contourne RLS.

## 3. Inventaire des sources de verite

| Source | Controle effectivement | Versionne | Non versionne / limite |
| --- | --- | --- | --- |
| `prisma/schema.prisma` et artefacts emis | contrat Prisma souhaite, types, colonnes, relations, defaults exprimes | fichiers locaux, mais non suivis dans l'etat Git observe | ne contient pas les policies RLS ni les privileges effectifs |
| `migrations/app/` | sequence/hash des migrations Prisma | packages de migration presents sur disque | pas de ref `db/staging/production` observee ; RLS absente |
| `prisma_contract.marker` | position Prisma de la base locale | ligne en base, pas dans le graphe Git | marqueur `3da8...`, pas contrat courant |
| PostgreSQL `public` | objets physiques, contraintes, defaults et donnees | etat vivant uniquement dans cet audit | ecarts historiques et origine non gouvernes |
| `pg_roles` / privileges | identite et pouvoir reel des connexions | non versionne par Prisma | role production non audite |
| `pg_class` / `pg_policies` | activation RLS et policies reelles | 0 policy versionnee ou presente observee | intention RLS non demontree |
| Supabase Auth/RBAC applicatif | identite, roles metier et controles server-side | code applicatif local | ne remplace pas une politique RLS PostgreSQL |

Aucun de ces niveaux ne peut etre presume autoritaire pour les autres sans decision humaine.

## 4. Classification des 47 divergences

Le nombre 47 correspond a 47 issues table retournees par `db verify --schema-only`, non a 47 operations independantes. Une issue peut contenir plusieurs sous-differences.

| Categorie | Nombre d'objets/issues | Nominale | Fonctionnelle | Inconnue | Action proposee |
| --- | ---: | ---: | ---: | ---: | --- |
| PK | 47 | 47 noms PostgreSQL `*_pkey` | 0 demontree | 0 sur les colonnes ; intention historique non documentee | conserver provisoirement ; accepter explicitement les noms si confirmes |
| FK | 57 contraintes physiques impliquees | noms/representation pour une partie | aucune incorrecte demontree | equivalence exhaustive des actions et invariants a confirmer | comparer au contrat et accepter/corriger uniquement par table |
| UNIQUE | 18 contraintes | 18 noms `*_key` | 0 couverture differente demontree | 0 majeure dans les colonnes lues | conserver si les colonnes/ordres sont confirmes |
| CHECK | 29 contraintes | expressions PostgreSQL normalisees | 0 valeur fonctionnelle incorrecte demontree | equivalence semantique exhaustive a confirmer | comparer les ensembles de valeurs, ne pas renommer automatiquement |
| DEFAULT | 62 colonnes | representations `default`/`resolvedDefault` | 0 valeur critique differente demontree | representations non normalisees restantes | verifier les valeurs normalisees, conserver les equivalentes |
| RLS | 47 tables activees | 0 policy a comparer | protection active reelle ; effet role non bypass non valide | intention, role cible et gouvernance inconnus | decision humaine avant toute modification |

### Divergences potentiellement fonctionnelles

| Element | Prisma | PostgreSQL | Comportement possible | Impact | Preuve disponible | Preuve manquante |
| --- | --- | --- | --- | --- | --- | --- |
| RLS des 47 tables | non declaree | `relrowsecurity=true` | roles non bypass potentiellement refuses sans policy | acces et securite | RLS active, 0 policy, roles bypass connus | privileges reels des roles applicatifs non bypass, intention humaine |
| FK et `ON DELETE` | relations et actions du contrat | 57 FK et actions lues | suppression/restrict/cascade potentiellement differente si un mapping diverge | integrite et cascade | colonnes, cibles et actions lues | comparaison exhaustive contrat/snapshot/production |
| CHECK | enums du contrat | 29 expressions `ANY(ARRAY[...])` | valeurs acceptees potentiellement differentes si liste diverge | validation des statuts | expressions PostgreSQL exactes | preuve semantique exhaustive pour chaque expression |
| Defaults | `resolvedDefault` | defaults SQL exacts | creation de ligne avec valeur differente si valeur non equivalente | donnees metier | defaults critiques lus | comparaison de toutes les 62 valeurs avec snapshot |

Aucune difference ne doit etre declaree sans impact uniquement parce qu'un nom est different.

## 5. Gouvernance RLS : options

### Option A — RLS externe a Prisma, gouverne separement

- **Avantages :** separation claire entre schema de donnees Prisma et securite PostgreSQL/Supabase ; Prisma ne reecrit pas les policies.
- **Risques :** drift entre environnements si l'inventaire RLS n'est pas versionne ; responsabilite operationnelle supplementaire.
- **Impact Prisma :** aucun changement de contrat ; les checks Prisma doivent tolerer les invariants externes convenus.
- **Impact Supabase :** policies/roles restent geres par un processus PostgreSQL/Supabase dedie.
- **Impact securite :** permet une gouvernance adaptee, mais l'etat actuel sans policy reste a decider.
- **Impact developpement :** validations separees avec role bypass et role non bypass.
- **Impact production :** inventaire et controles RLS obligatoires par environnement.
- **Versionnement :** migrations/policies PostgreSQL dediees ou depot d'infrastructure obligatoire.
- **Tests :** `pg_class`, `pg_policies`, matrice de privileges et tests Auth/RBAC.
- **Rollback :** policies/roles doivent disposer d'une version precedente connue ; aucune operation de rollback automatique.

### Option B — RLS versionne dans un mecanisme PostgreSQL dedie

- **Avantages :** policies, grants et roles deviennent auditables et deployables.
- **Risques :** second systeme de migration a coordonner avec Prisma ; ordre de deploiement sensible.
- **Impact Prisma :** Prisma ignore toujours les policies sauf convention d'invariants ; le graphe doit documenter la dependance.
- **Impact Supabase :** gouvernance explicite des roles et policies.
- **Impact securite :** meilleure tracabilite, mais risque d'erreur dans `USING`/`WITH CHECK`.
- **Impact developpement :** base de test et roles de test doivent reproduire les acces reels.
- **Impact production :** approbation securite et rollback obligatoire.
- **Versionnement :** depot/migrations PostgreSQL separees, revues avec le schema Prisma.
- **Tests :** tests positifs/negatifs par role, DML et isolation de lignes.
- **Rollback :** migration inverse preparee et testee avant production.

### Option C — Integrer RLS au processus de migration du projet

- **Avantages :** un pipeline unique et une relation explicite entre changement schema et securite.
- **Risques :** Prisma 8 actuel ne represente pas les policies observees ; risque de melanger deux contrats et de masquer les invariants Supabase.
- **Impact Prisma :** necessite une extension/processus officiel documente, pas une modification ad hoc des migrations actuelles.
- **Impact Supabase :** deploiements couples, avec ordre et permissions a controler.
- **Impact securite :** meilleure coherence potentielle, mais blast radius eleve.
- **Impact developpement :** tests et snapshots plus lourds.
- **Impact production :** validation conjointe DBA/Securite/Applicatif.
- **Versionnement :** migration Prisma + artefact RLS lies par un identifiant commun.
- **Tests :** schema, policies, privileges, Auth/RBAC, smoke tests et rollback.
- **Rollback :** depend des deux systemes ; doit etre valide avant application.

### Option D — Ne pas ajouter de policies pour le moment

- **Avantages :** aucun changement de securite pendant l'analyse ; preserve l'architecture server-side actuelle.
- **Risques :** absence de filtrage RLS documente ; les roles non bypass peuvent etre bloques ou non representatifs.
- **Impact Prisma :** aucun.
- **Impact Supabase :** RLS reste active sans policy.
- **Impact securite :** role bypass continue d'etre critique ; comportement non bypass non qualifie.
- **Impact developpement/production :** risque accepte uniquement par decision explicite et par environnement.
- **Versionnement :** documenter l'exception et son proprietaire.
- **Tests :** tester au minimum le role applicatif reel et le role non bypass autorise.
- **Rollback :** aucun changement a annuler.

Aucune option RLS n'est selectionnee automatiquement.

## 6. Gouvernance du role `DATABASE_URL`

### Etat actuel

`DATABASE_URL` utilise `postgres`, `rolbypassrls=true`, proprietaire des tables et disposant de `SELECT/INSERT/UPDATE/DELETE` sur les 21 tables critiques.

### Option A — Conserver temporairement

- **Privileges necessaires :** ceux deja presents, tres larges.
- **Effet RLS :** RLS contournee.
- **Risques :** validations non representatives, privilege excessif, impact blast radius maximal en cas de compromission.
- **Tests :** continuer les tests metier, mais les declarer bypass-only ; ajouter un test non bypass dans un environnement dedie.
- **Next.js/Prisma :** compatibilite immediate.
- **Developpement :** pratique mais trompeur pour RLS.
- **Production :** deconseille sans justification et controle.
- **Rollback :** aucun changement ; conserver l'etat.

### Option B — Adopter un role applicatif non bypass

- **Privileges necessaires :** schema usage, SELECT/INSERT/UPDATE/DELETE strictement necessaires, privileges sequences/fonctions selon l'ORM, et policies ou acces compatibles.
- **Effet RLS :** RLS s'applique reellement au role.
- **Risques :** panne immediate des parcours si policies absentes ou privileges incomplets.
- **Tests :** matrice DML par table critique, parcours Auth/RBAC, reservation, publication et refus attendus.
- **Next.js/Prisma :** compatible si la connexion possede les privileges requis.
- **Developpement :** environnement de test necessaire avant changement local.
- **Production :** option preferable en principe, sous approbation securite et exploitation.
- **Rollback :** reconfigurer vers le role precedent est techniquement possible mais restaure le risque ; rollback doit etre approuve.

### Option C — Role de migration distinct du role runtime

- **Privileges necessaires :** role runtime minimal ; role de migration separe, controle et non utilise par l'application.
- **Effet RLS :** le runtime peut etre soumis a RLS tandis que les migrations sont executees par un role gouverne.
- **Risques :** gestion de deux secrets/roles et confusion possible entre outils.
- **Tests :** verifier que Next.js n'utilise jamais le role de migration et que Prisma migration fonctionne uniquement dans la fenetre autorisee.
- **Next.js/Prisma :** architecture compatible, mais configuration a documenter.
- **Developpement :** simplifie la separation des tests et des migrations.
- **Production :** recommandable sous controle DBA/CI.
- **Rollback :** restaurer les roles precedents seulement apres validation de l'acces runtime.

## 7. Migration `20260915T1057_add_publication_flags`

### Preuves disponibles

| Condition | Etat |
| --- | --- |
| package sur disque | prouve : `migration.json`, `ops.json`, `migration.ts` |
| hash package | prouve : `68028fd8...` |
| ajout `formula.isPublished` | prouve physiquement |
| ajout `service.isPublished` | prouve physiquement |
| `NOT NULL DEFAULT false` | prouve physiquement |
| backfill declare | prouve dans `ops.json`/`migration.ts` |
| quatre fixtures false | prouve par lectures Blocs 1.3/1.5 |
| donnees commerciales publiees | prouve par Bloc 1.3 |
| migration journalisee applied | faux : Prisma la signale pending |
| 47 divergences acceptees | non prouve |
| RLS gouvernee | non prouve |
| marqueur avancable sans masquer un probleme | non prouve |

### Procedure future conditionnelle

**[PLANIFIE — NON EXECUTE]**

SI, et seulement si :

A. la decision humaine confirme la source de verite Prisma pour le schema ;
B. la gouvernance RLS est documentee et accepte l'etat ou definit le changement futur ;
C. le role de migration est identifie et separe du role runtime si necessaire ;
D. les 47 divergences sont classees, acceptees ou traitees ;
E. les valeurs de publication sont revalidees par une lecture autorisee ;
F. le rollback et l'impact multi-environnements sont approuves ;

ALORS, l'equipe peut choisir explicitement une operation de regularisation du marqueur, par exemple `migrate resolve --applied`, marquee **[PLANIFIE — NON EXECUTE]**.

PUIS :

- relire `migration status` et `migration log` ;
- verifier le hash du marqueur ;
- relancer une verification schema autorisee ;
- verifier les colonnes et les quatre fixtures ;
- executer les tests server-side ;
- executer les tests avec le role runtime reel et un role non bypass approprie ;
- obtenir la validation humaine finale.

SINON : **STOP**, aucune resolution du marqueur.

## 8. Strategie de reconciliation des 47 differences

### Etape 0 — Point de retour et gel de l'etat

- **Objectif :** conserver les preuves, hashes, rapports et etat DB avant toute action.
- **Preconditions :** validation humaine du perimetre et acces a un stockage d'audit.
- **Operation future :** exporter les metadonnees et sauvegarder les packages/marqueurs sans les modifier.
- **Tables concernees :** toutes les tables `public` et `prisma_contract`.
- **Risque :** exposition de secrets si les exports sont mal traites.
- **Test :** hashes des packages, inventaire des tables, marker hash et policies.
- **PASS :** artefacts recuperables et secrets exclus.
- **STOP :** hash ou marker non reproductible.
- **Rollback :** restaurer les artefacts d'audit, aucune restauration DB executee automatiquement.

### Etape 1 — Decision RLS

- **Objectif :** decider si RLS est externe, versionnee via PostgreSQL dedie ou integree au processus global.
- **Preconditions :** proprietaire humain de la securite, inventaire des roles, environnement cible.
- **Operation future :** documenter l'invariant et la procedure ; ne modifier aucune policy sans approbation.
- **Tables concernees :** 47 tables `public`.
- **Risque :** mauvaise decision d'acces globale.
- **Test :** matrice policies/roles, tests positifs et negatifs.
- **PASS :** proprietaire, roles et expected access approuves.
- **STOP :** policy/role attendu inconnu.
- **Rollback :** procedure policy versionnee avant toute application.

### Etape 2 — Decision du role applicatif

- **Objectif :** choisir entre role bypass temporaire, role runtime non bypass et role migration distinct.
- **Preconditions :** matrice DML des tables critiques, policies ou absence de policies acceptee.
- **Operation future :** creer/configurer un role dans un environnement controle, jamais directement en production sans approbation.
- **Tables concernees :** 21 tables critiques au minimum.
- **Risque :** panne ou privilege excessif.
- **Test :** `has_table_privilege`, tests applicatifs Auth/RBAC, refus attendus.
- **PASS :** acces minimaux et parcours critiques valides.
- **STOP :** privilege DML non justifie ou RLS non testable.
- **Rollback :** restauration de la configuration de connexion approuvee.

### Etape 3 — Validation PK et UNIQUE

- **Objectif :** distinguer noms nominaux et couvertures de colonnes.
- **Preconditions :** snapshots Prisma et inventaire PostgreSQL compares table par table.
- **Operation future :** accepter les noms si les colonnes/ordres sont identiques ; corriger uniquement une couverture differente validee.
- **Tables concernees :** 47 PK, 18 UNIQUE.
- **Risque :** contrainte manquante ou ajout trop large.
- **Test :** comparaison `pg_constraint`/contrat et tests d'unicite applicatifs.
- **PASS :** colonnes et ordres correspondants ou exception approuvee.
- **STOP :** couverture differente non expliquee.
- **Rollback :** migration inverse testee si une correction est autorisee.

### Etape 4 — Validation FK

- **Objectif :** comparer les 57 FK, colonnes, ordres, cibles et actions.
- **Preconditions :** decision RLS/role independante ; snapshot initial disponible.
- **Operation future :** classer chaque FK NOMINALE, REPRESENTATION, FONCTIONNELLE ou INCONCLUSIVE.
- **Tables concernees :** toutes les tables reliees.
- **Risque :** CASCADE/RESTRICT/SET NULL incorrect.
- **Test :** comparaison exacte et tests de suppression dans une base de test dediee, jamais sur les donnees actuelles.
- **PASS :** actions equivalentes ou exception approuvee.
- **STOP :** action divergente non acceptee.
- **Rollback :** contrainte inverse preparee et testee.

### Etape 5 — Validation CHECK

- **Objectif :** prouver l'equivalence semantique des 29 checks.
- **Preconditions :** listes enum du contrat et expressions PostgreSQL extraites.
- **Operation future :** accepter les normalisations `ANY(ARRAY[...])` si l'ensemble est identique.
- **Tables concernees :** tables de statuts et enums.
- **Risque :** accepter une valeur interdite ou refuser une valeur valide.
- **Test :** comparaison d'ensembles et tests de bornes dans une base de test.
- **PASS :** ensembles identiques.
- **STOP :** valeur differente ou expression non interpretable.
- **Rollback :** contrainte precedente restauree par migration approuvee.

### Etape 6 — Validation DEFAULT

- **Objectif :** comparer les 62 defaults par valeur normalisee, pas seulement par chaine SQL.
- **Preconditions :** snapshot/contrat et `information_schema.columns` disponibles.
- **Operation future :** accepter `now()`, literals et casts equivalentes ; corriger uniquement les valeurs differentes confirmees.
- **Tables concernees :** 62 colonnes.
- **Risque :** nouvelles lignes avec etat metier incorrect.
- **Test :** comparaison de valeur et creation controlee dans une base de test.
- **PASS :** valeur normalisee identique.
- **STOP :** valeur differente non approuvee.
- **Rollback :** default precedent connu et migration inverse.

### Etape 7 — Decision du chemin Prisma

- **Objectif :** choisir entre maintien pending, regularisation du marker, baseline ou migration corrective.
- **Preconditions :** Etapes 1 a 6 PASS, source de verite approuvee, role connu, rollback valide.
- **Operation future :** planifier une commande Prisma precise, marquee **[PLANIFIE — NON EXECUTE]**.
- **Risque :** masquer le drift ou produire un graphe non rejouable.
- **Test :** status/log/verify avant et apres dans environnement controle.
- **PASS :** marker, graphe et schema physique expliquent la meme histoire.
- **STOP :** divergence non documentee.
- **Rollback :** procedure de marker/migration approuvee avant action.

### Etape 8 — Tests applicatifs

- **Objectif :** verifier publication, Auth, RBAC, reservations, paiements et parcours critiques.
- **Preconditions :** role de test defini, fixtures preservees, base de test ou snapshot approuve.
- **Operation future :** executer les suites de tests autorisees dans l'environnement de test.
- **Risque :** tests mutateurs sur mauvaise base.
- **Test :** suites server-side, publication, reservations et regressions.
- **PASS :** tous les parcours critiques passent.
- **STOP :** acces ou donnees inattendus.
- **Rollback :** restauration de la base de test, jamais production sans procedure.

### Etape 9 — Tests securite/RLS

- **Objectif :** mesurer l'acces des roles bypass et non bypass.
- **Preconditions :** roles de test explicitement autorises et environnement isole.
- **Operation future :** executions SELECT/DML de test avec assertions d'acces.
- **Risque :** test sur mauvaise base ou exposition de donnees.
- **Test :** matrice SELECT/INSERT/UPDATE/DELETE, refus attendus et policies.
- **PASS :** matrice approuvee et reproductible.
- **STOP :** role reel inconnu ou privilege excessif.
- **Rollback :** aucun rollback de donnees si les tests sont isoles et read-only ; sinon restauration approuvee.

### Etape 10 — Validation finale

- **Objectif :** obtenir la decision humaine finale par environnement.
- **Preconditions :** toutes les preuves, rapports et logs disponibles.
- **Operation future :** approbation explicite de la strategie choisie.
- **Tables concernees :** toutes celles du perimetre.
- **Risque :** validation incomplete.
- **Test :** checklist de sortie de la Partie 10.
- **PASS :** source de verite, RLS, role, 47 divergences, migration et rollback approuves.
- **STOP :** un seul element critique inconnu.
- **Rollback :** plan de retour approuve avant execution.

## 9. Strategie par environnement

### DEVELOPPEMENT

- **Role attendu :** conserver temporairement `postgres` uniquement comme etat connu ; preferer a terme un role runtime non bypass dans une base de test dediee.
- **RLS attendue :** etat explicite a decider ; ne pas desactiver ni ajouter de policy localement sans gouvernance.
- **Policies attendues :** aucune policy n'est observee ; cela doit etre accepte ou corrige dans un environnement dedie, jamais implicitement.
- **Prisma :** conserver pending jusqu'a decision ; ne pas regulariser le marker automatiquement.
- **Historique :** init applied, publication pending, 47 divergences documentees.
- **Tests obligatoires :** role bypass documente, role non bypass autorise, publication, Auth/RBAC, contraintes et status Prisma.
- **Validation humaine :** proprietaire developpement + securite + DBA/Prisma.

### STAGING

- **Role attendu :** role de migration distinct et role runtime minimal, a identifier avant toute action.
- **RLS attendue :** inventaire direct de `pg_class`, `pg_policies`, proprietaires et privileges staging.
- **Policies attendues :** explicites et approuvees, ou exception documentee.
- **Prisma :** graphe et marker staging doivent etre compares au contrat ; ref staging a etablir seulement apres decision.
- **Historique :** ne pas supposer qu'il correspond au local.
- **Tests obligatoires :** migration show/status, schema verify, matrices DML bypass/non bypass, Auth/RBAC et rollback.
- **Validation humaine :** DBA/Supabase, securite, equipe applicative et responsable release.

### PRODUCTION

- **Role attendu :** role runtime minimal non bypass en principe ; role de migration separe, jamais reutilise par Next.js.
- **RLS attendue :** policies et roles production inventoriees et approuvees ; aucune inference depuis le local.
- **Policies attendues :** versionnees dans le mecanisme retenu ou exception formelle avec proprietaire.
- **Prisma :** ne pas appliquer resolve/baseline/corrective sans preuves production et rollback.
- **Historique :** marker, ledger, graph et contrat production doivent etre collectes en lecture avant decision.
- **Tests obligatoires :** dry-run/previews autorises, verification marker/schema, tests de securite par role, sauvegarde et rollback approuves.
- **Validation humaine :** approbation explicite securite, DBA/Supabase, Prisma/release et proprietaire produit.

## 10. Matrice de decision

| Decision | Recommandation | Pourquoi | Risque | Validation humaine |
| --- | --- | --- | --- | --- |
| RLS | Ne pas modifier maintenant ; choisir une gouvernance externe ou integree apres inventaire | 47 RLS, 0 policy, intention inconnue | exposition ou blocage | securite + DBA/Supabase |
| Role applicatif | Conserver temporairement localement ; etudier role runtime non bypass et role migration distinct | `postgres` bypass masque les acces reels | privilege excessif ou panne | securite + exploitation |
| 47 divergences | Classer et accepter/corriger par categorie, sans harmonisation globale | plusieurs differences nominales, d'autres inconnues | correction destructive ou drift accru | DBA + Prisma |
| Migration publication | Laisser pending jusqu'aux conditions A-F ; ne pas resolve maintenant | colonnes/donnees conformes mais marqueur et gouvernance non alignes | historique trompeur | Prisma + DBA |
| Source de verite | Declarer Prisma pour contrat/graph et PostgreSQL pour securite, ou adopter un processus unifie | perimetres actuellement separes | autorite ambigue | architecture + securite |
| Production | Ne rien appliquer depuis le local ; auditer staging/prod separement | role/policies prod inconnus | incident de securite ou migration | release + DBA + securite |

## 11. Ordre d'execution futur

Toutes les lignes ci-dessous sont **[PLANIFIE — NON EXECUTE]**.

1. **Valide par :** proprietaires architecture, securite, DBA et release. **Outil futur :** inventaire/backup approuve. **Preuves avant :** hashes, marker, graph, policies, roles. **Action :** capturer le point de retour. **Verification :** artefacts recuperables. **Rollback :** restauration approuvee.
2. **Valide par :** securite/DBA. **Outil futur :** processus RLS PostgreSQL retenu. **Preuves avant :** roles, `pg_policies`, access matrix. **Action :** documenter puis eventuellement versionner RLS. **Verification :** policies et tests roles. **Rollback :** migration policy inverse testee.
3. **Valide par :** exploitation/securite. **Outil futur :** gestionnaire de roles et secret manager. **Preuves avant :** privileges minimaux. **Action :** adopter eventuellement un role runtime non bypass et un role migration distinct. **Verification :** connexion, DML attendu, refus attendus. **Rollback :** configuration precedente approuvee.
4. **Valide par :** DBA/Prisma. **Outil futur :** scripts de comparaison read-only. **Preuves avant :** snapshots et catalogues. **Action :** classer chaque PK/FK/UNIQUE/CHECK/DEFAULT. **Verification :** matrice complete. **Rollback :** aucune modification a cette etape.
5. **Valide par :** application/QA/securite. **Outil futur :** suites test et environnement isole. **Preuves avant :** fixture/snapshot/roles. **Action :** executer tests bypass et non bypass. **Verification :** resultats approuves. **Rollback :** reset de l'environnement de test uniquement si approuve.
6. **Valide par :** Prisma/DBA/release. **Outil futur :** commande Prisma choisie explicitement. **Preuves avant :** Etapes 1-5 PASS. **Action eventuelle :** `migrate resolve`, baseline ou migration corrective, marquee **[PLANIFIE — NON EXECUTE]**. **Verification :** marker/log/status/schema/donnees/RLS. **Rollback :** procedure approuvee avant execution.
7. **Valide par :** release, securite et proprietaire environnement. **Outil futur :** pipeline de deploiement. **Preuves avant :** staging PASS et production comparee. **Action :** appliquer uniquement l'option approuvee a l'environnement cible. **Verification :** checks post-deploiement et audit. **Rollback :** plan de rollback de l'option.

Aucune commande de cette liste n'a ete executee dans le Bloc 1.9.

## 12. Tests obligatoires

### Tests de schema et Prisma

- `migration list/status/log/graph` avant et apres toute operation future ;
- verification des hashes et checksums ;
- verification du marker et du contrat cible ;
- verification des colonnes `isPublished` et des valeurs des fixtures ;
- comparaison des 47 issues apres toute modification autorisee.

### Tests PostgreSQL et RLS

- `pg_class`: `relrowsecurity`, `relforcerowsecurity` ;
- `pg_policies`: noms, roles, commandes, `USING`, `WITH CHECK` ;
- `pg_roles`: `rolbypassrls`, superuser, proprietaires ;
- matrice `SELECT/INSERT/UPDATE/DELETE` par role et table critique ;
- tests positifs et negatifs des acces attendus ;
- verification qu'aucun role runtime n'utilise involontairement le role migration.

### Tests applicatifs

- Auth session et utilisateur inactif ;
- RBAC par role ;
- publication formule/service ;
- reservation publique par ID direct ;
- reservations internes ;
- paiements, factures, inventaire et logistique ;
- regression avec les fixtures privees ;
- tests avec le role bypass documente et avec le role runtime reel non bypass.

## 13. Rollback

Aucune operation n'est reversible par simple hypothese. Avant toute execution future :

- sauvegarder les metadonnees et les donnees selon la politique approuvee ;
- conserver les hashes des migrations et du contrat ;
- documenter le marker avant action ;
- preparer un rollback de role/connexion ;
- preparer une migration inverse pour toute policy ou contrainte modifiee ;
- definir si le rollback concerne schema, marker, role, RLS, donnees ou plusieurs couches ;
- tester le rollback dans staging avant production.

`migrate resolve` est particulierement difficile a annuler car il modifie l'histoire Prisma sans restaurer automatiquement les divergences physiques.

## 14. Criteres de sortie de la reconciliation

La phase ne pourra etre declaree terminee que lorsque :

- la source de verite est decidee ;
- la gouvernance RLS est decidee ;
- le role applicatif est decide ;
- les 47 divergences sont classees ;
- toute difference fonctionnelle est traitee ou explicitement acceptee ;
- la migration publication est regularisee par decision ;
- les tests bypass et non bypass appropries sont definis et passent ;
- le rollback est valide ;
- developpement, staging et production sont distingues ;
- la validation humaine est enregistree.

## 15. Decisions humaines restantes

1. Choisir le perimetre d'autorite Prisma et PostgreSQL/Supabase.
2. Decider si RLS sans policy est voulu, temporaire ou incomplet.
3. Choisir le role runtime et le role de migration par environnement.
4. Classer les 47 divergences comme acceptees, corrigees ou encore inconnues.
5. Autoriser ou refuser toute regularisation de `20260915T1057_add_publication_flags`.
6. Valider les roles, policies, privilegies et rollback staging/production.
7. Nommer les approbateurs responsables de securite, DBA, Prisma, release et produit.

## Conclusion

Ce document ne recommande aucune execution immediate. Il fournit un ordre controle, des criteres PASS/STOP, des tests et des retours arriere possibles afin qu'une decision humaine puisse etre prise sans confondre le contrat Prisma, le schema PostgreSQL, la gouvernance RLS et l'autorisation applicative.

BLOC 1.9 = PLAN_ONLY

DECISION_HUMAINE_REQUISE
