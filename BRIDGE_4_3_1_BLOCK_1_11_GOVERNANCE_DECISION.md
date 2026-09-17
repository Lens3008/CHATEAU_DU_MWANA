# BRIDGE 4.3.1 — Bloc 1.11 — Decision de gouvernance et plan d'execution verifiable

## 1. Objet

Ce document formalise la traduction technique des decisions deja arretees dans les blocs 1.8 a 1.10.

Il ne modifie ni la base, ni le schema, ni la migration, ni les politiques, ni le code applicatif.

Il ne fait qu'exprimer, de maniere structurée et verifiable, le plan d'execution cible a appliquer ulterieurement, selon une procedure de validation humaine et technique.

## 2. Cadre de decision

Les decisions de gouvernance retenues sont les suivantes :

1. Prisma = autorite du contrat applicatif.
2. PostgreSQL/Supabase = autorite RLS / roles / privileges.
3. Supabase Auth = identite.
4. RBAC serveur = autorisation metier.
5. RLS conserve provisoirement.
6. `postgres` = role de maintenance/dev, pas cible runtime.
7. role runtime dédié non-bypass = cible.
8. aucune correction massive des 47 differences.
9. comparaison FK exhaustive avant eventuelle correction.
10. procedure de reconciliation de `add_publication_flags`.
11. strategie Dev -> Staging -> Production.
12. ordre exact des futures operations.
13. points necessitant encore une preuve technique.
14. conditions de rollback.

## 3. Principe directeur

> Nous ne cherchons plus a "faire disparaitre les 47 differences". Nous cherchons a rendre l'etat reel, Prisma et la gouvernance volontairement coherents.

Cette declaration impose une architecture claire :

- le contrat applicatif est le domaine Prisma ;
- la securite et l'execution reelle sont adresses par PostgreSQL/Supabase ;
- la gestion identite est externe, via Supabase Auth ;
- l'autorisation metier est appliquee par le code serveur dont les regles de role et publication font partie du systeme applicatif.

Aucune de ces couches n'est substituable a l'autre.

## 4. Traduction technique des decisions

### 4.1 Prisma = autorite du contrat applicatif

#### Raison — Prisma

Prisma exprime le mode de pensee du systeme d'information :

- modeles ;
- relations ;
- types ;
- enums ;
- defaults applicatifs ;
- structure logique du domaine.

#### Traduction technique — Prisma

- `prisma/schema.prisma` reste l'artefact de reference applicative pour le contrat.
- les migrations Prisma restent le canal d'edition du schema applicatif, dans la mesure ou le projet decide de les utiliser comme source de gouvernance de type de donnees.
- les differences Purement representationnelles ou de nommage ne doivent pas etre traitees comme des anomalies fonctionnelles sans preuve.
- les corrections doivent viser les cas ou l'equivalence fonctionnelle est prouvee fausse.

#### Limites de la responsabilité Prisma

- Prisma n'est pas l'autorite de la securite ;
- Prisma ne gouverne pas le RLS ;
- Prisma ne remplace pas les roles PostgreSQL ni les privileges effectifs.

### 4.2 PostgreSQL/Supabase = autorite RLS / roles / privileges

#### Raison — PostgreSQL/Supabase

RLS, ownership, grants, roles et policies sont des objets physiques et d'execution de la base. Ils ne peuvent pas etre deduits de maniere fiable a partir d'un modele applicatif seul.

#### Traduction technique — PostgreSQL/Supabase

- `pg_class`, `pg_roles`, `pg_policies`, `pg_constraint`, `information_schema` restent la source de verite pour :
  - activation RLS ;
  - existence de policies ;
  - privileges effectifs ;
  - owners et roles ;
  - contraintes physiques ;
  - defaults physiques ;
  - behaviour reels de la base.

#### Exemple concret — PostgreSQL/Supabase

- RLS active sur 47 tables publiques ;
- 0 policy dans `pg_policies` ;
- role `postgres` with `rolbypassrls=true` ;
- role runtime cible non-bypass a definir plus tard.

### 4.3 Supabase Auth = identite

#### Raison — Supabase Auth

L'identite du user est determinee en amont de l'acces metier. Elle n'est pas la même chose que la securite de la base.

#### Traduction technique — Supabase Auth

