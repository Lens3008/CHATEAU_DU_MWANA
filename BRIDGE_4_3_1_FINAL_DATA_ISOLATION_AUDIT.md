# BRIDGE 4.3.1 — Audit final d’isolation des données de test

## Périmètre et méthode

Audit **read-only** effectué dans `C:\laragon\www\CHATEAU DU MWANA`.

- Aucun fichier de code modifié.
- Aucun commit, push, reset, checkout, revert, clean ou suppression de donnée.
- Seul ce rapport a été créé.
- Recherche statique des chaînes `TEST_`, `testFixtures`, `publicServices`, `public-catalogue` et `Max 0 enf.`.
- Lecture des scripts de validation/création, pages publiques, actions serveur, services et routes API.
- Lecture live en base via `Formula.all()` et `Service.all()` uniquement.

## Verdict

# RISK

Les quatre fixtures sont bien filtrées des trois pages publiques de catalogue avant d'être transmises au rendu, et le `BookingWizard` reçoit actuellement une liste filtrée. Cependant :

1. le filtre est une liste codée en dur de quatre noms, pas une règle générique de publication ;
2. les requêtes publiques chargent d'abord toutes les lignes puis filtrent en mémoire ;
3. l'action serveur de réservation accessible depuis le parcours public accepte un `formulaId` arbitraire et le service métier recharge toutes les formules sans réappliquer le filtre public ;
4. les espaces protégés et services internes continuent de retourner toutes les formules/services, ce qui est attendu pour leurs usages mais confirme que l'isolation n'est pas portée par le repository ou la requête de données.

Le rendu public observé est isolé pour les quatre noms connus, mais la garantie n'est pas robuste face à une nouvelle fixture ou à une soumission directe d'identifiant.

## 1. Origine des fixtures

### `TEST_FORMULA`

Définie et créée dans `validate_phase11.ts:40-58` :

- recherche préalable par `name === 'TEST_FORMULA'` ;
- création via `db.orm.public.Formula.create(...)` si absente ;
- `serviceId` lié au service `TEST_SERVICE` ;
- `price: 15000`, `capacity: 50`, `availability: true`.

Le service parent est créé dans `validate_phase11.ts:42-45` :

- `name: 'TEST_SERVICE'`;
- `basePrice: 10000`;
- `availability: true`.

### `TEST_B3_FORMULA`

Définie et créée dans `validate_phase3_workflows.ts:131-138` :

- recherche préalable par `name === 'TEST_B3_FORMULA'` ;
- création via `db.orm.public.Formula.create(...)` si absente ;
- `serviceId` lié au service `TEST_B3_SERVICE` ;
- `price: 25000`, `capacity: 30`, `availability: true`.

Le service parent est créé dans `validate_phase3_workflows.ts:122-128` :

- `name: 'TEST_B3_SERVICE'`;
- `basePrice: 25000`;
- `availability: true`.

### État live constaté

Lecture non mutante de la base :

| Type | Nom | ID | `availability` | Relation | Prix |
|---|---|---|---:|---|---:|
| Formula | `TEST_FORMULA` | `adb95fbe-259c-46f1-b291-8df4f489368d` | `true` | service `0008a39d-a1d9-44c4-b739-4cd19d58c8f6` | 15000 |
| Formula | `TEST_B3_FORMULA` | `96321241-b3a8-4a78-80c4-32ba07253308` | `true` | service `6e984d01-aec9-4522-9881-98e2866a523b` | 25000 |
| Service | `TEST_SERVICE` | `0008a39d-a1d9-44c4-b739-4cd19d58c8f6` | `true` | catégorie `0b33cdc3-33f0-4521-9743-c1fdbe1cfda8` | 10000 |
| Service | `TEST_B3_SERVICE` | `6e984d01-aec9-4522-9881-98e2866a523b` | `true` | catégorie `91975299-5c53-4f37-b6a0-23ad1adb2f30` | 25000 |

## 2. Nettoyage et scripts connexes

Les scripts suivants contiennent des suppressions ciblées de `TEST_FORMULA` et/ou `TEST_SERVICE` :

- `delete_test_formula.ts`
- `delete_exact_tests.ts`
- `delete_exact_orm.ts`
- `delete_all_tests.ts`
- `delete_tests_final.ts`
- `delete_tests_final2.ts`
- `delete_tests_final3.ts`
- `delete_pg.ts`

