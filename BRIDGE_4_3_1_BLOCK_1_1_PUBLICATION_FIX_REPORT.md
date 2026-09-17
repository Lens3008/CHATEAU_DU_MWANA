# BRIDGE 4.3.1 — Bloc 1.1 — Correction de publication publique

## Verdict

**PARTIAL**

La règle de publication est maintenant explicite et le contournement public par `formulaId` est bloqué dans le code et vérifié par un test ciblé. La migration formelle Prisma n'a pas pu terminer sa vérification à cause de 47 écarts historiques déjà présents dans le schéma local ; une application SQL strictement limitée à cette migration a été exécutée localement pour permettre la validation runtime. Le statut de migration devra être reconcilié séparément sur un environnement sans drift.

Le verdict n'est pas `PASS` car `npx prisma db migrate --yes` n'a pas validé le schéma local, et `npm run lint -- --quiet` reste en échec sur des erreurs globales préexistantes. Les contrôles fonctionnels propres à l'isolation de publication sont, eux, passants.

## 0. État Git et garde-fous

Le travail a été effectué dans :

```text
C:\laragon\www\CHATEAU DU MWANA
```

Le checkout était déjà fortement modifié avant Bloc 1.1. Les modifications préexistantes ont été conservées. Aucun `git reset`, `checkout`, `restore`, `revert`, `clean`, commit, push ou merge n'a été effectué.

État suivi initial pertinent :

```text
## master
 M .gitignore
 M next.config.ts
 M package-lock.json
 M package.json
 D src/app/favicon.ico
 M src/app/globals.css
 M src/app/layout.tsx
 D src/app/page.tsx
 M tsconfig.json
```

Les nombreux fichiers `??` déjà présents, notamment `prisma/`, `migrations/`, `src/app/(public)/`, `src/components/` et les scripts de validation, ont été préservés.

## 1. État initial

- `Service` et `Formula` ne possédaient aucun champ de publication.
- Le catalogue public filtrait quatre noms de test via une blacklist.
- Les pages publiques chargeaient des collections larges avant filtrage mémoire.
- `createReservationAction` transmettait un `formulaId` client au service métier.
- `createReservation` rechargeait toutes les formules sans contexte public/interne.
- Les fixtures suivantes existaient et étaient `availability: true` :
  `TEST_FORMULA`, `TEST_B3_FORMULA`, `TEST_SERVICE`, `TEST_B3_SERVICE`.

## 2. Diagnostic

`availability` représente la disponibilité opérationnelle et ne peut pas porter l'autorisation de publication. La blacklist de noms ne protège pas une nouvelle donnée interne et ne couvre pas la sélection directe par UUID.

Inspection du contrat avant modification :

- `Service` possédait `availability`, mais aucun champ de publication.
- `Formula` possédait `availability`, mais aucun champ de publication.
- `Formula` est reliée à `Service` par `serviceId`.
- Le contrat est `prisma/schema.prisma`, émis vers `prisma/schema.json` et `prisma/schema.d.ts`.
- Les migrations existantes sont sous `migrations/app/`.

Origine des fixtures :

| Fixture | Définition/création | Valeurs initiales |
|---|---|---|
| `TEST_SERVICE` | `validate_phase11.ts:42-45` | `availability: true`, `basePrice: 10000` |
| `TEST_FORMULA` | `validate_phase11.ts:48-58` | `availability: true`, `price: 15000`, `capacity: 50` |
| `TEST_B3_SERVICE` | `validate_phase3_workflows.ts:122-128` | `availability: true`, `basePrice: 25000` |
| `TEST_B3_FORMULA` | `validate_phase3_workflows.ts:131-138` | `availability: true`, `price: 25000`, `capacity: 30` |

Lecture live avant backfill : les quatre lignes existaient effectivement en base et avaient `availability: true`.

## 3. Décision d'architecture

La publication est portée aux deux niveaux du catalogue :

- `Service.isPublished`
- `Formula.isPublished`

Les deux champs sont `Boolean @default(false)`. Une formule est publiquement lisible/utilisable seulement si elle-même et son service sont à la fois `availability: true` et `isPublished: true`.

La migration backfill les enregistrements existants comme publiés pour préserver les offres commerciales déjà visibles, puis maintient explicitement les quatre fixtures privées. Les fixtures ne sont pas supprimées et les scripts de validation restent inchangés.

## 4. Fichiers modifiés

