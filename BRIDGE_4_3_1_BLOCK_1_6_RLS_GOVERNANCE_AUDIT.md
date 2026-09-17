# BRIDGE 4.3.1 — Bloc 1.6 — Audit de gouvernance RLS et source de verite Prisma

## 1. Cadre

- Date/heure du controle : `2026-09-15T12:54:12.4758107+01:00`
- Projet : `C:\laragon\www\CHATEAU DU MWANA`
- Mode : **READ-ONLY strict**.
- Aucun fichier, schema, migration, RLS, contrainte ou donnee modifie.
- Aucune commande `migrate`, `migrate resolve`, `db push`, `db reset`, seed ou commande mutatrice executee.

Les lectures PostgreSQL ont utilise uniquement la connexion `DATABASE_URL` existante et le driver `pg` deja installe. Les commandes directes etaient des `SELECT` sur `pg_class`, `pg_namespace`, `pg_roles`, `pg_policies`, `pg_constraint`, `pg_attribute`, `information_schema` et `prisma_contract`.

## 2. Question de gouvernance

Le Bloc 1.5 a etabli :

- 47 tables du schema `public` ;
- RLS active sur les 47 tables ;
- `relforcerowsecurity=false` sur les 47 ;
- 0 policy dans `pg_policies` ;
- 47 tables RLS sans policy ;
- proprietaire des tables : `postgres` ;
- `postgres` avec `rolbypassrls=true` ;
- `service_role` et plusieurs roles Supabase avec `rolbypassrls=true`.

La question n'est donc pas seulement « RLS est-elle active ? », mais « qui est autorise a en faire la source de verite et ou cette intention est-elle declaree ? »

## 3. Preuves de gouvernance RLS dans le depot

### Scripts et documentation

- `enable_rls.ts` ne modifie pas RLS : il teste la connexion et lit la liste des tables via un `SELECT`.
- Aucune migration sous `migrations/app/` ne declare `ENABLE ROW LEVEL SECURITY`, `CREATE POLICY` ou `ALTER TABLE ... FORCE ROW LEVEL SECURITY`.
- Aucune policy RLS n'est presente dans `prisma/schema.prisma`, `prisma/schema.json`, `prisma/schema.d.ts` ou les snapshots inspectes.
- Aucune documentation du depot ne nomme un proprietaire fonctionnel des policies, un role de deploiement RLS, un inventaire de policies ou un invariant RLS a conserver.
- Les rapports Bloc 1.2 a 1.5 documentent l'etat observe, mais pas une decision d'architecture etablissant RLS comme contrat externe officiel.

Conclusion : aucune preuve documentaire dans le depot ne demontre que l'activation RLS sur les 47 tables est une decision gouvernee et versionnee. Cela ne prouve pas qu'elle est accidentelle ; l'intention reste non demontree.

### Historique Git

Le checkout est fortement modifie et les repertoires `prisma/` et `migrations/` sont non suivis dans l'etat Git actuel. Le depot Git ne fournit qu'un commit initial `8d3e129 Initial commit from Create Next App` pour la branche inspectee.

Consequences :

- aucune histoire Git fiable des activations RLS ;
- aucune preuve Git d'un commit de policies ;
- aucune preuve Git permettant d'attribuer l'activation a Bloc 1.1 ;
- aucune preuve Git d'une migration historique RLS versionnee.

## 4. Etat PostgreSQL direct

### RLS et policies

| Element | Resultat |
| --- | ---: |
| Tables `public` | 47 |
| `relrowsecurity=true` | 47 |
| `relforcerowsecurity=true` | 0 |
| Policies dans `pg_policies` | 0 |
| Tables RLS sans policy | 47 |
| Policies SELECT | 0 |
| Policies INSERT | 0 |
| Policies UPDATE | 0 |
| Policies DELETE | 0 |

Pour chaque table publique, `pg_policies` ne retourne aucune ligne. Il n'existe donc aucun nom de policy, role cible, `USING` ou `WITH CHECK` a inventorier.

### Proprietaires et roles bypass RLS

Les 47 tables `public` ont pour proprietaire `postgres`. Les roles lus avec `rolbypassrls=true` ou `rolsuper=true` sont :

- `postgres` : `rolsuper=false`, `rolbypassrls=true` ;
- `service_role` : `rolsuper=false`, `rolbypassrls=true` ;
- `supabase_admin` : `rolsuper=true`, `rolbypassrls=true` ;
- `supabase_etl_admin` : `rolsuper=false`, `rolbypassrls=true` ;
- `supabase_read_only_user` : `rolsuper=false`, `rolbypassrls=true`.

Interpretation prudente : RLS est un etat de securite reel, mais aucune policy ne definit les acces ordinaires. Les proprietaires/bypass peuvent lire ou modifier sans etre representatifs des roles non privilegies. Une verification faite avec `postgres` ou `service_role` ne prouve donc pas le comportement d'un role applicatif non bypass.

### Conclusion RLS

- Protection physique active : **prouvee**.
- Policies intentionnelles : **non prouvees** ; aucune policy n'existe dans `pg_policies`.
- Filtrage RLS applicatif : **non prouve**.
- Desactivation/modification sans gouvernance : **a haut risque**.

Il ne faut pas harmoniser automatiquement `relrowsecurity=true` avec le contrat Prisma, et il ne faut pas conclure que l'etat est correct uniquement parce que les roles de service contournent RLS.

## 5. Source de verite Prisma

Il existe quatre niveaux distincts, qui ne sont pas alignes aujourd'hui.

### A. Contrat de code

Source : `prisma/schema.prisma`.

- Contrat courant : `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60`.
- Profile hash : `3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2`.
- Les artefacts `prisma/schema.json` et `prisma/schema.d.ts` correspondent au contrat courant.
- Le contrat courant declare les colonnes `Service.isPublished` et `Formula.isPublished`.
- Le contrat ne declare pas les policies RLS PostgreSQL.

