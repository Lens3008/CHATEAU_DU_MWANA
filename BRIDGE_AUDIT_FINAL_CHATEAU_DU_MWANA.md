# AUDIT GLOBAL ET COMPLET - LE CHÂTEAU DU MWANA (V3.0)
**Date d'audit :** 17 Septembre 2026
**Objectif :** État des lieux exhaustif (READ-ONLY) servant de base de travail unique pour le plan de correction par lots.

---

## 1. IDENTIFICATION DU PROJET (ÉTAT ACTUEL)
- **Projet localisé :** `C:\laragon\www\CHATEAU DU MWANA` (Workspace racine)
- **Framework :** Next.js 16.3.4 (App Router)
- **React :** 19.2.8
- **TypeScript :** Oui (v5)
- **Database / ORM :** PostgreSQL via `@prisma/orm-postgres` (v8.0.0-rc.9)
- **Auth :** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Styling :** TailwindCSS v4, shadcn/ui, base-ui, lucide-react.

## 2. ARCHITECTURE
L'architecture suit un modèle typique Next.js App Router avec des "Route Groups" :
- `(public)` : Pages vitrines sans authentification.
- `(protected)` & sous-dossiers `/admin`, `/dashboard` : Vues protégées selon les rôles.
- `src/lib/actions` : Logique backend (Server Actions).
- `src/lib/services` : Logique métier (Prisma).

## 3. AUDIT PUBLIC
Les routes `/`, `/presentation`, `/services`, `/gallery`, `/contact` et `/reserver` existent.
- **Design :** Les tokens d'identité visuelle (Or `#FBBF24`, Rouge `#D72638`, Vert `#3A7D44`) sont respectés dans le CSS `globals.css` et appliqués. Les composants animés comme `ChateauLine` et `ChateauLight` sont utilisés en page d'accueil pour le côté premium et "féerique".
- **Ergonomie :** Le rendu est fonctionnel, mais peut être amélioré pour éviter les accumulations verticales si le contenu grandit.

## 4. AUDIT 5 DASHBOARDS
1. **ADMIN (`/dashboard/admin` / `/admin`) :** Centralise la configuration globale. De nombreux onglets existent (CMS, CRM, Logistics).
2. **SUPERVISOR (`/dashboard/supervisor`) :** Conçu pour la validation et la gestion des flux. Actuellement, les listes utilisent `.slice(0, 5).map(...)` (ex. `upcomingReservations`), cachant potentiellement des données sans vraie pagination.
3. **SECRETARY (`/dashboard/secretary`) :** Destiné à l'accueil et la réservation.
4. **LOGISTICIAN (`/dashboard/logistician`) :** Destiné aux stocks et maintenance. Affiche des alertes (ex: `criticalStock`).
5. **CLIENT (`/dashboard/client`) :** Espace personnel. Affiche factures et historique.

*Problème commun constaté :* Beaucoup de boutons d'action sont purement "décoratifs" (UI présente, mais `onClick` vide ou non branché aux Server Actions). Les listes s'allongent verticalement de façon non optimisée.