- `prisma/schema.prisma` — ajout de `isPublished` à `Service` et `Formula`.
- `prisma/schema.json` et `prisma/schema.d.ts` — artefacts régénérés par `npx prisma contract emit`.
- `src/lib/public-catalogue.ts` — lectures publiques centralisées et filtrées au niveau de la requête.
- `src/app/(public)/page.tsx` — usage de `getPublicFormulas()`.
- `src/app/(public)/services/page.tsx` — usage des lectures publiques de formules/services.
- `src/app/(public)/reserver/page.tsx` — transmission au wizard uniquement des formules publiques.
- `src/lib/actions/reservation-actions.ts` — contexte `publicFormulaOnly` forcé côté serveur pour les clients.
- `src/lib/services/reservation.ts` — revalidation publication/disponibilité côté service pour le contexte client.
- `src/lib/services/finance.ts` — correction de compatibilité de type révélée par la régénération du contrat.
- `migrations/app/20260915T1057_add_publication_flags/` — migration additive et backfill ciblé.
- `validate_publication_isolation.ts` — validations read-only ciblées.
- `BRIDGE_4_3_1_BLOCK_1_1_PUBLICATION_FIX_REPORT.md` — présent rapport.

Les scripts `validate_phase11.ts`, `validate_phase3_workflows.ts` et les scripts de suppression existants n'ont pas été supprimés ni réécrits.

## 5. Règle de publication retenue

```text
Public Formula =
  Formula.availability == true
  AND Formula.isPublished == true
  AND Service.availability == true
  AND Service.isPublished == true
```

La règle est indépendante des noms `TEST_*` et de la seule disponibilité opérationnelle.

## 6. Comportement public

- `/` utilise `getPublicFormulas()`.
- `/services` utilise `getPublicFormulas()` et `getPublicServices()`.
- `/reserver` utilise `getPublicFormulas()` et transmet le résultat au `BookingWizardClient`.
- Les requêtes ORM publiques portent déjà `availability: true, isPublished: true`.
- Le service parent est contrôlé avant exposition.
- `getPublicFormulaById()` renvoie `null` pour une formule non publiée.

Les quatre fixtures ne sont pas visibles dans les pages publiques et ne sont plus nécessaires dans une blacklist runtime.

Consommateurs publics vérifiés :

| Surface | Lecture | Protection |
|---|---|---|
| `/` | `getPublicFormulas()` | formule + service disponibles et publiés |
| `/services` | `getPublicFormulas()` + `getPublicServices()` | même règle |
| `/reserver` | `getPublicFormulas()` | payload transmis au wizard déjà filtré |
| `BookingWizardClient` | prop `formulas` | aucune lecture DB côté client |
| `getPublicFormulaById()` | recherche publique par UUID | renvoie `null` si formule/service non publiés |

La recherche des routes sous `src/app/api` n'a trouvé que `/api/auth-test`. Cette route ne lit ni `Formula` ni `Service` et ne retourne aucun catalogue.

## 7. Comportement interne

Les lectures administratives, dashboards et services internes continuent d'utiliser leurs collections complètes. Les fixtures restent donc accessibles aux tests internes et aux workflows autorisés. Aucun rôle RBAC n'a été modifié.

Les consommateurs internes identifiés (`admin`, dashboards, analytics, availability, invoice et services de réservation) conservent leurs appels `.all()` afin de ne pas changer leurs permissions métier.

## 8. Protection de `createReservationAction`

`createReservationAction` détermine le contexte depuis la session :

- `CLIENT` → `publicFormulaOnly: true`, quelle que soit la valeur fournie dans le payload ;
- rôles internes déjà autorisés → `publicFormulaOnly: false`, conservation de leur accès métier ;
- `LOGISTICIAN` et `SUPERVISOR` restent refusés comme avant.

Dans `createReservation`, le contexte public sélectionne uniquement une formule disponible et publiée, puis vérifie également le service parent. Un UUID de fixture connu ne peut donc pas contourner la publication.

Le champ `publicFormulaOnly` n'est pas accepté comme décision venant du navigateur : `reservation-actions.ts` le fixe à partir de `user.role`. Un client ne peut donc pas envoyer `false` pour obtenir le chemin interne.

Le chemin interne conserve la possibilité de sélectionner une formule complète pour les rôles déjà autorisés. Cette distinction est intentionnelle pour ne pas casser les tests et opérations administratives.

## 8 bis. Données et état après application locale

La migration formelle a planifié :

```text
ALTER TABLE "public"."formula" ADD COLUMN "isPublished" bool DEFAULT false NOT NULL
ALTER TABLE "public"."service" ADD COLUMN "isPublished" bool DEFAULT false NOT NULL
```

Après l'application ciblée locale, lecture live :

```text
TEST_FORMULA      availability=true  isPublished=false
TEST_B3_FORMULA   availability=true  isPublished=false
TEST_SERVICE      availability=true  isPublished=false
TEST_B3_SERVICE   availability=true  isPublished=false

Formules disponibles et publiées : 26
Services disponibles et publiés : 17
```

Aucune fixture n'a été supprimée, renommée ou recréée.

## 9. Tests exécutés