Ce niveau est la source de verite de l'etat schema souhaite par l'application Prisma, mais pas de la gouvernance RLS externe.

### B. Graphe de migrations sur disque

Graphe observe :

```text
EMPTY
  -> 20260911T1730_init
  -> 20260915T1057_add_publication_flags
  -> contrat courant 398bb216...
```

Migrations connues :

- `20260911T1730_init`, hash `92182508b2a3ece581a77449256c9a5dc3c6fd877295c8c47c96a28aa3268d49`, `from=null`, `to=3da8eac...`, 187 operations ;
- `20260915T1057_add_publication_flags`, hash `68028fd8eefad37d24973a94473e13eb2eba7d02c4b0d961a7280e598632567f`, `from=3da8eac...`, `to=398bb216...`, 3 operations.

Aucun repertoire `migrations/app/refs/` n'a ete observe. Il n'y a donc pas de ref `db`, `staging` ou `production` versionnee dans ce checkout.

Le graphe est la source de verite de la sequence de migrations disponible, mais il ne contient pas les policies RLS observees en base.

### C. Marqueur vivant PostgreSQL

Lecture directe de `prisma_contract.marker` :

```text
space        = app
core_hash    = 3da8eac623684af82c16039df326d8ff7b2ad0cb5eaa780663d86f6c75de77f0
profile_hash = 3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2
updated_at   = 2026-09-11T17:30:39.228Z
invariants   = []
```

Le marqueur est la source de verite de la position Prisma de **cette base**. Il indique l'init, pas le contrat courant. `migration status` confirme que la migration publication est pending.

### D. Schema physique PostgreSQL

Le schema reel est la source de verite des objets effectivement presents :

- 47 tables `public` ;
- RLS active sur les 47 ;
- 0 policy ;
- contraintes et defaults physiques presents ;
- colonnes `isPublished` presentes avec `boolean NOT NULL DEFAULT false`.

Le schema physique est donc en partie au-dela du marqueur Prisma, tout en portant des metadonnees de securite qui ne sont pas dans le contrat Prisma.

## 6. Où se situe exactement la divergence

```text
Contrat Prisma courant        = 398bb216... (isPublished inclus)
Migration publication          = presente sur disque, pending
Marqueur Prisma base           = 3da8eac... (init)
Colonnes physiques publication = presentes et conformes
RLS physique                  = active sur 47 tables
Policies physiques            = aucune
Contrat Prisma RLS            = aucune declaration
```

La divergence n'est pas une simple difference entre schema et migration publication :

1. les colonnes de publication ont deja ete appliquees physiquement ;
2. le marqueur Prisma n'a pas avance ;
3. les differences historiques du schema couvrent 47 tables ;
4. RLS est active sans policy et sans declaration versionnee visible ;
5. les roles privilegies bypassent RLS.

## 7. Interpretation de gouvernance

### Ce qui est demontre

- Prisma est autoritaire pour le contrat de donnees declare et le graphe des migrations.
- `prisma_contract.marker` est autoritaire pour la position Prisma de la base locale.
- PostgreSQL est autoritaire pour RLS, policies, proprietaires, roles bypass et contraintes physiques.
- Les deux systemes ne couvrent pas le meme perimetre.
- La migration publication est techniquement coherente avec les colonnes physiques, mais non reconnue comme appliquee.

### Ce qui n'est pas demontre

- que RLS a ete active intentionnellement ;
- que l'absence de policy est volontaire ;
- que `postgres`/`service_role` sont les seuls roles prevus pour les acces applicatifs ;
- que les differences historiques de contraintes sont acceptees comme invariants ;
- que l'equipe souhaite que Prisma gere ou ignore les objets de securite externes ;
- qu'un environnement autre que la base locale partage le meme etat.

## 8. Risques de source de verite

- Marquer seulement la migration publication comme appliquee alignerait le marqueur Prisma, mais ne gouvernerait ni RLS ni les 47 divergences historiques.
- Traiter Prisma comme autorite complete pourrait conduire a supprimer ou modifier une protection PostgreSQL externe non versionnee.
- Traiter PostgreSQL comme autorite complete ferait perdre la reproductibilite du contrat Prisma et de son graphe.
- L'absence de policies peut provoquer un refus d'acces pour des roles non bypass ; les controles executes via un role bypass ne couvrent pas ce cas.
- La presence de `service_role`/`postgres` avec bypass peut masquer une panne RLS ou une absence de policies dans les validations applicatives.
- L'absence de refs versionnees rend l'origine d'un futur plan Prisma ambiguë : le graphe ne suffit pas a choisir une source de depart.

## 9. Recommandation de gouvernance

`RECOMMANDATION = NE PAS MODIFIER`

Avant toute reconciliation Prisma, il faut une decision humaine explicite sur deux points :

1. **RLS** : confirmer si l'activation des 47 tables sans policy est un invariant voulu, une protection par defaut temporaire ou une configuration incomplete ; identifier les roles applicatifs reels et tester leurs privileges dans un audit autorise ;
2. **Source de verite** : declarer si le contrat Prisma, le marqueur Prisma ou le schema PostgreSQL externe prime pour les objets hors contrat, et documenter la regle dans le depot ou le processus de deploiement.

Cette recommandation n'applique aucune solution. Elle ne propose pas de lancer `migrate resolve`.

## 10. Verdict

**`PRISMA_RECONCILIATION_NEEDS_EVIDENCE`**

La gouvernance RLS et la source de verite Prisma ne sont pas suffisamment documentees pour autoriser une reconciliation sûre. Le rapport recommande de ne rien modifier et d'attendre la validation humaine.