## 5. AUDIT FRONTEND
- **Server/Client Components :** Séparation globale respectée, mais la logique métier fuit parfois dans la vue (beaucoup de formatage manuel de dates via `toLocaleDateString` au lieu d'utilitaires).
- **Empty States / Loading :** Partiellement implémentés, manque de squelettes complets (Skeletons).
- **Formulaires :** Souvent non branchés au backend ou validés uniquement côté client.
- **Composants dupliqués :** Les tables et listes des dashboards (Admin, Superviseur, Logisticien) répètent une structure similaire.

## 6. AUDIT BACKEND
- **Server Actions & Services :** Les services (`src/lib/services/*`) contiennent la vraie logique Prisma (ex. `addRefund`, `earnLoyaltyPoints`), mais **ne sont pas appelés par les Server Actions** ni le Frontend.
- **Transactions :** La méthode `addPayment` par exemple initie des verrous transactionnels `FOR UPDATE` (ce qui est bien), mais la liaison UI-Backend est rompue.
- **Résultat :** Beaucoup d'actions backend sont "orphelines".

## 7. AUTH/RBAC/RLS
- **Supabase :** `middleware.ts` rafraîchit la session.
- **RBAC :** Des dossiers spécifiques (`/admin`, `/dashboard/*`) sont créés, mais les permissions précises (empêcher au Logisticien de taper l'URL `/admin`) dépendent de composants d'authentification potentiellement by-passables si la route de la page (page.tsx) ne revérifie pas strictement le rôle côté serveur via un HOC ou une vérification backend `requireRole`.
- **Isolation Client :** À renforcer au niveau des requêtes DB (s'assurer que `where: { customerId: session.userId }` est systématique).

## 8. RÉSERVATIONS
- Workflow UI (Prestation → Date → Résumé) est visible dans `/reserver`.
- La logique de déduplication (double réservation, disponibilité) est présente dans Prisma (`schema.prisma` avec relations de capacité) mais son exécution bout en bout via Server Action manque de validation robuste.

## 9. PAIEMENTS & 12. PAYMENT BRIDGE
- Le schéma de données gère très bien `Payment`, `PaymentTransaction`, `PaymentGlobalStatus`, etc.
- **CDM Payment Bridge :** Les interfaces administratives pour la vérification des paiements (Mobile Money, Cash) ressemblent à un "empilement de cartes". L'application Android de caisse (mentionnée dans le CDC 4.1) dépend de ce bridge (API non totalement branchée à l'UI de validation).
- La séparation Simulation / Paiement réel nécessite une revue stricte pour éviter que des transactions "TEST" s'inscrivent en vrai CA.

## 10. FACTURATION
- La structure relationnelle (Facture -> Lignes -> Réservation) existe, mais le workflow automatique (Génération PDF) n'est pas encore visiblement branché sur un outil (comme `puppeteer` ou react-pdf). 

## 11. CATALOGUE
- Géré dans `src/app/(protected)/admin/catalogue/`. 
- Possibilité d'activer/désactiver la "publication", mais la visibilité publique `TEST_FORMULA` n'est pas structurellement filtrée globalement (risque d'affichage public si `isPublished` = true par erreur).

## 14. LOGISTIQUE & 15. MAINTENANCE
- `LogisticsMission`, `Delivery`, `EquipmentMaintenance` existent.
- Des vues comme `/admin/logistics/maintenance` listent des tâches, mais les actions "Résoudre", "Planifier" sont des boutons orphelins.

## 16. CRM & 17. FIDÉLITÉ
- Les fonctions `earnLoyaltyPoints`, `redeemLoyaltyReward` existent dans le backend (`loyalty.ts`), mais **aucun bouton du CRM public ou client ne déclenche ces méthodes**. L'interface affiche le solde (lecture), mais la mutation est manquante.

## 18. CMS, 19. GALERIE & 20. COMMUNICATION
- `/admin/cms/gallery`, `/admin/cms/pages`, `/admin/cms/media` existent. Le modèle `Media` et `ContentPage` permettent la gestion dynamique. 
- Les uploads réels et le stockage via Supabase Storage doivent être validés en termes de droits (qui peut uploader ?). 

## 21. IMPORTS / EXPORTS
- Le service `imports.ts` et `imports-actions.ts` existent. 
- Un texte indique : *"Note : l'import est simulé..."*, confirmant que le workflow d'import n'est pas 100% finalisé en base réelle pour éviter la corruption (Test data).

## 22. CALENDRIER
- **ABSENT :** Aucune librairie de calendrier complexe (`react-big-calendar`, `fullcalendar`) détectée dans le `package.json`, ni de route de vue "Mois/Semaine" claire. L'affichage se résume à des listes avec dates.

## 23. RECHERCHE
- L'AppHeader contient : `{/* Search bar - disabled for now as per BRIDGE 4.1 requirements */}`. La recherche globale est donc **DÉSACTIVÉE**.

## 24 à 28. UX / DESIGN / RESPONSIVE / SEO / PERF
- **Design :** Cohérent, Material/Shadcn avec variables CSS. Apparence "Féerique / Premium" implémentée via `ChateauLine/Light`.
- **Responsive :** Tailwind utilisé (classes `md:`, `lg:`), mais risque sur les grands tableaux de l'admin (scroll horizontal).
- **Accessibilité :** A améliorer (focus clavier, Aria labels souvent absents).
- **Performances :** Problèmes N+1 requêtes possibles (plusieurs `.map` imbriqués sans `include` optimisé sur Prisma).

## 29. TESTS
- **ABSENT :** Aucun fichier `*.test.ts` ni `*.spec.ts` métier détecté dans `src/`.

## 30. FONCTIONS ORPHELINES & 31. BOUTONS DÉCORATIFS
- `addRefund`, `earnLoyaltyPoints`, `redeemLoyaltyReward`, `createNotification` sont **ORPHELINES** (non appelées).
- 90% des boutons d'actions secondaires dans les tables des Dashboards (`/admin/users`, `/admin/logistics`) sont **DÉCORATIFS**.

## 32. DONNÉES DE TEST
- Les imports simulent des erreurs. Certaines formules peuvent être des données de test si elles ne sont pas correctement masquées par flag (`isPublished`).

---

## 33. MATRICE CAHIER DES CHARGES → CODE

| ID | EXIGENCE | PAGE / MODULE | FRONTEND | BACKEND | DB | AUTH | ÉTAT | PRIORITÉ |
|---|---|---|---|---|---|---|---|---|
| REQ-01 | Réservation client | `/reserver` | Présent | Partiel | OK | Public | EN COURS | P0 |
| REQ-02 | RBAC Dashboards | `/dashboard/*` | Présent | Absent | OK | OK | EN COURS | P0 |
| REQ-03 | Paiement / Facture | API Payment | Decoratif | Orphelin | OK | OK | EN COURS | P0 |
| REQ-04 | CRM Fidélité | `/admin/crm` | Présent | Orphelin | OK | OK | EN COURS | P1 |
| REQ-05 | CMS & Galerie | `/admin/cms` | Présent | Partiel | OK | OK | EN COURS | P2 |
| REQ-06 | Logs & Imports | `/admin/imports` | Présent | Simulé | OK | OK | EN COURS | P1 |
| REQ-07 | Calendrier Visuel | N/A | ABSENT | ABSENT | N/A | N/A | ABSENT | P1 |

---

## 34 à 37. PRIORISATION DES PROBLÈMES (P0 à P3)

### P0 (Bloquant)
- **Sécurisation RBAC strict :** Les layouts vérifient l'UI, mais les Server Actions doivent valider le rôle (risque d'escalade logistique vers admin).
- **Liaison UI <-> Backend :** Câbler les paiements, réservations, et facturations aux vrais services Prisma.

### P1 (Métier Important)
- **Calendrier & Disponibilité :** Remplacer les listes basiques par un vrai outil visuel de réservation.
- **Logistique / Mouvements :** Câbler l'UI de maintenance et de livraison.

### P2 (Secondaire)
- **CMS / Galerie :** Finaliser l'upload réel de médias vers le storage.
- **CRM Fidélité :** Câbler l'ajout/retrait de points.

### P3 (UX / Confort)
- **Design Admin :** Améliorer l'affichage (pagination plutôt que `.slice(0,5)`, correction des listes infinies, gestion de la recherche).

---

## 38. PLAN DE CORRECTION PAR LOTS

- **LOT 01 : Infrastructure / Erreurs bloquantes (RBAC)**
  - *Obj :* Verrouiller l'accès aux routes/Server Actions par rôle serveur.
  - *Fichiers :* `src/middleware.ts`, `src/lib/auth.ts`, `src/app/(protected)/*/page.tsx`.
- **LOT 02 : Backend & Câblage des orphelins**
  - *Obj :* Relier UI aux fonctions backend (Paiements, Refunds, Notifications).
  - *Fichiers :* `src/lib/actions/*.ts`, `src/lib/services/*.ts`.
- **LOT 03 : Réservations (Fiabilisation & Concurrence)**
  - *Obj :* Gérer les conflits de dates, capacités, et finaliser le tunnel public.
- **LOT 04 : Paiements & Facturation**
  - *Obj :* Workflow de validation de paiement et génération/attachement de la facture.
- **LOT 05 : Payment Bridge (Android / API)**
  - *Obj :* Créer/Sécuriser les endpoints pour la synchro de l'application mobile (dépôt Cash/Money).
- **LOT 06 : Logistique / Maintenance**
  - *Obj :* Rendre fonctionnel l'onglet Logisticien (mutation de stocks, résolution de maintenance).
- **LOT 07 : CRM / Fidélité**
  - *Obj :* Activation réelle de `earnLoyaltyPoints` sur action métier.
- **LOT 08 : CMS / Galerie / Communication**
  - *Obj :* Upload de fichiers et publication dynamique.
- **LOT 09 : Dashboards (Pagination & Données réelles)**
  - *Obj :* Suppression des `slice(0,5)`, ajout de composants `<Pagination />` et filtres de recherche.
- **LOT 10 : Frontend / Design System / UX**
  - *Obj :* Nettoyage des composants inutiles, uniformisation des cartes et espacements.
- **LOT 11 : Responsive / Accessibilité**
  - *Obj :* Fix des tableaux (overflow-x), contrastes et Aria labels.
- **LOT 12 : Tests / Qualité**
  - *Obj :* Ajout de Jest/Vitest, tests de transactions et Playwright pour les tunnels critiques.

## 39. CRITÈRES DE VALIDATION GLOBAUX (DÉFINITIFS)
1. **Zéro bouton mort :** Tout clic lance une Server Action fonctionnelle ou affiche une modale pertinente.
2. **États DB synchrones :** Chaque action (Réservation, Paiement) reflète exactement son état en DB.
3. **Zéro fuite RBAC :** Aucun test d'intrusion via URL ou manipulation de headers ne doit permettre un accès non autorisé.
4. **Fluidité UI :** Zéro liste dépassant 10 éléments sans pagination ou scroll virtuel.

*--- Fin du rapport de l'Audit ---*