### Commandes

```text
npx prisma contract emit
npx prisma migration plan --from 3da8eac623684af82c16039df326d8ff7b2ad0cb5eaa780663d86f6c75de77f0 --name add_publication_flags
node migrations/app/20260915T1057_add_publication_flags/migration.ts
npx tsc --noEmit
npm run build
npm run lint -- --quiet
npx tsx validate_publication_isolation.ts
```

### Résultats

- Contract emit : **PASS**, hash `398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60`.
- Migration plan : **PASS**, 2 colonnes additives + backfill de publication.
- Self-emit migration : **PASS**, `ops.json` et `migration.json` générés.
- TypeScript : **PASS**.
- Build : **PASS**, 45 routes générées.
- Validation ciblée : **PASS** :
  - formule disponible/publiée visible ;
  - formules/services non publiés exclus ;
  - fixtures internes conservées et `isPublished: false` ;
  - lookup public par UUID de fixture renvoie `null` ;
  - réservation publique directe par UUID de fixture refusée.
- Lint : **FAIL global préexistant**, notamment `@typescript-eslint/no-explicit-any` dans des scripts et fichiers hors périmètre ; aucun nettoyage global n'a été entrepris.
- Validation navigateur Chromium réelle :
  - `/`, `/services`, `/reserver` à 375, 768 et 1440 px ;
  - aucun `TEST_*` visible ;
  - `scrollWidth === innerWidth` aux trois largeurs.

## 9 bis. Matrice des exigences obligatoires

| # | Exigence | Résultat | Preuve |
|---:|---|---|---|
| 1 | Une formule publiée et disponible apparaît | PASS | `validate_publication_isolation.ts` |
| 2 | Une formule non publiée n'apparaît pas | PASS | `getPublicFormulas()` + pages publiques |
| 3 | Un service non publié n'apparaît pas | PASS | `getPublicServices()` |
| 4 | Les deux fixtures de formule restent utilisables en interne | PASS | accès interne conservé ; flags privés |
| 5 | Un client ne réserve pas une formule non publiée par UUID | PASS | `publicFormulaOnly` + test direct service |
| 6 | Un client ne contourne pas l'action serveur | PASS | contexte forcé depuis session dans `reservation-actions.ts` |
| 7 | Les rôles internes conservent leurs permissions | PARTIAL | code inchangé côté RBAC ; tests métier complets non rejoués |
| 8 | Les réservations normales fonctionnent | PARTIAL | build/typecheck et chemin de service ; test de réservation métier complet non mutateur |
| 9 | Les données réelles publiables restent visibles | PASS | backfill true, 26 formules et 17 services publiés |
| 10 | Aucune suppression de fixture nécessaire | PASS | quatre lignes toujours présentes en base |

## 10. Migration et limites

`npx prisma db migrate --yes` a été lancé mais a été bloqué par `MIGRATION.RUNNER_FAILED` : le schéma local présente 47 écarts historiques au contrat lors de la vérification finale. La migration n'a pas été considérée comme appliquée par le runner.

Pour valider le comportement local sans corriger ces écarts hors périmètre, les deux `ALTER TABLE` et les quatre mises à jour de publication présentes dans la migration ont été exécutés dans une transaction SQL ciblée. Aucun enregistrement n'a été supprimé, recréé ou nettoyé.

La réconciliation du marker Prisma et des 47 écarts historiques reste hors périmètre Bloc 1.1. Le lint global demeure sujet aux erreurs préexistantes et aux warnings Next.js existants.

La cause du blocage est structurelle : le runner Prisma vérifie le contrat complet et signale 47 différences historiques, indépendantes des deux nouveaux champs. Il ne s'agit pas d'un échec de la règle de publication elle-même.

Le script `validate_publication_isolation.ts` ne supprime ni ne crée de fixture. Il lit les collections publiques, vérifie les flags et tente une réservation publique avec un UUID connu ; l'échec attendu est `Formule introuvable.`.

## 11. Hors périmètre

- Pas de changement RBAC, RLS, Auth, prix, facturation, paiements, allocations ou capacité métier.
- Pas de suppression de fixture.
- Pas de refonte générale du catalogue.
- Pas de Bridge 4.4.

## 12. Conclusion opérationnelle

La correction élimine le contournement identifié au niveau du code applicatif : un client authentifié ne peut plus sélectionner une formule non publiée uniquement parce qu'il connaît son UUID. Les pages publiques et le wizard utilisent une règle de publication explicite et les fixtures restent disponibles pour les usages internes.

Le statut final reste **PARTIAL**, car la migration Prisma formelle doit encore être réconciliée avec le drift historique du checkout et le lint global n'est pas vert. Aucun autre sujet ne bloque la logique d'isolation de publication validée dans ce Bloc 1.1.