- Supabase Auth est la couche de login / session / token / utilisateur authentifie.
- Elle produit l'identite de l'utilisateur connecte.
- Elle n'impose pas, par elle-meme, la politique SQL de chaque table.
- Elle ne remplace ni la gouvernance RLS ni les privileges PostgreSQL.

#### Exigence de gouvernance — Auth

- les sessions applicatives doivent etre classees et testes par role ou par niveau d'emprunt selon l'architecture cible ;
- l'authentification ne doit pas masquer la difference entre identite et permission de donnees.

### 4.4 RBAC serveur = autorisation metier

#### Raison — RBAC serveur

Les regles de business validant l'acces a un service, une reservation, une publication ou une ressource sont appliquees dans le code serveur.

#### Traduction technique — RBAC serveur

- `requireAuth` / `requireRole` / validation applicative / filtres de publication restent un niveau de controle application.
- il s'agit d'un controle de permission fonctionnelle, pas d'une substitution a la police de base.
- le controle metier sert a prouver qu'une action est autorisee par la logique applicative, mais pas a modifier la source de verite RLS.

#### Consequence metier — RBAC

- le code serveur peut autoriser ou refuser une action sans que cela remplace la politique PostgreSQL ;
- le code serveur et la base doivent rester coherents, et leur roles de controle ne doivent pas etre confondus.

### 4.5 RLS conserve provisoirement

#### Decision — RLS conservé

RLS est conserve tel qu'il est actuellement, sans suppression automatique, tant qu'une politique explicitement versionnee et approuvee n'est pas en place.

#### Traduction technique — RLS conservé

- ne pas activer le mode "suppression de toute securite pour aligner le schema" ;
- ne pas creer de politique ad hoc sans decision utilisee ;
- ne pas deactiver RLS tant que la justification explicite n'est pas documentee.

#### Pourquoi conserver le RLS

- l'absence de policy n'implique pas une securite nulle ;
- mais elle ne permet pas non plus de conclure a une application seguraisee pour les roles non-bypass ;
- le conservatoire de l'etat actuel est donc une decision prudente de transition, pas une validation finale.

### 4.6 `postgres` = role de maintenance/dev, pas cible runtime

#### Decision — rôle postgres

Le role `postgres` ne doit pas etre la cible des services applicatifs en production ni en runtime autorise.

#### Traduction technique — rôle postgres

- `postgres` reste un role d'operations / maintenance / dev / triage / migration ;
- la connexion de l'application doit etre remplacee par un role dedie non-bypass ;
- le role runtime doit etre minimal, documente et teste pour :
  - select ;
  - insert ;
  - update ;
  - delete ;
  - sequences et objets utiles ;
  - privileges de lecture/edition requis seulement.

#### Exigence de preuve — rôle runtime

Il faut prouver :

- que le role runtime cible n'applique pas RLS bypass ;
- qu'il a les privileges strictement requis ;
- qu'il fonctionne dans Dev et Staging avant production.

### 4.7 role runtime dedie non-bypass = cible

#### Decision — rôle runtime cible

La cible est un role runtime unique, dedie a l'application, non-bypass, minimal et verifiable.

#### Traduction technique — rôle runtime cible

- definir un role applicatif distinct du role de maintenance ;
- activer les privileges requis exactement pour le runtime ;
- tester le comportement sous RLS ;
- garantir que l'application ne s'appuie plus sur `postgres` pour valider ses operations.

#### Principes — rôle runtime cible

- le role applicatif ne doit pas etre un "super role" ;
- les policies ou privileges doivent etre compatibles avec la philosophie server-side RBAC ;
- la validation fonctionnelle doit utiliser un role de type runtime et non un role bypass.

## 5. Decision sur les 47 differences

### 5.1 Aucune correction massive

#### Decision — 47 différences

Les 47 differences ne doivent pas etre corrigees d'un trait de plume.

#### Traduction technique — 47 différences

- ne pas lancer un script de normalisation globale ;
- ne pas appliquer d'ALTER massifs sur les relations ;
- ne pas convertir d'un seul coup toutes les contraintes ou tous les noms.

#### Raison — 47 différences

La plupart des differences sont de nature :

- nominale ;
- representationnelle ;
- historique ;
- issue de la normalisation PostgreSQL des enum / checks / contraintes.

Seules les differences dont l'equivalence fonctionnelle est prouvee comme incorrecte doivent etre corrigees.

### 5.2 Comparaison FK exhaustive avant correction eventuelle

#### Decision — FK