Ces scripts ne constituent pas une règle runtime de publication. Aucun n'a été exécuté pendant cet audit.

## 3. Queries, services et repositories pouvant retourner les fixtures

Le projet utilise directement `db.orm.public` ; aucun repository public spécialisé `publicServices` ou `testFixtures` n'a été trouvé.

### Toutes les formules

Les appels suivants peuvent retourner `TEST_FORMULA` et `TEST_B3_FORMULA` :

- `src/app/(public)/reserver/page.tsx:14` — `db.orm.public.Formula.all()`;
- `src/app/dashboard/secretary/page.tsx:32` — toutes les formules, espace protégé ;
- `src/app/dashboard/reservations/page.tsx:40` — toutes les formules, espace protégé ;
- `src/app/admin/reservations/page.tsx:17` — toutes les formules, admin ;
- `src/app/admin/reservations/[id]/page.tsx:55` — toutes les formules, admin ;
- `src/app/admin/reservations/new/page.tsx:18` — toutes les formules, admin ;
- `src/app/(protected)/admin/catalogue/services/[id]/page.tsx` — lecture d'un service/formules associés ;
- `src/lib/services/reservations.ts:61` — toutes les formules, service interne ;
- `src/lib/services/reservation.ts:34-39` — toutes les formules pendant une réservation ;
- `src/lib/services/availability.ts:21-24` — toutes les formules pour disponibilité ;
- `src/lib/services/invoice.ts:74` — toutes les formules pour facturation ;
- `src/lib/services/analytics/reservations.ts:61` — toutes les formules pour analytics.

### Tous les services

Les appels suivants peuvent retourner `TEST_SERVICE` et `TEST_B3_SERVICE` :

- `src/app/(public)/services/page.tsx:51-54` — requête publique de services disponibles, puis filtre nominal ;
- `src/app/dashboard/secretary/page.tsx:31` — tous les services, espace protégé ;
- `src/app/admin/reservations/new/page.tsx:17` — tous les services, admin ;
- `src/app/(protected)/admin/catalogue/page.tsx:11` — tous les services, admin.

## 4. Endpoints/API pouvant les retourner

### Routes HTTP sous `src/app/api`

Une seule route API a été trouvée :

- `src/app/api/auth-test/route.ts:5-65` — vérifie connexion Prisma, session Supabase et rôles ; elle ne lit ni `Formula`, ni `Service`, et ne retourne aucun nom `TEST_*`.

Aucun endpoint API public de catalogue, de services ou de formules n'a été trouvé.

### Actions serveur

`src/lib/actions/reservation-actions.ts:6-52` expose `createReservationAction` comme action serveur utilisée par le parcours de réservation. Elle exige une authentification, puis transmet les données reçues à `createReservation`.

Le champ `formulaId` reçu n'est pas vérifié contre le filtre public. `src/lib/services/reservation.ts:34-39` recharge toutes les formules et sélectionne celle correspondant à `data.formulaId`. Ainsi, un appel direct authentifié avec l'ID de `TEST_FORMULA` ou `TEST_B3_FORMULA` peut potentiellement consommer une fixture, même si elle n'est pas proposée par l'interface publique.

Cette action n'est pas un endpoint de listing et ne renvoie pas actuellement le nom de la formule dans sa réponse de succès, mais elle constitue une voie de consommation publique indirecte insuffisamment isolée.

## 5. Pages publiques pouvant consommer les fixtures

### Accueil — `/`

`src/app/(public)/page.tsx:17-22` :

- requête les formules `availability: true`;
- inclut le service ;
- filtre ensuite avec `isPublicCatalogueTestRecord(f.name)` à la ligne 25 ;
- groupe, trie et limite après filtrage.

Les quatre noms exacts ne sont donc pas rendus sur l'accueil dans l'état actuel.

### Services — `/services`

`src/app/(public)/services/page.tsx:14-21` :

- requête les formules disponibles ;
- filtre les formules avec `isPublicCatalogueTestRecord` à la ligne 24.

`src/app/(public)/services/page.tsx:51-57` :

- requête les services disponibles ;
- filtre les services avec `isPublicCatalogueTestRecord(s.name)` à la ligne 57.

