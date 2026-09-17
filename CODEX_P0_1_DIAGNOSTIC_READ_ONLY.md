# CODEX — P0.1 DIAGNOSTIC READ-ONLY — LE CHÂTEAU DU MWANA

Tu travailles exclusivement dans le dépôt réel :
C:\laragon\www\CHATEAU DU MWANA

OBJECTIF :
Faire uniquement un diagnostic de l'environnement et du dépôt avant toute modification.

RÈGLES ABSOLUES :
- Lecture seule.
- Ne modifie aucun fichier.
- Ne crée aucun fichier.
- Ne supprime aucun fichier.
- Ne modifie ni PostgreSQL, ni Supabase, ni Prisma, ni RLS, ni Auth, ni RBAC.
- Ne lance aucune migration.
- Ne modifie aucune donnée.
- Aucun git reset, clean, checkout, merge, commit ou push.
- Ne corrige rien.
- Ne masque aucune erreur.
- Ne lis ni n'affiche les valeurs/secrets des fichiers .env.
- Si une opération nécessite une modification, arrête-toi et signale-la.

ÉTAPES :

1. Vérifie le chemin absolu du répertoire courant.
2. Confirme que le dépôt est exactement C:\laragon\www\CHATEAU DU MWANA.
3. Vérifie Git :
   - branche courante
   - HEAD
   - git status
   - fichiers modifiés
   - fichiers non suivis
   Sans modifier quoi que ce soit.
4. Identifie la stack réelle :
   - Next.js
   - React
   - TypeScript
   - Tailwind
   - Prisma
   - Supabase
   - tests
5. Examine package.json et les scripts disponibles.
6. Vérifie Node et npm.
7. Examine l'arborescence principale :
   src/app
   src/components
   src/lib
   prisma
   tests
   e2e
   configuration
8. Vérifie seulement la présence des fichiers .env, .env.local, .env.example, .env.staging, sans afficher leurs valeurs.
9. Recherche les documents de référence présents dans le dépôt :
   README.md
   CLAUDE.md
   AGENTS.md
   cahier des charges
   rapports d'audit
10. Identifie les fonctionnalités déjà présentes dans le code :
   - authentification
   - RBAC
   - dashboards
   - réservations
   - catalogue
   - paiements
   - facturation
   - CRM
   - fidélité
   - stocks
   - équipements
   - maintenance
   - missions
   - livraisons
   - CMS
   - galerie
   - notifications
   - analytics
   - calendrier
11. Identifie les tests présents et les scripts permettant de les exécuter.
12. Signale les anomalies ou incohérences visibles, mais ne les corrige pas.

RAPPORT FINAL :

A. Chemin et identité du projet
B. État Git
C. Stack et versions
D. Structure du projet
E. Fonctionnalités détectées
F. Tests détectés
G. Anomalies / risques
H. Actions recommandées (sans les exécuter)
I. Verdict

Le verdict doit être :
- ENVIRONNEMENT CORRECT
- MAUVAIS RÉPERTOIRE
- ENVIRONNEMENT INCOMPLET
- BLOQUÉ

IMPORTANT :
Ce diagnostic est strictement READ-ONLY.
