# BRIDGE 4.3.1 — Bloc 1.7 — Audit du role applicatif et des privileges

## 1. Cadre

- Date/heure : `2026-09-15T12:59:56.3658613+01:00`
- Projet : `C:\laragon\www\CHATEAU DU MWANA`
- Mode : **READ-ONLY strict**.
- Connexion inspectee : `DATABASE_URL`, sans afficher l'URL ni aucun secret.
- Aucun `SET ROLE`, `GRANT`, `REVOKE`, `ALTER`, `UPDATE`, `INSERT`, `DELETE`, `migrate resolve`, `db push`, `db reset` ou changement RLS execute.
- Aucun fichier de code, schema, migration ou donnee modifie.

Les lectures directes ont utilise uniquement `SELECT` via le driver PostgreSQL deja present : identite de session, `pg_roles`, `pg_class`, `pg_namespace`, `has_table_privilege` et `information_schema.role_table_grants`.

## 2. Role réellement utilise par l'application

La session PostgreSQL ouverte avec `DATABASE_URL` a retourne :

| Element | Valeur |
|---|---|
| `current_user` | `postgres` |
| `session_user` | `postgres` |
| `current_role` | `postgres` |
| `current_setting('role')` | `none` |
| Base | `postgres` |
| Port | `5432` |

Aucune URL complete, adresse de connexion, identifiant secret ou mot de passe n'est reproduit dans ce rapport.

Le role réellement utilise par l'application et les scripts Prisma est donc **`postgres`** pour la connexion actuellement configuree dans `DATABASE_URL`.

## 3. Attributs du role

Lecture directe de `pg_roles` :

| Attribut | Valeur |
|---|---:|
| `rolsuper` | `false` |
| `rolbypassrls` | **`true`** |
| `rolinherit` | `true` |
| `rolcreaterole` | `true` |
| `rolcreatedb` | `true` |
| `rolcanlogin` | `true` |
| `rolreplication` | `true` |

Le role `postgres` n'est pas superuser dans cette instance, mais il possède `rolbypassrls=true`. Il contourne donc les politiques RLS lorsqu'il accède aux tables.

Les tables critiques sont toutes possedees par `postgres`. Cette propriete donne egalement au role les privileges de proprietaire sur ces tables.

## 4. Privileges effectifs sur les tables critiques

Tables controlees :

```text
reservation, reservationItem, payment, paymentTransaction, refund,
invoice, customer, user, userRoleAssignment, role, rolePermission,
service, formula, location, inventory, inventoryAllocation, delivery,
deliveryItem, logisticsMission, equipment, equipmentMaintenance
```

Lecture `has_table_privilege(current_user, table, privilege)` :

| Perimetre | Tables | SELECT | INSERT | UPDATE | DELETE | RLS active |
|---|---:|---:|---:|---:|---:|---:|
| Tables critiques | 21 | 21/21 | 21/21 | 21/21 | 21/21 | 21/21 |

Le role `postgres` dispose donc des quatre privileges DML demandes sur chacune des 21 tables critiques. Les lectures de `information_schema.role_table_grants` confirment les privileges explicites du proprietaire, avec `is_grantable=YES`.

Les controles precedents, executes avec ce role, ne testent pas les limites RLS d'un role non bypass. Ils testent la capacite du role `postgres` a lire et modifier les objets, ce qui est attendu pour un proprietaire bypass.

## 5. Reponses directes sur RLS

### Le role utilise par l'application contourne-t-il RLS ?

**Oui.** `current_user=postgres` et `pg_roles.rolbypassrls=true` le prouvent directement.

Cela est coherent avec le Bloc 1.6 : les 47 tables ont RLS active, mais aucune policy dans `pg_policies`. Les validations ORM ont tout de meme acces aux donnees parce qu'elles utilisent le role proprietaire/bypass.

### Les validations actuelles peuvent-elles masquer un probleme RLS ?

**Oui, clairement.**

Les validations precedentes et les lectures ORM utilisent `DATABASE_URL`, donc le role `postgres`. Ce role :

- contourne RLS ;
- possede les tables ;
- a SELECT/INSERT/UPDATE/DELETE sur toutes les tables critiques.

Elles ne permettent donc pas de conclure que les roles applicatifs non bypass pourraient effectuer les memes lectures ou ecritures. En particulier, l'absence de policies peut produire un refus pour des roles soumis a RLS, tandis que `postgres` continue de fonctionner.

Le resultat est une limite de validite des validations vis-a-vis de RLS, pas une preuve que les controles applicatifs sont faux.

## 6. Couche d'autorisation effectivement utilisée par l'application

La lecture statique du code confirme une architecture d'autorisation cote serveur :

### Authentification

`src/lib/auth/user.ts` :

- `createClient()` Supabase server ;
- `supabase.auth.getUser()` ;
- chargement de l'utilisateur correspondant dans `db.orm.public.User` ;
- refus si aucune session ;
- refus si `isActive=false` ;
- `requireAuth()` leve `Unauthorized` ;
- `requireRole()` verifie les roles applicatifs.