Les quatre noms exacts ne sont donc pas rendus par les cartes publiques de services/formules.

### Réserver — `/reserver`

`src/app/(public)/reserver/page.tsx:14-23` :

- charge toutes les formules ;
- filtre `availability === true` et `!isPublicCatalogueTestRecord(f.name)` ;
- transforme le résultat en `formattedFormulas` ;
- transmet uniquement `formattedFormulas` au `BookingWizardClient` ligne 58.

Le `BookingWizard` ne reçoit donc pas les quatre fixtures par le chemin normal de rendu serveur.

### Autres pages publiques

Les pages publiques `/presentation`, `/gallery`, `/contact` et `/page/[slug]` ne requêtent pas `Formula` ou `Service` dans les recherches effectuées. Elles ne constituent pas une voie identifiée d'exposition de ces fixtures.

## 6. Où le filtrage public est appliqué

Le filtre est centralisé dans :

`src/lib/public-catalogue.ts:1-10`

```ts
const PUBLIC_TEST_RECORD_NAMES = new Set([
  'TEST_FORMULA',
  'TEST_B3_FORMULA',
  'TEST_SERVICE',
  'TEST_B3_SERVICE',
]);
```

Il est appelé uniquement dans :

- `src/app/(public)/page.tsx:25` ;
- `src/app/(public)/services/page.tsx:24` ;
- `src/app/(public)/services/page.tsx:57` ;
- `src/app/(public)/reserver/page.tsx:14`.

Le filtre est donc appliqué dans les pages, après chargement ORM, et non dans une requête/repository partagé.

## 7. Données reçues par le BookingWizard

Chemin nominal :

1. `/reserver` appelle `Formula.all()`.
2. `/reserver` exclut `availability !== true`.
3. `/reserver` exclut les quatre noms via `isPublicCatalogueTestRecord`.
4. `/reserver` projette les champs vers `formattedFormulas`.
5. `BookingWizardClient` reçoit `formulas={formattedFormulas}`.

Conclusion : le `BookingWizard` reçoit uniquement les données publiques filtrées lors du rendu normal.

Limite : `createReservationAction` reçoit depuis le client un `formulaId` libre et le backend recharge toutes les formules. Le payload de l'interface est filtré, mais la consommation métier n'applique pas la même isolation.

## 8. Autre endpoint public exposant `TEST_*`

Résultat de recherche :

- aucun endpoint HTTP public de catalogue trouvé ;
- `/api/auth-test` ne retourne pas de formules/services ;
- aucune occurrence de `testFixtures` ou `publicServices` trouvée ;
- aucune occurrence runtime de `Max 0 enf.` trouvée dans `src` après la correction ; les occurrences restantes sont dans les rapports historiques et le présent audit.

Risque indirect identifié : l'action serveur authentifiée `createReservationAction` accepte un identifiant de formule qui peut référencer une fixture, sans contrôle public générique dans l'action ou le service.

## 9. Nature de la règle d'isolation

L'isolation actuelle repose **uniquement sur une liste codée en dur des quatre noms** dans `PUBLIC_TEST_RECORD_NAMES`.

Elle ne repose pas sur :

- un champ `isPublished` ou `public`;
- une requête repository `publicServices`;
- une règle ORM centralisée ;
- une exclusion générique `TEST_*`;
- un statut de publication séparé de `availability`.

`availability: true` est suffisant pour qu'une fixture entre dans les résultats bruts des pages publiques avant le filtrage nominal.

Conséquence : un nouvel enregistrement de test différent de ces quatre noms pourrait être rendu publiquement s'il est `availability: true` et consommé par une page qui n'ajoute pas explicitement le filtre.

## Conclusion

**RISK**

La séparation d'affichage des quatre fixtures demandées fonctionne actuellement sur `/`, `/services` et `/reserver`, et le `BookingWizard` ne reçoit pas ces lignes par le chemin normal. Toutefois, l'isolation n'est pas une garantie de publication générique : elle est nominale, post-query et limitée à quatre chaînes. Les requêtes internes/protégées retournent toutes les lignes, et l'action serveur de réservation permet potentiellement la consommation directe d'une fixture par identifiant.

Ce rapport n'apporte aucune correction ; toute remédiation éventuelle est hors de cette étape read-only.
