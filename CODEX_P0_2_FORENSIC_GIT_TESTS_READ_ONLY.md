# CODEX — P0.2 FORENSIC GIT + TEST INFRASTRUCTURE — READ-ONLY

Projet cible :
C:\laragon\www\CHATEAU DU MWANA

OBJECTIF :
Comprendre précisément pourquoi l'arbre Git contient 119 entrées et distinguer l'état historique du projet des éventuelles modifications récentes, SANS MODIFIER QUOI QUE CE SOIT.

RÈGLES ABSOLUES :
- Lecture seule uniquement.
- Aucun fichier créé, modifié, renommé ou supprimé.
- Aucun git add, commit, reset, clean, restore, checkout, merge, rebase, pull ou push.
- Aucune migration.
- Aucun changement Prisma, Supabase, PostgreSQL, RLS, Auth ou RBAC.
- N'exécute aucun script applicatif potentiellement destructif.
- N'exécute aucun test qui pourrait écrire dans la base de données.
- Ne lis ni n'affiche les secrets des fichiers .env.

1. IDENTITÉ GIT
- Affiche le chemin absolu.
- Affiche branche, HEAD et remote(s).
- Exécute uniquement des commandes Git de lecture.
- Donne le statut complet catégorisé : fichiers suivis modifiés, suivis supprimés, non suivis.
- Ne résume pas les 119 entrées en les cachant : donne la liste complète ou, si trop longue, indique exactement comment elle est regroupée.

2. ANALYSE DE L'HISTORIQUE
- Vérifie les derniers commits disponibles.
- Vérifie si les fichiers actuellement non suivis existent dans l'historique Git.
- Vérifie si les fichiers suivis supprimés ont un équivalent ou une version dans HEAD.
- Identifie les différences entre HEAD et l'arbre de travail.
- Ne restaure rien.

3. TESTS
- Inspecte package.json.
- Vérifie les scripts réellement disponibles.
- Inspecte la configuration Playwright.
- Inspecte tests/e2e/auth.spec.ts et tests/e2e/reservation.spec.ts.
- Recherche les autres fichiers de tests présents dans le dépôt.
- N'exécute aucun test.
- Indique les commandes qui pourraient être utilisées ultérieurement, sans les lancer.

4. RISQUES DE MAINTENANCE
- Localise précisément le postinstall qui masque l'échec Prisma.
- Recherche les scripts de maintenance, seed, reset, destruction, migration et validation.
- Ne les exécute pas.
- Indique pour chacun : chemin, rôle probable, niveau de risque et pourquoi.

5. SYNTHÈSE
Produis un tableau :
Élément | État observé | Présent dans HEAD ? | Risque | Action recommandée

6. VERDICT
Choisis uniquement :
- ARBRE À PRÉSERVER TEL QUEL
- ARBRE À INVESTIGUER AVANT TOUTE MODIFICATION
- ANOMALIE GIT CRITIQUE
- BLOQUÉ

IMPORTANT :
Le but est uniquement de comprendre et documenter l'état actuel.
Aucune tentative de "nettoyage" ou de stabilisation automatique.
