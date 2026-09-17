# ORDRE DE DÉVELOPPEMENT — CHÂTEAU DU MWANA

Ce document définit les 23 phases successives de développement et d'implémentation du projet, telles qu'exigées dans le cahier des charges de référence. Chaque phase doit être rigoureusement testée et validée avant le passage à la suivante.

*Statuts possibles pour chaque phase : `[ ] À faire` | `[/] En cours` | `[x] Terminé`*

## PHASES INITIALES & DESIGN
*   `[x]` **PHASE 1 — Audit :** Audit complet du projet existant.
*   `[x]` **PHASE 2 — Architecture :** Corriger l'architecture si nécessaire.
*   `[/]` **PHASE 3 — Design System :** Créer le langage visuel complet (Tokens, Typographie, Couleurs, Composants de base) basé sur les images de référence.

## FRONTEND & EXPÉRIENCE CLIENT
*   `[ ]` **PHASE 4 — Frontend :** Refonte des pages principales (Accueil, Présentation, Services, Galerie, Contact, Réservation) en appliquant le Design System.
*   `[ ]` **PHASE 5 — Templates :** Créer les différents templates (Premium, Immersive, Editorial, etc.) et systèmes de navigation interchangeables.

## BACKEND & CŒUR MÉTIER
*   `[ ]` **PHASE 6 — Backend :** Refondre Filament et les dashboards pour correspondre au langage visuel de l'Image 2 (Application Métier).
*   `[ ]` **PHASE 7 — Auth/RBAC :** Valider les quatre rôles (Client, Secrétaire, Superviseur, Administrateur).
*   `[ ]` **PHASE 8 — Réservation :** Finaliser le moteur de disponibilité (vérification des conflits, capacités, etc.).
*   `[ ]` **PHASE 9 — Paiements :** Implémentation des paiements manuels + rapprochement. *(Note : Payment Bridge désactivé en V1)*.
*   `[ ]` **PHASE 10 — Facturation :** Gestion des factures, historique, soldes et génération PDF.

## GESTION OPÉRATIONNELLE & LOGISTIQUE
*   `[ ]` **PHASE 11 — Stocks :** Inventaire complet et mouvements.
*   `[ ]` **PHASE 12 — Logistique :** Allocations de matériel, missions et livraisons.
*   `[ ]` **PHASE 13 — Maintenance :** Suivi des équipements, incidents et interventions.

## RELATION CLIENT & DATA
*   `[ ]` **PHASE 14 — CRM :** Fiches clients détaillées et historique d'interactions.
*   `[ ]` **PHASE 15 — Fidélité :** Calcul du score, niveaux (Découverte, Fidèle, Privilège, Royal) et récompenses.
*   `[ ]` **PHASE 16 — Imports/Exports :** Gestion des fichiers Excel/CSV pour la reprise de données.
*   `[ ]` **PHASE 17 — Rapports :** Statistiques, KPI et reporting global sur le dashboard.

## INTÉGRATIONS FUTURES (Préparation V1)
*   `[ ]` **PHASE 18 — WhatsApp :** Architecture de l'API préparée, *bot désactivé en V1*.
*   `[ ]` **PHASE 19 — Android :** Architecture de l'API préparée, *Payment Bridge désactivé en V1*.

## QUALITÉ & DÉPLOIEMENT
*   `[ ]` **PHASE 20 — QA :** Tests complets (scénarios de bout en bout).
*   `[ ]` **PHASE 21 — Sécurité :** Audit de sécurité final (permissions, injections, etc.).
*   `[ ]` **PHASE 22 — Performance/SEO :** Optimisation globale (chargement, requêtes SQL, SEO technique).
*   `[ ]` **PHASE 23 — Production :** Déploiement final.
