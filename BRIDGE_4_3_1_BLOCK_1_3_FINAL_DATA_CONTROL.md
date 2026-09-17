# BRIDGE 4.3.1 — Bloc 1.3 — Controle final des donnees de publication

## 1. Date et projet

- Date/heure du controle : `2026-09-15T12:27:10.5220072+01:00`
- Projet controle : `C:\laragon\www\CHATEAU DU MWANA`
- Source : base locale configuree par `DATABASE_URL`

## 2. Mode de controle

**READ-ONLY uniquement.**

Les donnees ont ete lues via l'ORM Prisma Postgres existant, avec `Formula.all()` et `Service.all()`. Les lignes ont ete croisees en memoire pour produire les comptes, les listes et les anomalies.

Aucune operation d'ecriture n'a ete appelee : pas d'INSERT, UPDATE, DELETE, ALTER, CREATE, DROP, TRUNCATE, migrate, seed ou reset. Aucun script `validate_phase11.ts`, `validate_phase3_workflows.ts` ou `delete_*` n'a ete execute. Aucun fichier de code, schema, migration ou fixture n'a ete modifie.

## 3. Etat des quatre fixtures

Les quatre fixtures attendues existent en base et sont privees.

| Type | Nom | ID | availability | isPublished | Relation pertinente | Existence |
| --- | --- | --- | ---: | ---: | --- | --- |
| Formula | `TEST_FORMULA` | `adb95fbe-259c-46f1-b291-8df4f489368d` | `true` | `false` | service `TEST_SERVICE` (`0008a39d-a1d9-44c4-b739-4cd19d58c8f6`), parent `true/false` | oui |
| Formula | `TEST_B3_FORMULA` | `96321241-b3a8-4a78-80c4-32ba07253308` | `true` | `false` | service `TEST_B3_SERVICE` (`6e984d01-aec9-4522-9881-98e2866a523b`), parent `true/false` | oui |
| Service | `TEST_SERVICE` | `0008a39d-a1d9-44c4-b739-4cd19d58c8f6` | `true` | `false` | 1 formule liee | oui |
| Service | `TEST_B3_SERVICE` | `6e984d01-aec9-4522-9881-98e2866a523b` | `true` | `false` | 1 formule liee | oui |

Verification explicite :

- `TEST_FORMULA` : conforme, `availability=true` et `isPublished=false`.
- `TEST_B3_FORMULA` : conforme, `availability=true` et `isPublished=false`.
- `TEST_SERVICE` : conforme, `availability=true` et `isPublished=false`.
- `TEST_B3_SERVICE` : conforme, `availability=true` et `isPublished=false`.

Les prix et capacites des fixtures sont restes inchanges dans la lecture : `TEST_FORMULA` = `15000`, capacite `50` ; `TEST_B3_FORMULA` = `25000`, capacite `30`.

## 4. Comptages Formula

| Mesure | Resultat |
| --- | ---: |
| Nombre total de `Formula` | **28** |
| `availability=true` et `isPublished=true` | **26** |
| `availability=true` et `isPublished=false` | **2** |

Les deux formules disponibles mais privees sont exactement les deux fixtures `TEST_FORMULA` et `TEST_B3_FORMULA`.

## 5. Comptages Service

| Mesure | Resultat |
| --- | ---: |
| Nombre total de `Service` | **19** |
| `availability=true` et `isPublished=true` | **17** |
| `availability=true` et `isPublished=false` | **2** |

Les deux services disponibles mais prives sont exactement `TEST_SERVICE` et `TEST_B3_SERVICE`.

## 6. Formules actuellement publiques

La liste ci-dessous correspond aux formules avec `availability=true`, `isPublished=true`, dont le service parent est lui aussi disponible et publie. Tous les parents de cette liste ont `availability=true` et `isPublished=true`.

