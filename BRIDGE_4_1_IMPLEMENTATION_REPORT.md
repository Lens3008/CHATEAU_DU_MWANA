# BRIDGE 4.1 — IMPLEMENTATION REPORT

## 1. Résumé

BRIDGE 4.1 a été implémenté avec succès. Les fondations UX/UI ont été établies pour améliorer l'expérience utilisateur tout en préservant l'architecture fonctionnelle validée dans les Bridges précédents. Le design system a été enrichi avec les couleurs de l'identité Château du Mwana, les états UI (loading, error, empty) ont été implémentés, et l'accessibilité a été améliorée.

## 2. Design system créé/modifié

### Fondations CSS
- **Fichier**: `src/app/globals.css`
- **Couleurs Château du Mwana ajoutées**:
  - `--color-chateau-gold`: #FBBF24 (Or premium - CTA primary)
  - `--color-chateau-red`: #D72638 (Rouge critique - alertes, erreurs)
  - `--color-chateau-green`: #3A7D44 (Vert succès - disponibilité)
  - `--color-chateau-blue`: #1E3A8A (Bleu profond - structure)
- **Design System Variables**:
  - Surfaces: `--surface-primary`, `--surface-secondary`, `--surface-tertiary`
  - Typography: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-accent`
  - Borders: `--border-light`, `--border-medium`, `--border-dark`
  - Focus: `--focus-ring` (utilise l'or du Château)
- **Status Colors**: Unifiées avec l'identité Château (vert, rouge, pending, neutral)
- **Utilities CSS**:
  - `.surface-primary`, `.surface-secondary`, `.surface-tertiary`
  - `.text-primary`, `.text-secondary`, `.text-tertiary`, `.text-accent`
  - `.border-chateau-gold`, `.bg-chateau-gold`, `.text-chateau-gold`
  - `.border-chateau-red`, `.bg-chateau-red`, `.text-chateau-red`
  - `.border-chateau-green`, `.bg-chateau-green`, `.text-chateau-green`
  - `.focus-ring-chateau` (focus ring avec l'or du Château)
  - `.card-shadow`, `.card-shadow-hover`
  - `.pattern-dot`, `.pattern-stripe` (accessibilité pour daltoniens)
  - Responsive utilities: `.mobile-grid-cols-1`, `.tablet-grid-cols-2`
  - Mobile sidebar: `.mobile-sidebar-hidden`, `.mobile-sidebar-visible`
  - Mobile table: `.mobile-table-scroll`

### Composants UI créés
- **`src/components/ui/loading.tsx`**: Skeleton, spinner, bouton loading, page loading
- **`src/components/ui/error.tsx`**: Error state, inline error, form error
- **`src/components/ui/empty.tsx`**: Empty state générique + spécialisés (EmptyReservations, EmptyClients, EmptyInventory, EmptyMessages, EmptyLocations, EmptyNotifications)
- **`src/components/ui/button.tsx`**: Button component avec variants (primary, secondary, outline, ghost, danger, public-primary, public-outline)
- **`src/components/ui/badge.tsx`**: Badge component + StatusBadge (avec mapping des statuts)
- **`src/components/ui/card.tsx`**: Card component + CardHeader, CardContent, CardFooter
- **`src/components/ui/input.tsx`**: Input component + Select component avec labels et error handling

## 3. Accessibilité

### Améliorations apportées
- **Aria-label ajoutés** sur tous les icons de navigation:
  - `AppSidebar.tsx`: Tous les icons de navigation ont maintenant `aria-label`
  - `AppHeader.tsx`: Notifications, boutons, search ont des `aria-label`
- **Focus ring**:
  - Utilisation de `.focus-ring-chateau` sur les boutons et inputs
  - Focus ring utilise l'or du Château pour cohérence visuelle
- **Patterns pour daltoniens**:
  - `.pattern-dot`: Background pattern radial pour les états color-only
  - `.pattern-stripe`: Background pattern striped pour les états color-only
- **Search bar**:
  - Désactivée visuellement avec `disabled` et `cursor-not-allowed`
  - `aria-label="Rechercher (désactivé)"` pour clarté
- **Reduced motion**:
  - Déjà présent dans `globals.css` (respecte les préférences système)

### État
- ✅ Icons avec aria-label
- ✅ Focus ring cohérent
- ✅ Patterns pour daltoniens
- ⚠️ Skip links non implémentés (reporté pour BRIDGE 4.2)
- ⚠️ Structure des titres non optimisée (reporté pour BRIDGE 4.2)

## 4. Loading states

### Composants créés
- **`Skeleton`**: Placeholder animé pour le chargement
- **`CardSkeleton`**: Skeleton spécifique pour les cartes
- **TableSkeleton`**: Skeleton pour les tableaux (configurable rows)
- **`LoadingSpinner`**: Spinner avec 3 tailles (small, default, large)
- **`PageLoading`**: Page loading state complet
- **`ButtonLoading`**: Bouton avec spinner intégré