Aucune correction FK ne doit etre appliquee sans comparaison exhaustive table par table.

#### Traduction technique — FK

- lister toutes les FK publiques ;
- comparer colonne source / cible ;
- comparer action `ON DELETE` / `ON UPDATE` ;
- comparer nom des relations Prisma et noms PostgreSQL ;
- verifier que les relations implicites / inverse relations ne produisent pas de faux positifs.

#### Critere de correction — FK

Une FK ne doit etre corrigee que si :

- la cible Prisma et la cible PostgreSQL differencient un comportement fonctionnel ;
- la divergence est documentee ;
- la correction est testee ;
- le rollback est connu.

## 6. Procedure de reconciliation de `20260915T1057_add_publication_flags`

### 6.1 Etat constate

- la migration est presente physiquement dans le schema PostgreSQL ;
- les colonnes `formula.isPublished` et `service.isPublished` existent avec `boolean NOT NULL DEFAULT false` ;
- les donnees de publication sont presentes et coherent avec les validations realisees ;
- le marqueur Prisma indique que la migration est encore `pending` ;
- le graphe Prisma et l'etat physique ne sont plus aligns.

### 6.2 Decision technique

Il faut proceder a une relecture de la migration et a une procedure de reconciliation controlee avant tout mouvement du marqueur Prisma.

#### Procedure cible — migration publication

1. Lire la migration package et le contenu effectif de l'artefact Prisma.
2. Verifier que les colonnes physiques correspondent a la logique de publication attendue.
3. Verifier les donnees de publication et les quatre fixtures.
4. Verifier la coherences des defaults et du type booleen.
5. Verifier que l'usage effectif du role runtime ne masque pas un probleme de securite.
6. Valider la gouvernance RLS / roles / privileges avant d'autoriser le deplacement du marqueur.
7. Seulement alors, definir la procedure exacte de `migrate resolve` ou de correction du marqueur Prisma.

#### Ce qui ne doit pas etre fait — migration publication

- ne pas `resolve` le marqueur a la legere ;
- ne pas masquer la difference de source de verite ;
- ne pas traiter la migration comme un faux positif uniquement parce qu'elle est physiquement appliquee ;
- ne pas accepter une correction sans preuve technique.

### 6.3 Test de revalidation requis

Avant toute resolution de marqueur, il faut :

- valider le schéma cible de publication ;
- valider les defaults et les valeurs ;
- valider les roles et privileges effectifs ;
- valider l'etat RLS ;
- valider le maintien de l'architecture de production cible ;
- valider le comportement de roles non-bypass.

## 7. Strategie de deploiement Dev -> Staging -> Production

### 7.1 Dev

#### Objectif — Dev

Valider les modeles Prisma et le comportement applicatif dans un environnement de laboratoire, sans masquer la securite.

#### Exigences — Dev

- travailler avec un role app minimal ;
- activer des validations de role courts et explicites ;
- documenter les ecarts de representation et les differences historiques ;
- ne pas utiliser `postgres` comme standard runtime de validation.

### 7.2 Staging

#### Objectif — Staging

Valider le comportement des roles, des privileges et des politiques dans un environnement ou la production cible est approximativement reproduite.

#### Exigences — Staging

- tester le role runtime dédié ;
- tester le comportement des roles non-bypass ;
- tester les privileges sur les tables critiques ;
- tester la procedure de reconciliation avant le deploiement final.

### 7.3 Production

#### Objectif — Production

Deploy une version dont le contrat, la securite et le role runtime sont tous coherents, documentes et controlables.

#### Exigences — Production

- role runtime non-bypass ;
- regles RLS versionnees et approuvees ;
- schema Prisma et schema PostgreSQL coordonnes ;
- revue explicite de la migration publication ;
- procedures de rollback predefinies.

## 8. Ordre exact des futures operations

Le plan d'execution a suivre, dans l'ordre, est le suivant :

1. Valider la decision de gouvernance humaine.
2. Confirmer la separation de responsabilites :
   - Prisma = contrat applicatif ;
   - PostgreSQL/Supabase = RLS / roles / privileges ;
   - Supabase Auth = identite ;
   - RBAC serveur = autorisation metier.