| Nom | Prix | Capacite | Service parent | availability | isPublished |
| --- | ---: | ---: | --- | ---: | ---: |
| `Anniversaire 3 - 30 élèves` | 150000 | 30 | `Anniversaire 3` | true | true |
| `Anniversaire 3 - 20 élèves` | 120000 | 20 | `Anniversaire 3` | true | true |
| `Anniversaire 3 - 25 élèves` | 135000 | 25 | `Anniversaire 3` | true | true |
| `Anniversaire 3 - 35 élèves` | 165000 | 35 | `Anniversaire 3` | true | true |
| `Château à obstacle` | 80000 | 0 | `Château à obstacle` | true | true |
| `Combo Keva` | 190000 | 40 | `Combo Keva` | true | true |
| `Combo Kermesse K1` | 50000 | 0 | `Combo Kermesse K1` | true | true |
| `Combo Kermesse K2` | 75000 | 0 | `Combo Kermesse K2` | true | true |
| `Anniversaire 1 - 20 élèves` | 65000 | 20 | `Anniversaire 1` | true | true |
| `Trampoline 2.5` | 40000 | 0 | `Trampoline 2.5` | true | true |
| `Trampoline 3.6` | 60000 | 0 | `Trampoline 3.6` | true | true |
| `Trampoline 4.5 m` | 80000 | 0 | `Trampoline 4.5 m` | true | true |
| `Château Puppy` | 50000 | 0 | `Château Puppy` | true | true |
| `Château Family` | 80000 | 0 | `Château Family` | true | true |
| `Barbe à papa / Popcorn` | 35000 | 0 | `Barbe à papa / Popcorn` | true | true |
| `Combo Mini` | 60000 | 20 | `Combo Mini` | true | true |
| `Combo Kymou` | 90000 | 30 | `Combo Kymou` | true | true |
| `Combo Medi` | 110000 | 30 | `Combo Medi` | true | true |
| `Combo Family` | 150000 | 30 | `Combo Family` | true | true |
| `Anniversaire 1 - 25 élèves` | 75000 | 25 | `Anniversaire 1` | true | true |
| `Anniversaire 1 - 30 élèves` | 85000 | 30 | `Anniversaire 1` | true | true |
| `Anniversaire 1 - 35 élèves` | 95000 | 35 | `Anniversaire 1` | true | true |
| `Anniversaire 2 - 20 élèves` | 95000 | 20 | `Anniversaire 2` | true | true |
| `Anniversaire 2 - 25 élèves` | 110000 | 25 | `Anniversaire 2` | true | true |
| `Anniversaire 2 - 30 élèves` | 130000 | 30 | `Anniversaire 2` | true | true |
| `Anniversaire 2 - 35 élèves` | 140000 | 35 | `Anniversaire 2` | true | true |

## 7. Services actuellement publics

Tous les services ci-dessous ont `availability=true` et `isPublished=true`.

| Nom | ID | Nombre de formules liees |
| --- | --- | ---: |
| `Anniversaire 1` | `e6aa359c-8b0b-4b6b-aa87-56da0f0923c1` | 4 |
| `Anniversaire 2` | `70d757e2-00d8-47e3-abfd-e943681ead87` | 4 |
| `Anniversaire 3` | `96589212-08d2-450f-9119-c4bdecc1cd01` | 4 |
| `Trampoline 2.5` | `d77b86df-f9ad-4235-8747-8325479de883` | 1 |
| `Trampoline 4.5 m` | `65b877a5-c028-44af-94ab-5855d8edc84f` | 1 |
| `Combo Family` | `6e0456b6-10f8-40f7-a50a-0a4424a6957b` | 1 |
| `Combo Keva` | `f64cbb07-1ff7-44b8-a506-47d844d9c1c9` | 1 |
| `Combo Kermesse K1` | `258a5a55-726b-4015-85ca-da0b0d9ab2af` | 1 |
| `Château Puppy` | `6e480cd6-3ca2-412a-a428-ea00f5e7739d` | 1 |
| `Château Family` | `960cfbdc-c7ae-42bb-83b8-9db0e72fed52` | 1 |
| `Château à obstacle` | `1374c916-f4b2-442f-a769-262b6c53c423` | 1 |
| `Barbe à papa / Popcorn` | `b5b46eae-1a0f-4bc9-bf96-799b2c916989` | 1 |
| `Combo Mini` | `23db305c-3d8f-48fb-bdc1-f06a487cd7c2` | 1 |
| `Combo Kymou` | `9bb98765-42ee-429d-a683-657075faa4a1` | 1 |
| `Combo Medi` | `7597daac-4db7-4f80-919d-d875b584fea8` | 1 |
| `Combo Kermesse K2` | `1e190c70-9b4a-45fd-9c1d-269a3f46266d` | 1 |
| `Trampoline 3.6` | `ed996747-f0fc-4d20-a5da-93ee36aa849f` | 1 |

