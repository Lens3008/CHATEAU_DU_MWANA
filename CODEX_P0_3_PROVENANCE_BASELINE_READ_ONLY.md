# CODEX — P0.3 PROVENANCE / BASELINE FORENSIC — READ-ONLY

Projet :
C:\laragon\www\CHATEAU DU MWANA

OBJECTIF :
Établir quelle version du code constitue réellement notre base de travail actuelle, en retraçant les commits/checkpoints hors master et les fichiers non suivis, SANS MODIFIER QUOI QUE CE SOIT.

RÈGLES ABSOLUES :
- READ-ONLY uniquement.
- Aucun fichier créé, modifié, supprimé, renommé ou restauré.
- Aucun git add, commit, reset, clean, restore, checkout, merge, rebase, pull ou push.
- Aucune migration.
- Aucun changement DB, Prisma, Supabase, RLS, Auth ou RBAC.
- Ne lance aucun script applicatif.
- Ne lance aucun test.
- Ne lis ni n'affiche les secrets .env.

CONTEXTE IMPORTANT :
Le diagnostic P0.2 a constaté :
- branche master sur HEAD 8d3e1291932fcadff709509c53095516dcc04426 ;
- aucun remote configuré ;
- 647 entrées git status -uall ;
- 7 fichiers suivis modifiés ;
- 2 fichiers suivis supprimés ;
- 638 fichiers non suivis ;
- 611 fichiers non suivis existent dans au moins un commit hors master ;
- 27 fichiers non suivis n'existent dans aucun commit ;
- des commits/checkpoints Copilot existent hors master et 6 commits sont inaccessibles selon git fsck.

TRAVAIL DEMANDÉ :

1. CARTOGRAPHIE DES COMMITS
- Liste les branches locales, tags et références Git existantes.
- Liste les commits hors master pertinents pour le projet, avec hash court, date, auteur et message.
- Identifie les commits/checkpoints Copilot.
- Identifie les relations parent/enfant entre ces commits.
- Identifie les 6 commits signalés comme inaccessibles par git fsck.
- Ne tente pas de les récupérer ou modifier.

2. RECONSTRUCTION DE LA LIGNE DE DÉVELOPPEMENT
Pour les commits/checkpoints pertinents, détermine :
- quels changements majeurs ils contiennent ;
- quels fichiers du projet ils introduisent/modifient ;
- s'ils semblent correspondre aux phases précédemment réalisées : Auth/RBAC, catalogue, réservation, finance, CRM, CMS, dashboards, design, publication, etc.
Ne conclus pas qu'une phase est validée uniquement parce qu'un commit existe.

3. CORRESPONDANCE FICHIERS NON SUIVIS ↔ COMMITS
- Pour les 611 fichiers non suivis présents dans un commit hors master, identifie les références les plus pertinentes.
- Pour les fichiers critiques, indique le commit qui contient leur version.
- Porte une attention particulière à :
  src/app
  src/components
  src/lib
  prisma
  tests
  migrations
  package.json
  package-lock.json
  playwright.config.*
  .gitignore
- Les 27 fichiers sans équivalent Git doivent être listés précisément et catégorisés.

4. BASELINE PROPOSÉE
Sans effectuer de modification, propose 2 ou 3 scénarios de baseline possibles, par exemple :
- conserver l'arbre actuel tel quel ;
- identifier un checkpoint Git comme référence historique ;
- autre scénario si les preuves le justifient.
Pour chaque scénario, explique avantages, risques et ce qui resterait non résolu.

IMPORTANT :
Ne choisis pas une baseline à la place de l'humain.
Ne restaure rien.
Ne crée aucun commit.

5. RAPPORT FINAL
Présente :
A. État Git confirmé
B. Chronologie des checkpoints
C. Commits Copilot pertinents
D. Commits inaccessibles
E. Correspondance fichiers ↔ commits
F. 27 fichiers sans équivalent Git
G. Baselines possibles
H. Risques
I. Décisions nécessitant validation humaine
J. VERDICT

Le verdict doit être l'un des suivants :
- BASELINE IDENTIFIABLE MAIS À VALIDER
- PROVENANCE INSUFFISANTE
- ANOMALIE GIT CRITIQUE
- BLOQUÉ

Aucune modification pendant cette opération.