3. Confirmer l'etat actuel de RLS et son statut provisionsl.
4. Identifier le role runtime cible et le role de maintenance distinct.
5. Produire la matrice exhaustive des FK et des differences non nominales.
6. Ne corriger que les differences fonctionnellement incorrectes, une par une, avec preuve technique.
7. Revalider `20260915T1057_add_publication_flags` comme migration physique appliquee et comme etat Prisma a reconciler.
8. Determiner la procedure exacte de deplacement de marqueur Prisma, si elle est autorisee.
9. Valider la procedure sur Dev.
10. Valider la procedure sur Staging.
11. Demander la validation de production.
12. Appliquer, si et seulement si, la reconfiguration de role / privilege / RLS / marqueur selon l'autorisation humaine.

### Important

Aucune de ces operations ne doit etre executee avant la validation du point precedent.

## 9. Points necessitant encore une preuve technique

Il reste des points a prouver avant toute operation de correction ou de marqueur.

### 9.1 Preuves de base necessaires

- preuve technique de la matrice d'acces par role ;
- preuve technique du comportement RLS de chaque role cible ;
- preuve technique de la cible runtime non-bypass ;
- preuve technique que `postgres` contourne effectivement RLS ;
- preuve technique de l'emprunt de role Auth / serveur / DB ;
- preuve technique du comportement exact de `add_publication_flags` dans la base reelle.

### 9.2 Preuves sur les differences

- comparatif exact des 57 FK ;
- verification individuelle des actions ON DELETE / ON UPDATE ;
- verification des cas de relation inverse ;
- verification des valeurs par defaut sur les tables critiques ;
- verification des invariants de publication ;
- verification des scripts potentiellement non idempotents.

### 9.3 Preuves sur l'environnement

- role de dev ;
- role de staging ;
- role de production ;
- difference entre app runtime et migration runtime ;
- schema complet de `public` et ses variantes d'environnement.

## 10. Conditions de rollback

Le rollback doit etre predefini et controlable.

### 10.1 Rollback de configuration de role

- restaurer le role precedent ;
- verifier que le role de maintenance est fonctionnel ;
- revalider les privileges ;
- revalider qu'aucune partie applicative ne fonctionne via un role bypass non autorise.

### 10.2 Rollback de politique RLS

- restaurer la politique precedente connue ;
- verifier que la securite actuelle a ete correctement sauvegardee ;
- valider que les roles applicatifs ont bien retrouve leur comportement connu ;
- ne pas reintroduire de politique sans revue.

### 10.3 Rollback de correction de difference

- restaurer l'etat de schema precedant la correction ;
- verifier que les contraintes FK / defaults / valeurs ne sont pas alterees sans autorisation ;
- valider le comportement applicatif et les donnees concernees ;
- avoir une procedure documentee, pas une simple inverse basique.

### 10.4 Rollback du marqueur Prisma `add_publication_flags`

- ne pas deplacer le marqueur sans validation ;
- si la correction est invalidee, restaurer le marqueur precedent et relancer les controles ;
- ne pas considerer que l'etat physique est automatiquement plus fiable que le graphe Prisma ;
- la procedure de rollback du marqueur doit inclure la revue du contexte de migration et du schéma effectif.

## 11. Ce que ce bloc impose

Ce bloc ne doit encore rien modifier.

Il impose seulement :

- une separation nette des responsabilites techniques ;
- un ordre de realisation explicite ;
- des preuves techniques exigibles avant toute correction ;
- un cadre de rollback ;
- un plan de gouvernance verifiable avant le lancement d'une operation de reparation.

## 12. Conclusion

Le Bloc 1.11 transforme la decision d'architecture en plan d'execution verifiable.

Il confirme que :

- Prisma gouverne le contrat applicatif ;
- PostgreSQL/Supabase gouverne la securite et les privileges ;
- Supabase Auth gouverne l'identite ;
- le RBAC serveur gouverne l'autorisation metier ;
- le RLS reste conserve provisoirement ;
- le role `postgres` n'est pas la cible runtime ;
- le role runtime non-bypass est la cible ;
- les 47 differences ne sont pas corrigees en bloc ;
- la comparaison FK exhaustive est une condition de correction ;
- la migration `add_publication_flags` doit etre reconcilee selon une procedure explicite ;
- Dev / Staging / Production doivent suivre un flux coordonne de schema et de securite ;
- la prochaine action ne doit pas être une correction, mais une validation controlee et technique.

Aucune modification n'est accomplie dans ce bloc. Le but est de produire un plan d'execution si et seulement si les preuves techniques le justifient.