Aucun service public n'est sans formule liee.

## 8. Recherche de fixtures supplementaires

La recherche read-only des noms contenant `TEST`, `test` ou commencant par `TEST_` retourne exactement quatre lignes :

| Type | Nom | availability | isPublished |
| --- | --- | ---: | ---: |
| Formula | `TEST_FORMULA` | true | false |
| Formula | `TEST_B3_FORMULA` | true | false |
| Service | `TEST_SERVICE` | true | false |
| Service | `TEST_B3_SERVICE` | true | false |

Aucune fixture `TEST_*` supplementaire n'a ete detectee. Un nom commercial ordinaire n'a pas ete classe comme fixture sans indice textuel.

## 9. Coherence Formula / Service

Les trois controles demandes sont sans anomalie :

- Formula `availability=true`, `isPublished=true` avec parent indisponible ou prive : **0**.
- Formula `availability=true`, `isPublished=false` avec parent disponible et publie : **0**.
- Service `availability=true`, `isPublished=true` sans formule correspondante : **0**.

Les deux formules privees ont au contraire des parents prives, ce qui est coherent avec les fixtures :

- `TEST_FORMULA` -> `TEST_SERVICE`, parent `true/false` ;
- `TEST_B3_FORMULA` -> `TEST_B3_SERVICE`, parent `true/false`.

## 10. Verification de la regle publique

La logique actuelle de `src/lib/public-catalogue.ts` applique :

```text
Formula.availability = true
AND Formula.isPublished = true
AND Service.availability = true
AND Service.isPublished = true
```

Precisely :

- `getPublicFormulas()` filtre d'abord `Formula` sur `availability=true` et `isPublished=true`, inclut le service, puis conserve uniquement les formules dont le parent est `availability=true` et `isPublished=true` ;
- `getPublicServices()` filtre `Service` sur `availability=true` et `isPublished=true` ;
- la lecture ORM donne 26 formules conformes a la regle complete et 17 services conformes ;
- ces comptes correspondent aux collections actuellement utilisees par la logique publique ;
- les quatre fixtures sont exclues par `isPublished=false`, sans blacklist de nom necessaire pour cette regle.

Le controle direct de coherence confirme que la jointure Formula -> Service ne retire aucune formule publique et qu'aucun service public n'est orphelin de formule.

Le statut Prisma n'est pas re-evalue ni modifie ici. Ce rapport porte uniquement sur les valeurs de donnees.

## 11. Conclusion et verdict

Les donnees lues sont coherentes avec le modele de publication attendu :

- les quatre fixtures existent mais restent privees ;
- les 26 formules commerciales disponibles et publiees restent publiques ;
- les 17 services commerciaux disponibles et publies restent publics ;
- aucune fixture supplementaire suspecte n'a ete detectee ;
- aucune anomalie critique Formula <-> Service n'a ete trouvee ;
- les comptes correspondent a la regle de `src/lib/public-catalogue.ts`.

**Verdict : `DATA_SAFE`**

Ce verdict concerne exclusivement la securite des donnees de publication. Il ne modifie ni ne resout le statut Prisma pending documente au Bloc 1.2.