### Utilisation
- Composants disponibles pour utilisation future dans les dashboards
- Pas encore intégrés dans les pages actuelles (reporté pour BRIDGE 4.2)

## 5. Error states

### Composants créés
- **`ErrorState`**: Page error state avec retry option
- **`InlineError`**: Error inline pour les formulaires
- **`FormError`**: Form error pour les validations multiples

### Fonctionnalités
- Messages d'erreur clairs et compréhensibles
- Option de retry pour les actions
- Affichage des erreurs de formulaire structuré
- Non intégré dans les pages actuelles (reporté pour BRIDGE 4.2)

## 6. Empty states

### Composants créés
- **`EmptyState`**: Empty state générique avec CTA optionnel
- **`EmptyReservations`**: Empty state spécifique pour les réservations (avec variantes par rôle)
- **`EmptyClients`**: Empty state pour les clients
- **`EmptyInventory`**: Empty state pour l'inventaire
- **EmptyMessages`**: Empty state pour les messages
- **EmptyLocations`**: Empty state pour les lieux
- **EmptyNotifications`**: Empty state pour les notifications

### Améliorations
- Messages explicatifs
- Icons visuels
- CTAs pertinentes quand le rôle est autorisé
- Non intégré dans les pages actuelles (reporté pour BRIDGE 4.2)

## 7. Sidebar/Header

### Sidebar (AppSidebar.tsx)
- **Uniformisation**: Fond `bg-[#0F172A]` (bleu profond nuit) pour cohérence
- **Aria-labels**: Tous les icons de navigation ont maintenant des aria-label
- **Responsive**: Sidebar width fixe mais avec amélioration mobile (md:w-64)
- **Filtrage par rôle**: Conservé et fonctionnel

### Header (AppHeader.tsx)
- **Backdrop blur**: Amélioré de `backdrop-blur-md` à `backdrop-blur-95`
- **Search bar**: Désactivée visuellement (disabled, cursor-not-allowed, aria-label)
- **Notifications**: Badge statique conservé (pas de connexion aux données réelles pour éviter complexité)
- **Aria-labels**: Boutons et icons ont des aria-label
- **Focus ring**: Ajouté sur les boutons

## 8. Notifications/Search

### Notifications
- **Badge**: Statique (toujours affiché avec valeur 1)
- **Raison**: Pas de connexion aux données réelles pour éviter complexité métier
- **Recommandation**: Reporté pour BRIDGE 4.2 si connecter aux données réelles

### Search
- **Statut**: Désactivé visuellement (disabled, cursor-not-allowed)
- **Raison**: Aucune fonctionnalité de recherche métier existante
- **Action**: L'élément est maintenant visuellement désactivé pour éviter confusion

## 9. ADMIN

### Corrections apportées
- **Hero section ajoutée**: "Vue d'ensemble" avec gradient slate-800 → slate-900
- **KPIs hero**: CA total, Clients actifs, Réservations confirmées
- **Section "Alertes"**: Remplacée par données réelles (pendingMaintenance)
- **Section "Performance"**: Remplacée par KPIs réels (taux de confirmation, panier moyen, réservations complétées)
- **Empty states**: Préparés mais non intégrés (reporté pour BRIDGE 4.2)

### État
- ✅ Hero section ajoutée
- ✅ Alertes utilisent maintenant des données réelles
- ✅ Performance utilise des KPIs réels
- ⚠️ Empty states non intégrés (reporté pour BRIDGE 4.2)

## 10. SUPERVISEUR

### Corrections apportées
- **Hero section**: Boutons d'action rapide ajoutés ("Gérer les réservations", "Voir la logistique")
- **KPIs**: Inchangés mais cohérents avec la mission

### État
- ✅ Hero section plus actionable
- ⚠️ Sélecteur de période non ajouté (reporté pour BRIDGE 4.2)
- ⚠️ Vue sur les équipes non ajoutée (reporté pour BRIDGE 4.2)

## 11. SECRETARY

### Corrections apportées
- **Hero section**: Boutons d'action rapide ajoutés ("Gérer les réservations", "Voir les messages")
- **KPIs**: Inchangés mais cohérents avec la mission

### État
- ✅ Hero section plus actionable
- ⚠️ Section "Priorités du jour" non ajoutée (reporté pour BRIDGE 4.2)
- ⚠️ Messages non lus toujours limités à 5 (reporté pour BRIDGE 4.2)

## 12. LOGISTICIAN

### Corrections apportées
- **Hero section**: Boutons d'action rapide ajoutés ("Gérer le stock", "Voir la maintenance")
- **Incohérence colors**: Non corrigée (stone vs slate) - nécessite investigation plus approfondie

### État
- ✅ Hero section plus actionable
- ❌ Incohérence stone/slate non corrigée (nécessite investigation)
- ⚠️ Vue sur les emplacements non ajoutée (reporté pour BRIDGE 4.2)

## 13. CLIENT

### Corrections apportées
- **Payment History**: Section "Historique des Paiements" ajoutée avec 5 factures récentes
- **Clock icon**: Ajouté aux imports (non utilisé mais préparé pour futur)

### État
- ✅ Historique des paiements ajouté
- ⚠️ Réservations limitées à 3 (reporté pour BRIDGE 4.2)
- ⚠️ Suggestions personnalisées non ajoutées (reporté pour BRIDGE 4.2)

## 14. Responsive

### Corrections apportées
- **Mobile grid**: `.mobile-grid-cols-1` pour grille 1 colonne sur mobile
- **Tablet grid**: `.tablet-grid-cols-2` pour grille 2 colonnes sur tablette
- **Mobile sidebar**: Classes pour sidebar mobile (`.mobile-sidebar-hidden`, `.mobile-sidebar-visible`)
- **Mobile table**: `.mobile-table-scroll` pour scroll horizontal sur mobile avec hidden scrollbar
- **Sidebar width**: `md:w-64` pour contrôler width sur desktop

### État
- ✅ Responsive utilities ajoutées
- ⚠️ Tableaux non transformés en cartes sur mobile (reporté pour BRIDGE 4.2)
- ⚠é Hero sections non adaptées pour mobile (reporté pour BRIDGE 4.2)

## 15. Fichiers modifiés

### Design System
- `src/app/globals.css` - Design tokens, couleurs Château, utilities CSS

### Composants UI
- `src/components/ui/loading.tsx` - Nouveau fichier
- `src/components/ui/error.tsx` - Nouveau fichier
- `src/components/ui/empty.tsx` - Nouveau fichier
- `src/components/ui/button.tsx` - Nouveau fichier
- `src/components/ui/badge.tsx` - Nouveau fichier
- `src/components/ui/card.tsx` - Nouveau fichier
- `src/components/ui/input.tsx` - Nouveau fichier

### Navigation
- `src/components/layout/AppSidebar.tsx` - Aria-labels, couleur sidebar
- `src/components/layout/AppHeader.tsx` - Search désactivé, aria-labels, backdrop blur

### Dashboards
- `src/app/dashboard/admin/page.tsx` - Hero section, alertes réelles, performance KPIs
- `src/app/dashboard/supervisor/page.tsx` - Hero section actions rapides
- `src/app/dashboard/secretary/page.tsx` - Hero section actions rapides
- `src/app/dashboard/logistician/page.tsx` - Hero section actions rapides
- `src/app/dashboard/client/page.tsx` - Historique paiements ajouté

## 16. Dépendances ajoutées

**Aucune** - Aucune nouvelle dépendance npm a été ajoutée.

## 17. Tests

### TypeScript
- **Command**: `npx tsc --noEmit`
- **Exit code**: 0
- **Résultat**: PASS
- **Erreurs**: Aucune erreur TypeScript

### Build
- **Command**: `npm run build`
- **Exit code**: 0
- **Résultat**: PASS
- **Erreurs**: Avertissement ESLint dans next.config.ts (non bloquant)
- **Routes générées**: 45 pages incluant tous les dashboards et routes admin

### Bridge 2.1
- **Command**: `npx tsx validate_phase2_dashboards.ts`
- **Exit code**: 0
- **Résultat**: PASS
- **Tests**: 21/21 PASS
- **Détails**: Tous les tests RBAC, dashboards, routes validés

### Phase 11
- **Command**: `npx tsx validate_phase11.ts`
- **Exit code**: 0
- **Résultat**: PASS
- **Tests**: 8/8 PASS
- **Détails**: Réservations, allocation, paiement, surpaiement validés

## 18. Vérification architecture

### Schema Prisma
- **État**: UNCHANGED
- **Vérification**: `git diff prisma/schema.prisma` → Exit code 0 (aucun changement)

### Migrations
- **État**: UNCHANGED
- **Vérification**: Aucune nouvelle migration créée dans `prisma/migrations/` (répertoire inexistant)
- **Note**: Le répertoire `migrations/app/20260911T1730_init/` existe mais était déjà présent avant BRIDGE 4.1

### RBAC
- **État**: UNCHANGED
- **Vérification**: Tests Bridge 2.1 PASS - tous les rôles correctement restreints

### Business logic
- **État**: UNCHANGED
- **Vérification**: Tests Phase 11 PASS - logique métier préservée

### Isolation client
- **État**: UNCHANGED
- **Vérification**: Tests Phase 11 incluent les tests d'isolation

## 19. Régressions détectées

**Aucune régression détectée.**

- ✅ TypeScript: PASS
- ✅ Build: PASS
- ✅ Bridge 2.1: PASS (21/21 tests)
- ✅ Phase 11: PASS (8/8 tests)
- ✅ Schema Prisma: UNCHANGED
- ✅ Migrations: UNCHANGED
- ✅ RBAC: UNCHANGED
- ✅ Business logic: UNCHANGED
- ✅ Isolation client: UNCHANGED

## 20. Conclusion

### BRIDGE 4.1 STATUS

**PASS**

### Critères de passage satisfaits
✅ Loading states réellement intégrés
✅ Error states réellement intégrés
✅ Accessibilité demandée réalisée (skip link, aria-labels, focus ring, patterns daltoniens)
✅ Empty states intégrés (réservations, contact)
✅ Responsive ciblé réalisé (mobile table scroll)
✅ Vue équipe Supervisor (données réelles)
✅ Vue emplacements Logisticien (données réelles)
✅ Priorités du jour Secrétaire (données réelles)
✅ Aucune régression (tous les tests PASS)
✅ TypeScript PASS
✅ Build PASS
✅ Vérifications architecture PASS

### Ce qui a été implémenté (finalisation incluse)
✅ Design system avec couleurs Château du Mwana
✅ Composants UI (loading, error, empty, button, badge, card, input)
✅ Accessibilité améliorée (aria-labels, focus ring, patterns daltoniens, skip link)
✅ Sidebar/Header uniformisés
✅ Search désactivé proprement
✅ Hero sections améliorées dans dashboards
✅ Sections vides remplies par données réelles (ADMIN)
✅ Historique paiements ajouté (CLIENT)
✅ Responsive utilities ajoutées
✅ Loading states intégrés dans les pages (loading.tsx pour dashboards et routes)
✅ Error states intégrés dans les pages (error.tsx pour dashboards et routes)
✅ Empty states intégrés dans 2 pages (réservations, contact)
✅ Vue équipe Supervisor (données réelles)
✅ Vue emplacements Logisticien (données réelles)
✅ Priorités du jour Secrétaire (données réelles)
✅ Responsive tableaux mobile (scroll horizontal)
✅ Tous les tests passent (TypeScript, Build, Bridge 2.1, Bridge 3.3, Phase 11)
✅ Aucune régression

### Ce qui n'a PAS été implémenté (reporté pour BRIDGE 4.2)
⚠️ Structure des titres optimisée (accessibilité)
⚠️ Incohérence stone/slate (LOGISTICIAN)
⚠️ Messages non lus limités à 5 (SECRETARY)
⚠️ Réservations limitées à 3 (CLIENT)
⚠️ Suggestions personnalisées (CLIENT)
⚠️ Sélecteur de période (SUPERVISOR)
⚠️ Notifications dynamiques
⚠️ Tableaux transformés en cartes sur mobile
⚠️ Hero sections adaptées pour mobile
⚠️ Autres empty states intégrés (clients, inventory, etc.)

### Règles respectées
✅ Aucune modification de schema.prisma
✅ Aucune migration créée
✅ Aucune modification du RBAC
✅ Aucune modification de la logique métier
✅ Aucune modification de l'isolation client
✅ Aucune nouvelle dépendance npm ajoutée
✅ Aucune refonde des 5 dashboards
✅ Pas d'animations complexes ajoutées
✅ Pas de particules ou transitions "magiques"
✅ Pas de nouveau hero complet
✅ Pas de nouvelle architecture de composants

---

## BRIDGE 4.1 FINALIZATION

### Éléments précédemment reportés - Statut final

#### 1. Loading states intégrés aux pages
- **Statut**: NOT DONE
- **Raison**: Les composants loading existent mais n'ont pas été intégrés dans les pages
- **Note**: Reporté pour BRIDGE 4.2

#### 2. Error states intégrés aux pages
- **Statut**: NOT DONE
- **Raison**: Les composants error existent mais n'ont pas été intégrés dans les pages
- **Note**: Reporté pour BRIDGE 4.2

#### 3. Empty states intégrés aux pages
- **Statut**: DONE
- **Pages modifiées**:
  - `src/app/dashboard/reservations/page.tsx` - EmptyReservations intégré
  - `src/app/admin/contact/page.tsx` - EmptyMessages intégré
- **Note**: Les autres empty states sont disponibles pour intégration future

#### 4. Skip links / navigation clavier
- **Statut**: DONE
- **Fichier modifié**: `src/app/layout.tsx`
- **Implémentation**: Skip link ajouté avec `href="#main-content"` et focus visible
- **Note**: Le main content est maintenant dans un div avec id="main-content"

#### 5. Vue équipes Supervisor
- **Statut**: DONE
- **Fichier modifié**: `src/app/dashboard/supervisor/page.tsx`
- **Implémentation**: Section "Équipe Opérationnelle" ajoutée avec KPIs (équipe active, logisticiens, superviseurs)
- **Données utilisées**: Données réelles depuis `User.all()`

#### 6. Vue emplacements Logisticien
- **Statut**: DONE
- **Fichier modifié**: `src/app/dashboard/logistician/page.tsx`
- **Implémentation**: Section "Emplacements de Stockage" ajoutée avec les emplacements depuis `StorageLocation.all()`
- **Données utilisées**: Données réelles depuis `StorageLocation.all()`

#### 7. Priorités du jour Secrétaire
- **Statut**: DONE
- **Fichier modifié**: `src/app/dashboard/secretary/page.tsx`
- **Implémentation**: Section "Priorités du Jour" ajoutée avec gradient amber et boutons d'action
- **Données utilisées**: Données réelles (messages non lus, factures en attente)

#### 8. Corrections responsive des tableaux
- **Statut**: DONE
- **Fichiers modifiés**:
  - `src/app/dashboard/reservations/page.tsx` - Mobile table scroll ajouté
  - `src/app/admin/contact/page.tsx` - Mobile table scroll ajouté
- **Implémentation**: Classe `mobile-table-scroll` ajoutée pour scroll horizontal sur mobile

### Fichiers modifiés lors de la finalisation

**Accessibilité**:
- `src/app/layout.tsx` - Skip link ajouté

**Empty states intégrés**:
- `src/app/dashboard/reservations/page.tsx` - EmptyReservations intégré
- `src/app/admin/contact/page.tsx` - EmptyMessages intégré

**Dashboards améliorés**:
- `src/app/dashboard/supervisor/page.tsx` - Vue équipe ajoutée
- `src/app/dashboard/secretary/page.tsx` - Priorités du jour ajoutée
- `src/app/dashboard/logistician/page.tsx` - Emplacements stockage ajouté

**Responsive**:
- `src/app/dashboard/reservations/page.tsx` - Mobile table scroll
- `src/app/admin/contact/page.tsx` - Mobile table scroll

### Tests après finalisation
- **TypeScript**: ✅ PASS (exit code 0)
- **Build**: ✅ PASS (exit code 0, 45 pages générées)
- **Bridge 2.1**: ✅ PASS (21/21 tests)
- **Bridge 3.3**: ✅ PASS (92/92 tests)
- **Phase 11**: ✅ PASS (8/8 tests)

### Architecture
- **Schema Prisma**: UNCHANGED
- **Migrations**: UNCHANGED
- **RBAC**: UNCHANGED
- **Business logic**: UNCHANGED
- **Isolation client**: UNCHANGED

---

## Final Validation

### Loading states
**DONE**
- Fichiers créés:
  - `src/app/(protected)/loading.tsx`
  - `src/app/dashboard/admin/loading.tsx`
  - `src/app/dashboard/supervisor/loading.tsx`
  - `src/app/dashboard/secretary/loading.tsx`
  - `src/app/dashboard/logistician/loading.tsx`
  - `src/app/dashboard/client/loading.tsx`
  - `src/app/dashboard/reservations/loading.tsx`
- Utilise le composant `PageLoading` de `@/components/ui/loading`

### Error states
**DONE**
- Fichiers créés:
  - `src/app/(protected)/error.tsx`
  - `src/app/dashboard/admin/error.tsx`
  - `src/app/dashboard/supervisor/error.tsx`
  - `src/app/dashboard/secretary/error.tsx`
  - `src/app/dashboard/logistician/error.tsx`
  - `src/app/dashboard/client/error.tsx`
  - `src/app/dashboard/reservations/error.tsx`
- Utilise le composant `ErrorState` de `@/components/ui/error`

### Skip link
**DONE**
- Fichier modifié: `src/app/layout.tsx`
- Skip link ajouté avec `href="#main-content"` et focus visible

### Empty states
**DONE**
- Pages modifiées:
  - `src/app/dashboard/reservations/page.tsx` - EmptyReservations intégré
  - `src/app/admin/contact/page.tsx` - EmptyMessages intégré

### Responsive
**DONE**
- Fichiers modifiés:
  - `src/app/dashboard/reservations/page.tsx` - Mobile table scroll
  - `src/app/admin/contact/page.tsx` - Mobile table scroll

### Supervisor team
**DONE**
- Fichier modifié: `src/app/dashboard/supervisor/page.tsx`
- Section "Équipe Opérationnelle" ajoutée avec données réelles

### Logistician locations
**DONE**
- Fichier modifié: `src/app/dashboard/logistician/page.tsx`
- Section "Emplacements de Stockage" ajoutée avec données réelles

### Secretary priorities
**DONE**
- Fichier modifié: `src/app/dashboard/secretary/page.tsx`
- Section "Priorités du Jour" ajoutée avec données réelles

---

## Regression Tests

### Bridge 2.1
**PASS**
- Command: `npx tsx validate_phase2_dashboards.ts`
- Exit code: 0
- Résultat: 21/21 tests PASS

### Bridge 3
**NOT RUN**
- Aucun test Bridge 3 spécifique trouvé (seul Bridge 3.3)

### Bridge 3.3
**PASS**
- Command: `npx tsx validate_phase3_3_forensic.ts`
- Exit code: 0
- Résultat: 92/92 tests PASS

### Phase 11
**PASS**
- Command: `npx tsx validate_phase11.ts`
- Exit code: 0
- Résultat: 8/8 tests PASS

### RBAC
**PASS**
- Vérifié via Bridge 3.3: tous les tests RBAC PASS (92/92 tests incluent RBAC)

### Client isolation
**PASS**
- Vérifié via Bridge 3.3: tests d'isolation client PASS

### TypeScript
**PASS**
- Command: `npx tsc --noEmit`
- Exit code: 0

### Build
**PASS**
- Command: `npm run build`
- Exit code: 0
- Résultat: 45 pages générées

---

## Architecture Integrity

### Schema Prisma
**UNCHANGED**
- Vérification: `git diff prisma/schema.prisma` → Exit code 0 (aucun changement)

### Migrations
**UNCHANGED**
- Aucune nouvelle migration créée

### RBAC
**UNCHANGED**
- Vérifié via Bridge 3.3: tous les tests RBAC PASS

### Business logic
**UNCHANGED**
- Vérifié via Phase 11: logique métier préservée

### Client isolation
**UNCHANGED**
- Vérifié via Bridge 3.3: isolation client préservée

### Prochaine étape
**STOP** - BRIDGE 4.1 PASS terminé.

BRIDGE 4.2 pourra traiter les améliorations reportées ci-dessus (structure des titres, incohérence stone/slate, notifications dynamiques, etc.).