### RBAC et reservation

`src/lib/actions/reservation-actions.ts` :

- appelle `requireAuth()` ;
- refuse `LOGISTICIAN` et `SUPERVISOR` pour cette action ;
- impose le `customerId` de session aux clients ;
- derive `publicFormulaOnly` du role serveur, et non d'une decision fiable du navigateur ;
- transmet `performedById` depuis l'utilisateur authentifie.

`src/lib/services/reservation.ts` :

- en contexte public, filtre `Formula` par `availability=true` et `isPublished=true` ;
- recontrole le service parent avec `availability=true` et `isPublished=true` ;
- refuse une formule absente ou non publiee ;
- conserve un chemin interne distinct pour les roles autorises.

`src/lib/public-catalogue.ts` :

- filtre les formules par `availability` et `isPublished` ;
- inclut et controle le service parent ;
- filtre les services par `availability` et `isPublished`.

### Conclusion architecture

**Oui, les controles server-side constituent effectivement la couche d'autorisation metier utilisee par l'application actuelle.**

Prisma fournit ici une connexion privilegiee a la base, mais ne fournit pas la separation d'autorisation utilisateur par RLS. L'application applique Auth/RBAC et les controles de publication dans le code serveur avant les operations metier.

Cette conclusion ne valide pas l'absence de RLS policies pour d'autres roles ; elle constate seulement la couche effectivement utilisee dans le chemin applicatif inspecte.

## 7. Ce que cet audit prouve et ne prouve pas

### Prouve

- role de connexion applicatif actuel : `postgres` ;
- `rolbypassrls=true` ;
- `rolsuper=false` ;
- privileges DML complets sur les 21 tables critiques ;
- RLS active sur ces 21 tables ;
- les validations realisees avec ce role peuvent contourner RLS ;
- Auth/RBAC et la publication sont controles cote serveur dans le code inspecte.

### Non prouve

- role utilise en production ou dans un autre environnement ;
- privileges d'un role Supabase authentifie, anon ou d'un role metier non bypass ;
- existence d'une politique d'autorisation externe au schema local ;
- intention de l'equipe concernant RLS sans policy ;
- equivalence entre la securite applicative Auth/RBAC et une politique RLS PostgreSQL ;
- strategie Prisma sure pour le marqueur pending et les 47 divergences.

Aucun `SET ROLE` n'a ete utilise pour simuler ces roles, conformément au garde-fou du bloc.

## 8. Source de verite et reconciliation Prisma

Les faits combines des Blocs 1.5 et 1.7 sont :

```text
Contrat Prisma courant       = 398bb216...
Marqueur Prisma DB           = 3da8eac...
Migration publication        = pending
Role DATABASE_URL            = postgres
rolbypassrls                 = true
Policies pg_policies         = 0
RLS tables                   = 47
Privileges DML critiques     = 21/21 pour SELECT/INSERT/UPDATE/DELETE
Autorisation metier actuelle = Auth + RBAC + contrôles server-side
```

Cette combinaison explique pourquoi les validations fonctionnent malgré RLS sans policy : elles utilisent un role qui contourne RLS et possede les tables. Elle ne resout pas la question de gouvernance : Prisma ne represente pas cette protection, et la base ne contient aucune policy detaillee a attribuer a l'application.

## 9. Reponses obligatoires

### Existe-t-il suffisamment de preuves pour décider de la stratégie Prisma ?

**Non.** Il existe suffisamment de preuves pour expliquer le succes des validations locales, mais pas pour choisir entre `migrate resolve`, baseline, migration corrective ou autre reconciliation. Il manque notamment une decision humaine sur la gouvernance RLS et sur la source de verite des objets PostgreSQL externes au contrat Prisma.

### `migrate resolve` est-il autorisable maintenant ?

**Non.**

`migrate resolve` alignerait potentiellement le marqueur Prisma, mais :

- il ne modifierait pas les 47 divergences historiques ;
- il ne documenterait pas l'absence de policies ;
- il certifierait un etat observe via un role bypass RLS ;
- il ne prouverait pas que les roles non bypass disposent des acces requis ;
- il ne definirait pas qui est proprietaire de la gouvernance RLS.

Il n'est donc pas autorisable sur la base de cet audit seul.

## 10. Recommandation et verdict

`RECOMMANDATION = NE PAS MODIFIER`

Conserver l'etat actuel et attendre une decision humaine sur :

1. le role attendu pour l'application dans chaque environnement ;
2. la gouvernance de RLS sans policy ;
3. les privileges des roles utilisateurs reels ;
4. la source de verite des objets PostgreSQL hors contrat Prisma ;
5. la strategie de reconciliation du marqueur et des 47 divergences.

Cette recommandation n'applique aucune commande et ne propose pas d'utiliser `migrate resolve` maintenant.

**Verdict : `PRISMA_RECONCILIATION_NEEDS_EVIDENCE`**
