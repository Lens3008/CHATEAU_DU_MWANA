# BRIDGE 4 — AUDIT UX/UI FORENSIQUE

## 1. Executive Summary

L'architecture fonctionnelle du Château du Mwana est solide et validée (Bridge 3.3: 92/92 tests PASS). Les 5 espaces utilisateurs sont opérationnels, mais l'interface donne encore une forte impression de prototype. L'identité visuelle premium du Château du Mwana n'est pas présente dans les dashboards admin. Les parcours utilisateur fonctionnent mais manquent de finesse UX. Les états UI (loading, error, success) sont absents ou basiques. La cohérence visuelle entre les 5 rôles est insuffisante.

**Diagnostic principal**: L'interface est fonctionnelle mais ne reflète pas l'identité premium, élégante et magique du Château du Mwana. Les dashboards utilisent un design système générique (slate/indigo) au lieu des couleurs de l'identité (or, rouge, vert).

---

## 2. État général

### Architecture
- ✅ Layout Sidebar + Header + Main content stable
- ✅ RBAC correctement implémenté
- ✅ Navigation filtrée par rôle
- ✅ Données réelles (pas de fake data)
- ❌ Design système générique (slate/indigo)
- ❌ Pas d'identité visuelle Château du Mwana
- ❌ États UI manquants (loading, error, success)
- ❌ Incohérence visuelle entre les 5 dashboards

### Couleurs actuelles
- Admin theme: Slate (#0F172A, #F8FAFC, #E2E8F0)
- Primary action: Indigo-600
- Public theme variables: Or (#FBBF24), Rouge (#D72638), Vert (#3A7D44)
- **Problème**: Les dashboards admin n'utilisent PAS les couleurs du Château

### Typographie
- Font primary: Inter (sans-serif)
- Font display: Quicksand (définie mais non utilisée dans les dashboards)
- Font serif: Playfair Display (définie mais non utilisée)
- **Problème**: Les fonts premium ne sont pas utilisées dans les dashboards

---

## 3. ADMIN

### Mission
Pilotage global, administration, supervision complète.

### Forces
- ✅ Vue globale claire (CA, clients, réservations, équipe)
- ✅ KPIs pertinents pour un administrateur
- ✅ Hiérarchie visuelle cohérente
- ✅ Liens clairs vers les sections détaillées
- ✅ Accès à toutes les fonctionnalités admin

### Faiblesses
- ❌ **Aucune section hero** - ADMIN est le seul dashboard sans gradient/section hero
- ❌ **Section "Alertes" statique** - Toujours affiche "0", pas de données réelles
- ❌ **Section "Performance" vide** - Juste un lien vers analytics, pas de KPIs
- ❌ **Pas de vue sur les problèmes urgents** - Aucune section "À traiter"
- ❌ **Couleurs génériques** - Utilise slate/indigo au lieu des couleurs du Château
- ❌ **Pas de personnalisation** - Dashboard générique SaaS

### Problèmes P0
- **Aucun** - Le dashboard est fonctionnel

### Problèmes P1
1. **Page**: `/dashboard/admin`
   - **Rôle**: ADMIN
   - **Problème**: Section "Alertes" statique avec valeur "0" hardcoded, pas de données réelles
   - **Impact utilisateur**: L'administrateur ne voit pas les alertes réelles, manque d'information critique
   - **Priorité**: P1
   - **Recommandation**: Connecter aux notifications réelles via `/admin/notifications`

2. **Page**: `/dashboard/admin`
   - **Rôle**: ADMIN
   - **Problème**: Section "Performance" vide, seulement un lien vers analytics
   - **Impact utilisateur**: Perte de temps, pas de vue rapide sur la performance
   - **Priorité**: P1
   - **Recommandation**: Ajouter 2-3 KPIs de performance (CA du mois, évolution, taux de conversion)

3. **Page**: `/dashboard/admin`
   - **Rôle**: ADMIN
   - **Problème**: Aucune section hero contrairement aux autres dashboards
   - **Impact utilisateur**: Dashboard moins visuel, moins premium
   - **Priorité**: P1
   - **Recommandation**: Ajouter une section hero avec gradient (couleurs du Château: or/rouge/vert)

### Problèmes P2
1. **Page**: `/dashboard/admin`
   - **Rôle**: ADMIN
   - **Problème**: Pas de section "À traiter aujourd'hui"
   - **Impact utilisateur**: Priorités non visibles
   - **Priorité**: P2
   - **Recommandation**: Ajouter une section avec les tâches urgentes du jour

2. **Page**: `/dashboard/admin`
   - **Rôle**: ADMIN
   - **Problème**: Activité récente limitée à 5 réservations
   - **Impact utilisateur**: Vue partielle
   - **Priorité**: P2
   - **Recommandation**: Augmenter à 10 ou ajouter pagination

### Problèmes P3
1. **Page**: `/dashboard/admin`
   - **Rôle**: ADMIN
   - **Problème**: Pas de personnalisation visuelle
   - **Impact utilisateur**: Dashboard générique
   - **Priorité**: P3
   - **Recommandation**: Intégrer les couleurs du Château (or, rouge, vert)

---

## 4. SUPERVISEUR

### Mission
Contrôle opérationnel, supervision des réservations, logistique, stocks, incidents, maintenance et activité.

### Forces
- ✅ Section hero "Opérations du Jour" très pertinente
- ✅ Focus sur les opérations du terrain
- ✅ KPIs orientés action (incidents, stock critique)
- ✅ Vue sur les réservations à venir (7 jours)
- ✅ Couleur alerte (red) pour incidents
- ✅ Gradient indigo cohérent avec l'opérationnel

### Faiblesses
- ❌ **Hero section peu actionable** - Pas de boutons d'action rapide
- ❌ **Manque de vue sur les équipes** - Pas de vue sur les logisticiens
- ❌ **Pas de section problèmes urgents** - Incidents non hiérarchisés
- ❌ **Réservations limitées à 7 jours** - Non paramétrable
- ❌ **Couleurs génériques** - Indigo au lieu des couleurs du Château

### Problèmes P0
- **Aucun** - Le dashboard est fonctionnel

### Problèmes P1
1. **Page**: `/dashboard/supervisor`
   - **Rôle**: SUPERVISOR
   - **Problème**: Hero section "Opérations du Jour" affiche des KPIs mais pas d'actions rapides
   - **Impact utilisateur**: Le superviseur voit les chiffres mais ne peut pas agir rapidement
   - **Priorité**: P1
   - **Recommandation**: Ajouter des boutons d'action rapide dans la hero section (ex: "Créer mission", "Voir incidents")

2. **Page**: `/dashboard/supervisor`
   - **Rôle**: SUPERVISOR
   - **Problème**: Pas de vue sur les équipes logistiques
   - **Impact utilisateur**: Le superviseur ne peut pas voir qui est disponible
   - **Priorité**: P1
   - **Recommandation**: Ajouter une section "Équipe disponible" avec les logisticiens

3. **Page**: `/dashboard/supervisor`
   - **Rôle**: SUPERVISOR
   - **Problème**: Réservations à venir limitées à 7 jours, non paramétrable
   - **Impact utilisateur**: Vue insuffisante pour la planification
   - **Priorité**: P1
   - **Recommandation**: Ajouter un sélecteur de période (7j, 14j, 30j)

### Problèmes P2
1. **Page**: `/dashboard/supervisor`
   - **Rôle**: SUPERVISOR
   - **Problème**: Incidents non hiérarchisés par urgence
   - **Impact utilisateur**: Difficile de prioriser
   - **Priorité**: P2
   - **Recommandation**: Ajouter un système de priorité (critique, urgent, normal)

2. **Page**: `/dashboard/supervisor`
   - **Rôle**: SUPERVISOR
   - **Problème**: Maintenance limitée à 5 éléments
   - **Impact utilisateur**: Vue partielle
   - **Priorité**: P2
   - **Recommandation**: Augmenter à 10 ou ajouter pagination

### Problèmes P3
1. **Page**: `/dashboard/supervisor`
   - **Rôle**: SUPERVISOR
   - **Problème**: Couleurs génériques (indigo)
   - **Impact utilisateur**: Pas d'identité Château
   - **Priorité**: P3
   - **Recommandation**: Intégrer les couleurs du Château

---

## 5. SECRÉTAIRE

### Mission
Accueil, relation client, CRM, réservations, suivi commercial, contacts et opérations administratives autorisées.

### Forces
- ✅ Focus sur les tâches administratives
- ✅ KPIs très pertinents (messages, factures, clients)
- ✅ Hero section "Planning du Jour" utile
- ✅ Messages de contact visibles (urgence)
- ✅ Catalogue accessible pour la réservation
- ✅ Gradient blue cohérent avec l'administratif

### Faiblesses
- ❌ **Pas de section "À traiter en priorité"** - Messages/factures non hiérarchisés
- ❌ **Messages non lus limités à 5** - Vue partielle
- ❌ **Pas de vue sur les appels à venir** - Manque de préparation
- ❌ **Chiffre d'affaires statique** - Pas d'évolution temporelle
- ❌ **Couleurs génériques** - Blue au lieu des couleurs du Château

### Problèmes P0
- **Aucun** - Le dashboard est fonctionnel

### Problèmes P1
1. **Page**: `/dashboard/secretary`
   - **Rôle**: SECRETARY
   - **Problème**: Pas de section "À traiter en priorité"
   - **Impact utilisateur**: La secrétaire ne sait pas quoi traiter en premier
   - **Priorité**: P1
   - **Recommandation**: Ajouter une section "Priorités du jour" avec les messages/factures urgentes

2. **Page**: `/dashboard/secretary`
   - **Rôle**: SECRETARY
   - **Problème**: Messages non lus limités à 5 dans la liste
   - **Impact utilisateur**: Vue partielle, risque d'oublier des messages
   - **Priorité**: P1
   - **Recommandation**: Augmenter à 10 ou ajouter pagination

3. **Page**: `/dashboard/secretary`
   - **Rôle**: SECRETARY
   - **Problème**: Chiffre d'affaires statique, pas d'évolution temporelle
   - **Impact utilisateur**: Pas de vue sur la performance commerciale
   - **Priorité**: P1
   - **Recommandation**: Ajouter un indicateur d'évolution (ex: "+15% vs mois dernier")

### Problèmes P2
1. **Page**: `/dashboard/secretary`
   - **Rôle**: SECRETARY
   - **Problème**: Pas de vue sur les appels à venir
   - **Impact utilisateur**: Manque de préparation
   - **Priorité**: P2
   - **Recommandation**: Ajouter une section "Appels planifiés"

2. **Page**: `/dashboard/secretary`
   - **Rôle**: SECRETARY
   - **Problème**: Nouveaux clients limités à "aujourd'hui"
   - **Impact utilisateur**: Vue partielle
   - **Priorité**: P2
   - **Recommandation**: Ajouter un sélecteur de période

### Problèmes P3
1. **Page**: `/dashboard/secretary`
   - **Rôle**: SECRETARY
   - **Problème**: Couleurs génériques (blue)
   - **Impact utilisateur**: Pas d'identité Château
   - **Priorité**: P3
   - **Recommandation**: Intégrer les couleurs du Château

---

## 6. LOGISTICIEN

### Mission
Exécution terrain, équipements, allocations, missions, livraisons, retours, incidents et maintenance opérationnelle.

### Forces
- ✅ Focus clair sur les opérations logistiques
- ✅ Hero section "État des Équipements" très utile
- ✅ Alertes stock avec détails (seuil vs actuel)
- ✅ KPIs orientés action (incidents, maintenance)
- ✅ Couleur emerald cohérente avec la logistique
- ✅ Vue sur les livraisons (en attente, en transit)

### Faiblesses
- ❌ **Pas de vue sur les emplacements de stockage** - Stock sans localisation
- ❌ **Manque de vue sur les équipes** - Pas de vue sur les logisticiens disponibles
- ❌ **Pas de section "Problèmes urgents"** - Incidents non hiérarchisés
- ❌ **Livraisons limitées à 2 métriques** - Vue partielle
- ❌ **Couleurs génériques** - Emerald au lieu des couleurs du Château
- ❌ **Incohérence de couleurs** - Utilise stone au lieu de slate (logistics page)

### Problèmes P0
- **Aucun** - Le dashboard est fonctionnel

### Problèmes P1
1. **Page**: `/dashboard/logistician`
   - **Rôle**: LOGISTICIAN
   - **Problème**: Pas de vue sur les emplacements de stockage
   - **Impact utilisateur**: Le logisticien ne sait pas où se trouve le stock
   - **Priorité**: P1
   - **Recommandation**: Ajouter une section "Emplacements" avec la localisation du stock

2. **Page**: `/dashboard/logistician`
   - **Rôle**: LOGISTICIAN
   - **Problème**: Pas de vue sur les équipes logistiques
   - **Impact utilisateur**: Le logisticien ne sait pas qui est disponible
   - **Priorité**: P1
   - **Recommandation**: Ajouter une section "Équipe disponible"

3. **Page**: `/dashboard/logistician`
   - **Rôle**: LOGISTICIAN
   - **Problème**: Livraisons limitées à 2 métriques (en attente, en transit)
   - **Impact utilisateur**: Vue partielle
   - **Priorité**: P1
   - **Recommandation**: Ajouter les livraisons complétées et en retard

### Problèmes P2
1. **Page**: `/dashboard/logistician`
   - **Rôle**: LOGISTICIAN
   - **Problème**: Incidents non hiérarchisés par urgence
   - **Impact utilisateur**: Difficile de prioriser
   - **Priorité**: P2
   - **Recommandation**: Ajouter un système de priorité (critique, urgent, normal)

2. **Page**: `/dashboard/logistician`
   - **Rôle**: LOGISTICIAN
   - **Problème**: Maintenance limitée à 5 éléments
   - **Impact utilisateur**: Vue partielle
   - **Priorité**: P2
   - **Recommandation**: Augmenter à 10 ou ajouter pagination

### Problèmes P3
1. **Page**: `/dashboard/logistician` + `/admin/logistics`
   - **Rôle**: LOGISTICIAN
   - **Problème**: Incohérence de couleurs (stone vs slate)
   - **Impact utilisateur**: Incohérence visuelle
   - **Priorité**: P3
   - **Recommandation**: Uniformiser en slate

2. **Page**: `/dashboard/logistician`
   - **Rôle**: LOGISTICIAN
   - **Problème**: Couleurs génériques (emerald)
   - **Impact utilisateur**: Pas d'identité Château
   - **Priorité**: P3
   - **Recommandation**: Intégrer les couleurs du Château

---

## 7. CLIENT

### Mission
Réserver, consulter ses réservations, paiements/factures, fidélité, gérer ses lieux et transmettre les informations nécessaires à la livraison/prestation.

### Forces
- ✅ Personnalisation (Bonjour + nom)
- ✅ Programme fidélité mis en avant
- ✅ Réservations à venir visibles
- ✅ Actions simples et claires
- ✅ Couleur amber chaleureuse pour fidélité
- ✅ Page réservations historique bien structurée
- ✅ Parcours de réservation public bien conçu (wizard)

### Faiblesses
- ❌ **Réservations limitées à 3 dans le dashboard** - Vue partielle
- ❌ **Pas de section "Historique" détaillé** - Réservations passées non visibles
- ❌ **Pas de vue sur les paiements effectués** - Historique absent
- ❌ **Section fidélité peu actionable** - Pas de récompenses visibles
- ❌ **Pas de section "Suggestions personnalisées"** - Pas d'upselling
- ❌ **Parcours réservation pas d'état loading** - Spinner absent pendant la soumission

### Problèmes P0
- **Aucun** - Le dashboard est fonctionnel

### Problèmes P1
1. **Page**: `/dashboard/client`
   - **Rôle**: CLIENT
   - **Problème**: Réservations à venir limitées à 3 dans la liste
   - **Impact utilisateur**: Vue partielle, le client ne voit pas toutes ses réservations
   - **Priorité**: P1
   - **Recommandation**: Augmenter à 5 ou ajouter pagination

2. **Page**: `/dashboard/client`
   - **Rôle**: CLIENT
   - **Problème**: Pas de vue sur les paiements effectués
   - **Impact utilisateur**: Le client ne peut pas consulter son historique de paiements
   - **Priorité**: P1
   - **Recommandation**: Ajouter une section "Historique des paiements"

3. **Page**: `/reserver` (BookingWizardClient)
   - **Rôle**: CLIENT
   - **Problème**: Pas d'état loading pendant la soumission (spinner présent mais affichage basique)
   - **Impact utilisateur**: Feedback visuel insuffisant
   - **Priorité**: P1
   - **Recommandation**: Améliorer l'état loading avec skeleton ou meilleur feedback

### Problèmes P2
1. **Page**: `/dashboard/client`
   - **Rôle**: CLIENT
   - **Problème**: Section fidélité peu actionable (pas de récompenses disponibles)
   - **Impact utilisateur**: Le client ne voit pas l'intérêt du programme
   - **Priorité**: P2
   - **Recommandation**: Ajouter une section "Récompenses disponibles"

2. **Page**: `/dashboard/client`
   - **Rôle**: CLIENT
   - **Problème**: Pas de section "Suggestions personnalisées"
   - **Impact utilisateur**: Manque d'upselling
   - **Priorité**: P2
   - **Recommandation**: Ajouter des suggestions basées sur l'historique

### Problèmes P3
1. **Page**: `/dashboard/client`
   - **Rôle**: CLIENT
   - **Problème**: Couleurs génériques (amber pour fidélité)
   - **Impact utilisateur**: Pas d'identité Château
   - **Priorité**: P3
   - **Recommandation**: Intégrer les couleurs du Château (or)

---

## 8. Navigation globale

### Sidebar (AppSidebar.tsx)
**État actuel**:
- Fond slate-900 (sombre)
- Largeur fixe 64px (w-64)
- Logo Château du Mwana en haut
- Navigation filtrée par rôle
- Section "Navigation" avec label uppercase
- Section "Paramètres" en bas
- Active state: bg-indigo-500/10 + text-indigo-400
- Hover state: hover:bg-slate-800/50 + hover:text-white

**Mobile**:
- Toggle button fixe en bas à droite (indigo-600)
- Overlay avec backdrop-blur-sm
- Animation transform avec transition-duration-300

**Évaluation**:
✅ **POSITIF**:
- Filtrage par rôle fonctionne correctement
- Active state clair
- Mobile toggle bien placé
- Animation fluide

❌ **NÉGATIF**:
- Fond très sombre (slate-900) peut être trop contrasté pour l'identité premium
- Pas de collapse/expand sur desktop
- Section "Navigation" label utile mais pourrait être plus descriptif
- Pas de badge de notification sur les items
- Icons statiques (pas d'indicateur d'urgence)
- Pas de regroupement logique (tous les items à plat)

### Header (AppHeader.tsx)
**État actuel**:
- Fond blanc avec backdrop-blur-md
- Hauteur fixe 64px (h-16)
- Barre de recherche (desktop uniquement)
- Bouton notifications avec badge rouge
- Profil utilisateur avec nom + badge rôle
- Bouton logout

**Évaluation**:
✅ **POSITIF**:
- Sticky top pratique
- Badge rôle coloré par rôle
- Barre de recherche visible
- Bouton logout accessible

❌ **NÉGATIF**:
- Barre de recherche placeholder (non fonctionnelle)
- Badge notification statique (toujours 1, pas dynamique)
- Pas de menu dropdown utilisateur
- Pas de lien vers le profil depuis le header

### Problèmes P1
1. **Page**: Toutes les pages (Sidebar)
   - **Rôle**: Tous
   - **Problème**: Sidebar fond très sombre (slate-900), pas adapté à l'identité premium
   - **Impact utilisateur**: Incohérence avec l'identité Château
   - **Priorité**: P1
   - **Recommandation**: Utiliser une couleur plus premium (ex: noir profond ou couleur du Château)

2. **Page**: Toutes les pages (Header)
   - **Rôle**: Tous
   - **Problème**: Badge notification statique (toujours 1)
   - **Impact utilisateur**: Badge trompeur
   - **Priorité**: P1
   - **Recommandation**: Rendre dynamique avec le nombre réel de notifications non lues

3. **Page**: Toutes les pages (Header)
   - **Rôle**: Tous
   - **Problème**: Barre de recherche placeholder (non fonctionnelle)
   - **Impact utilisateur**: Frustration, cliquer sur un élément non fonctionnel
   - **Priorité**: P1
   - **Recommandation**: Rendre fonctionnelle ou retirer

### Problèmes P2
1. **Page**: Toutes les pages (Sidebar)
   - **Rôle**: Tous
   - **Problème**: Pas de collapse/expand sur desktop
   - **Impact utilisateur**: Espace non optimisé
   - **Priorité**: P2
   - **Recommandation**: Ajouter un bouton collapse/expand

2. **Page**: Toutes les pages (Sidebar)
   - **Rôle**: Tous
   - **Problème**: Pas de badge de notification sur les items
   - **Impact utilisateur**: Notifications non visibles
   - **Priorité**: P2
   - **Recommandation**: Ajouter des badges sur les items concernés

### Problèmes P3
1. **Page**: Toutes les pages (Header)
   - **Rôle**: Tous
   - **Problème**: Pas de menu dropdown utilisateur
   - **Impact utilisateur**: Navigation limitée
   - **Priorité**: P3
   - **Recommandation**: Ajouter un menu dropdown avec profil, paramètres, logout

---

## 9. Responsive

### État actuel
- **Mobile**: Sidebar cachée par défaut, toggle button en bas à droite
- **Tablet**: Grille sm:grid-cols-2
- **Desktop**: Grille lg:grid-cols-4
- **Header**: Barre de recherche cachée sur mobile

**Évaluation**:
✅ **POSITIF**:
- Grilles adaptatives (sm:grid-cols-2, lg:grid-cols-4)
- Mobile toggle bien placé
- Typographie responsive (text-2xl md:text-3xl)

❌ **NÉGATIF**:
- Sidebar width fixe (w-64) - pas adaptative
- Pas de breakpoint tablette spécifique
- Hero sections compressées sur mobile
- Pas de vue mobile spécifique pour les tableaux
- Tableaux horizontaux non optimisés pour mobile

### Problèmes P1
1. **Page**: Toutes les pages (Sidebar)
   - **Rôle**: Tous
   - **Problème**: Sidebar width fixe (w-64) sur mobile/tablette
   - **Impact utilisateur**: Espace non optimisé
   - **Priorité**: P1
   - **Recommandation**: Rendre la sidebar adaptative (width variable par breakpoint)

2. **Page**: `/admin/reservations`, `/admin/crm`, `/admin/users`
   - **Rôle**: ADMIN, SUPERVISOR, SECRETARY
   - **Problème**: Tableaux horizontaux non optimisés pour mobile
   - **Impact utilisateur**: Tableaux inutilisables sur mobile
   - **Priorité**: P1
   - **Recommandation**: Transformer en vue cartes sur mobile

### Problèmes P2
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Hero sections compressées sur mobile
   - **Impact utilisateur**: Vue réduite
   - **Priorité**: P2
   - **Recommandation**: Adapter les hero sections pour mobile (stack vertical)

2. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas de breakpoint tablette spécifique
   - **Impact utilisateur**: Vue non optimisée pour tablette
   - **Priorité**: P2
   - **Recommandation**: Ajouter des breakpoints spécifiques tablette

### Problèmes P3
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Boutons trop petits sur mobile
   - **Impact utilisateur**: Difficulté de clic
   - **Priorité**: P3
   - **Recommandation**: Augmenter la taille des boutons sur mobile

---

## 10. Accessibilité

### État actuel
- **Reduced motion**: Media query prefers-reduced-motion dans globals.css
- **Contraste**: Slate-900 sur fond blanc - OK
- **Icons**: Lucide React (pas de text alternatives visibles)
- **Forms**: Labels présents
- **Focus**: Ring focus sur inputs

**Évaluation**:
✅ **POSITIF**:
- Reduced motion supporté
- Contraste général OK
- Focus states visibles

❌ **NÉGATIF**:
- Icons sans aria-label
- Pas de skip links
- Color coding only (pas de patterns pour les daltoniens)
- Pas de text alternatives pour les images
- Badge notification sans aria-live
- Structure des titres non optimisée

### Problèmes P0
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Icons sans aria-label
   - **Impact utilisateur**: Non accessible pour les lecteurs d'écran
   - **Priorité**: P0
   - **Recommandation**: Ajouter des aria-label sur tous les icons

2. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Color coding only (pas de patterns pour les daltoniens)
   - **Impact utilisateur**: Non accessible pour les daltoniens
   - **Priorité**: P0
   - **Recommandation**: Ajouter des patterns (texture, icons) en plus des couleurs

### Problèmes P1
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas de skip links
   - **Impact utilisateur**: Navigation clavier difficile
   - **Priorité**: P1
   - **Recommandation**: Ajouter des skip links pour la navigation clavier

2. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Badge notification sans aria-live
   - **Impact utilisateur**: Non accessible pour les lecteurs d'écran
   - **Priorité**: P1
   - **Recommandation**: Ajouter aria-live sur le badge notification

### Problèmes P2
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Structure des titres non optimisée
   - **Impact utilisateur**: Navigation par titres difficile
   - **Priorité**: P2
   - **Recommandation**: Optimiser la hiérarchie des titres (h1, h2, h3)

2. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas de text alternatives pour les images
   - **Impact utilisateur**: Non accessible pour les lecteurs d'écran
   - **Priorité**: P2
   - **Recommandation**: Ajouter des alt text sur toutes les images

### Problèmes P3
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Labels des formulaires non optimisés
   - **Impact utilisateur**: Compréhension difficile
   - **Priorité**: P3
   - **Recommandation**: Améliorer les labels des formulaires

---

## 11. États UX

### Loading
**État actuel**: Aucun état loading visible dans les dashboards.

**Évaluation**:
❌ **NÉGATIF**:
- Pas de skeleton screens
- Pas de spinners
- Pas de placeholders
- Les données sont chargées côté serveur mais pas d'indicateur visuel

**BookingWizardClient**: Spinner présent pendant la soumission mais affichage basique.

### Empty
**État actuel**: Messages textuels simples ("Aucune activité récente", "Aucun message non lu").

**Évaluation**:
✅ **POSITIF**:
- Messages clairs en français
- Icons présents (CheckCircle, CalendarDays)

❌ **NÉGATIF**:
- Pas d'illustrations
- Pas de CTA dans les empty states
- Messages uniformes (pas personnalisés par contexte)

### Error
**État actuel**: Aucun état error visible dans les dashboards.

**Évaluation**:
❌ **NÉGATIF**:
- Pas de boundary components
- Pas de messages d'erreur
- Pas de retry mechanisms

**BookingWizardClient**: Message d'erreur présent mais affichage basique.

### Success
**État actuel**: Aucun état success visible (pas de toasts, confirmations).

**Évaluation**:
❌ **NÉGATIF**:
- Pas de toast notifications
- Pas de confirmations visuelles après actions
- Pas de feedback utilisateur

**BookingWizardClient**: État success présent (step 5) mais pas réutilisé ailleurs.

### Disabled
**État actuel**: Boutons avec hover states mais pas de disabled states visibles.

**Évaluation**:
❌ **NÉGATIF**:
- Pas de disabled states définis
- Pas de loading states sur les boutons

### Unauthorized
**État actuel**: Redirection via requireRole() - pas de page d'erreur dédiée.

**Évaluation**:
✅ **POSITIF**:
- Redirection automatique
- Messages d'erreur côté serveur

❌ **NÉGATIF**:
- Pas de page 403 personnalisée
- Pas de message d'erreur côté client

### Problèmes P0
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas d'états loading (skeleton screens, spinners)
   - **Impact utilisateur**: Pas de feedback visuel lors du chargement
   - **Priorité**: P0
   - **Recommandation**: Ajouter des skeleton screens ou spinners

2. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas d'états error (boundary components)
   - **Impact utilisateur**: Pas de gestion des erreurs
   - **Priorité**: P0
   - **Recommandation**: Ajouter des boundary components et messages d'erreur

### Problèmes P1
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Empty states basiques (pas d'illustrations, pas de CTAs)
   - **Impact utilisateur**: Expérience utilisateur pauvre
   - **Priorité**: P1
   - **Recommandation**: Améliorer les empty states avec illustrations et CTAs

2. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas d'états success (toasts, confirmations)
   - **Impact utilisateur**: Pas de feedback après actions
   - **Priorité**: P1
   - **Recommandation**: Ajouter des toast notifications

### Problèmes P2
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas d'états disabled sur les boutons
   - **Impact utilisateur**: Boutons actifs quand ils ne devraient pas l'être
   - **Priorité**: P2
   - **Recommandation**: Ajouter des disabled states

2. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas de page 403 personnalisée
   - **Impact utilisateur**: Message d'erreur générique
   - **Priorité**: P2
   - **Recommandation**: Créer une page 403 personnalisée

### Problèmes P3
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas d'états loading sur les boutons
   - **Impact utilisateur**: Feedback insuffisant
   - **Priorité**: P3
   - **Recommandation**: Ajouter des loading states sur les boutons

---

## 12. Parcours réservation

### Parcours actuel
1. Connexion (optionnelle)
2. `/reserver` → Sélection formule
3. Date & Heure
4. Participants
5. Lieu
6. Récapitulatif
7. Confirmation

### Évaluation
✅ **POSITIF**:
- Wizard bien structuré (4 étapes + succès)
- Progression claire (stepper visuel)
- Récapitulatif détaillé
- État success bien conçu
- Animations Framer Motion présentes (slide transitions)
- Feedback d'erreur présent
- Indicateur de capacité (max participants)

❌ **NÉGATIF**:
- Pas d'état loading amélioré (spinner basique)
- Pas de validation en temps réel
- Pas de disponibilité temps réel
- Lieu limité aux lieux enregistrés (pas de création de lieu)
- Pas de sélection d'options supplémentaires
- Pas de calcul dynamique du prix (formule fixe)
- Pas de réduction fidélité appliquée
- Pas de suggestion de formules similaires

### Problèmes P1
1. **Page**: `/reserver` (BookingWizardClient)
   - **Rôle**: CLIENT
   - **Problème**: Pas de disponibilité temps réel
   - **Impact utilisateur**: Le client peut réserver une date non disponible
   - **Priorité**: P1
   - **Recommandation**: Ajouter une vérification de disponibilité en temps réel

2. **Page**: `/reserver` (BookingWizardClient)
   - **Rôle**: CLIENT
   - **Problème**: Lieu limité aux lieux enregistrés (pas de création de lieu)
   - **Impact utilisateur**: Le client ne peut pas créer son propre lieu
   - **Priorité**: P1
   - **Recommandation**: Ajouter une option "Autre lieu" avec formulaire de création

### Problèmes P2
1. **Page**: `/reserver` (BookingWizardClient)
   - **Rôle**: CLIENT
   - **Problème**: Pas de validation en temps réel
   - **Impact utilisateur**: Erreurs détectées tardivement
   - **Priorité**: P2
   - **Recommandation**: Ajouter une validation en temps réel

2. **Page**: `/reserver` (BookingWizardClient)
   - **Rôle**: CLIENT
   - **Problème**: Pas de calcul dynamique du prix (formule fixe)
   - **Impact utilisateur**: Pas de transparence sur le prix
   - **Priorité**: P2
   - **Recommandation**: Ajouter un calcul dynamique du prix

### Problèmes P3
1. **Page**: `/reserver` (BookingWizardClient)
   - **Rôle**: CLIENT
   - **Problème**: Pas de suggestion de formules similaires
   - **Impact utilisateur**: Manque d'upselling
   - **Priorité**: P3
   - **Recommandation**: Ajouter des suggestions de formules similaires

---

## 13. Parcours lieu / livraison

### Modèle métier
Le Château du Mwana ne possède PAS un espace de jeu fixe où le client vient jouer. Le Château installe les équipements sur le lieu fourni par le client.

### État actuel
- **Schema**: Location avec address, city, commune, quartier, repère, instructions d'accès, téléphone, latitude, longitude
- **Dashboard ADMIN**: Pas de vue sur les lieux
- **Dashboard SUPERVISOR**: Pas de vue sur les lieux
- **Dashboard LOGISTICIAN**: Pas de vue sur les lieux
- **Dashboard CLIENT**: Pas de gestion des lieux
- **Parcours réservation**: Sélection de lieu limitée aux lieux enregistrés
- **Détail réservation**: Affichage du lieu avec liens Google Maps et Apple Maps

### Évaluation
✅ **POSITIF**:
- Schema complet avec tous les champs nécessaires
- Liens Google Maps et Apple Maps dans le détail réservation
- Instructions d'accès affichées
- Téléphone du lieu affiché

❌ **NÉGATIF**:
- Pas de gestion des lieux par le client
- Pas de création de lieu dans le parcours réservation
- Pas de vue sur les lieux dans les dashboards
- Logistique ne voit pas les emplacements de stockage
- Pas de carte interactive
- Pas de validation de l'adresse
- Pas de calcul de distance

### Problèmes P1
1. **Page**: `/dashboard/client`
   - **Rôle**: CLIENT
   - **Problème**: Pas de gestion des lieux par le client
   - **Impact utilisateur**: Le client ne peut pas gérer ses lieux
   - **Priorité**: P1
   - **Recommandation**: Ajouter une section "Mes lieux" dans le dashboard client

2. **Page**: `/reserver` (BookingWizardClient)
   - **Rôle**: CLIENT
   - **Problème**: Pas de création de lieu dans le parcours réservation
   - **Impact utilisateur**: Le client ne peut pas créer son propre lieu
   - **Priorité**: P1
   - **Recommandation**: Ajouter une option "Autre lieu" avec formulaire de création

### Problèmes P2
1. **Page**: `/dashboard/logistician`
   - **Rôle**: LOGISTICIAN
   - **Problème**: Pas de vue sur les emplacements de stockage
   - **Impact utilisateur**: Le logisticien ne sait pas où se trouve le stock
   - **Priorité**: P2
   - **Recommandation**: Ajouter une section "Emplacements" avec la localisation du stock

2. **Page**: `/dashboard/admin`, `/dashboard/supervisor`
   - **Rôle**: ADMIN, SUPERVISOR
   - **Problème**: Pas de vue sur les lieux
   - **Impact utilisateur**: Pas de supervision des lieux
   - **Priorité**: P2
   - **Recommandation**: Ajouter une section "Lieux" dans les dashboards

### Problèmes P3
1. **Page**: Toutes les pages
   - **Rôle**: Tous
   - **Problème**: Pas de carte interactive
   - **Impact utilisateur**: Visualisation limitée
   - **Priorité**: P3
   - **Recommandation**: Ajouter une carte interactive pour visualiser les lieux

2. **Page**: `/reserver` (BookingWizardClient)
   - **Rôle**: CLIENT
   - **Problème**: Pas de validation de l'adresse
   - **Impact utilisateur**: Adresse invalide possible
   - **Priorité**: P3
   - **Recommandation**: Ajouter une validation de l'adresse

---

## 14. Identité visuelle

### Références Château du Mwana
- **Couleurs**: Or (#FBBF24), Rouge (#D72638), Vert (#3A7D44)
- **Fonts**: Quicksand (friendly), Playfair Display (premium)
- **Logo**: /images/logo.png
- **Images**: Formules et prestations dans /images/

### État actuel
- **Dashboards admin**: Slate (#0F172A, #F8FAFC, #E2E8F0) + Indigo-600
- **Public**: Or, Rouge, Vert utilisés
- **Fonts**: Inter utilisé partout, Quicksand et Playfair Display non utilisés
- **Images**: Non utilisées dans les dashboards

### Évaluation
❌ **NÉGATIF**:
- Les dashboards admin n'utilisent PAS les couleurs du Château
- Les fonts premium ne sont pas utilisées
- Les images de formules/prestations ne sont pas affichées
- L'identité premium n'est pas présente dans les dashboards
- Aspect SaaS générique

### Problèmes P1
1. **Page**: Toutes les pages admin
   - **Rôle**: ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN
   - **Problème**: Les dashboards admin n'utilisent PAS les couleurs du Château (or, rouge, vert)
   - **Impact utilisateur**: Incohérence avec l'identité Château
   - **Priorité**: P1
   - **Recommandation**: Intégrer les couleurs du Château dans les dashboards admin

2. **Page**: Toutes les pages admin
   - **Rôle**: ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN
   - **Problème**: Les fonts premium (Quicksand, Playfair Display) ne sont pas utilisées
   - **Impact utilisateur**: Pas d'identité premium
   - **Priorité**: P1
   - **Recommandation**: Utiliser Quicksand pour les titres et Playfair Display pour les éléments premium

### Problèmes P2
1. **Page**: Toutes les pages admin
   - **Rôle**: ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN
   - **Problème**: Les images de formules/prestations ne sont pas affichées
   - **Impact utilisateur**: Interface purement textuelle
   - **Priorité**: P2
   - **Recommandation**: Ajouter les images de formules/prestations dans les dashboards

### Problèmes P3
1. **Page**: Toutes les pages admin
   - **Rôle**: ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN
   - **Problème**: Aspect SaaS générique
   - **Impact utilisateur**: Pas d'identité Château
   - **Priorité**: P3
   - **Recommandation**: Ajouter des éléments visuels spécifiques au Château

---

## 15. Animations futures

### Concept "LA MAGIE DU CHÂTEAU"
- Ligne architecturale du Château
- Lumière
- Révélation
- Mouvement élégant
- Particules très subtiles
- Transitions organiques
- Micro-interactions premium

### État actuel
- **BookingWizardClient**: Animations Framer Motion présentes (slide transitions)
- **Logistics page**: Animation animate-in fade-in slide-in-from-bottom-4
- **Dashboard public**: FadeIn component
- **Dashboards admin**: Aucune animation

### Emplacements futurs pertinents
1. **Hero sections** - Révélation des KPIs avec animation
2. **Transitions de sections** - Slide organique entre sections
3. **Cartes de formules** - Hover élégant avec micro-interactions
4. **Galerie** - Masonry avec animations de révélation
5. **Confirmation de réservation** - Animation de succès "magique"
6. **États de succès** - Confettis ou particules subtiles
7. **Navigation** - Transitions fluides entre pages

### Problèmes P3
1. **Page**: Toutes les pages admin
   - **Rôle**: Tous
   - **Problème**: Aucune animation dans les dashboards admin
   - **Impact utilisateur**: Interface statique
   - **Priorité**: P3
   - **Recommandation**: Ajouter des animations subtiles conformes au concept "Magie du Château"

---

## 16. Écarts avec les références visuelles

### Références disponibles
- **Logo**: /images/logo.png
- **Formules**: Images dans /images/Nos Formules/
- **Prestations**: Images dans /images/Prestations/

### Écarts
❌ **NÉGATIF**:
- Les dashboards admin n'utilisent pas le logo (sidebar utilise /images/logo.png mais pas dans le design)
- Les images de formules ne sont pas affichées dans les dashboards
- Les images de prestations ne sont pas affichées dans les dashboards
- Les couleurs du logo ne sont pas utilisées dans les dashboards
- L'identité visuelle du Château n'est pas présente

### Problèmes P2
1. **Page**: Toutes les pages admin
   - **Rôle**: ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN
   - **Problème**: Les images de formules ne sont pas affichées
   - **Impact utilisateur**: Interface purement textuelle
   - **Priorité**: P2
   - **Recommandation**: Ajouter les images de formules dans les dashboards

2. **Page**: Toutes les pages admin
   - **Rôle**: ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN
   - **Problème**: Les images de prestations ne sont pas affichées
   - **Impact utilisateur**: Interface purement textuelle
   - **Priorité**: P2
   - **Recommandation**: Ajouter les images de prestations dans les dashboards

### Problèmes P3
1. **Page**: Toutes les pages admin
   - **Rôle**: ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN
   - **Problème**: Les couleurs du logo ne sont pas utilisées
   - **Impact utilisateur**: Incohérence avec l'identité
   - **Priorité**: P3
   - **Recommandation**: Intégrer les couleurs du logo dans les dashboards

---

## 17. Matrice P0/P1/P2/P3

### P0 - BLOQUANT (3 problèmes)
1. Icons sans aria-label (Accessibilité)
2. Color coding only (Accessibilité)
3. Pas d'états loading (États UX)
4. Pas d'états error (États UX)

### P1 - MAJEUR (15 problèmes)
1. Section "Alertes" statique (ADMIN)
2. Section "Performance" vide (ADMIN)
3. Pas de section hero (ADMIN)
4. Hero section peu actionable (SUPERVISOR)
5. Pas de vue sur les équipes (SUPERVISOR)
6. Réservations limitées à 7 jours (SUPERVISOR)
7. Pas de section "À traiter en priorité" (SECRETARY)
8. Messages non lus limités à 5 (SECRETARY)
9. Chiffre d'affaires statique (SECRETARY)
10. Pas de vue sur les emplacements (LOGISTICIAN)
11. Pas de vue sur les équipes (LOGISTICIAN)
12. Livraisons limitées à 2 métriques (LOGISTICIAN)
13. Réservations limitées à 3 (CLIENT)
14. Pas de vue sur les paiements (CLIENT)
15. Sidebar fond trop sombre (Navigation)
16. Badge notification statique (Navigation)
17. Barre de recherche placeholder (Navigation)
18. Pas de skip links (Accessibilité)
19. Badge notification sans aria-live (Accessibilité)
20. Pas de disponibilité temps réel (Parcours réservation)
21. Pas de création de lieu (Parcours réservation)
22. Pas de gestion des lieux (CLIENT)
23. Couleurs du Château non utilisées (Identité visuelle)
24. Fonts premium non utilisées (Identité visuelle)

### P2 - IMPORTANT (20 problèmes)
1. Pas de section "À traiter aujourd'hui" (ADMIN)
2. Activité récente limitée à 5 (ADMIN)
3. Incidents non hiérarchisés (SUPERVISOR)
4. Maintenance limitée à 5 (SUPERVISOR)
5. Appels à venir manquants (SECRETARY)
6. Nouveaux clients limités (SECRETARY)
7. Incidents non hiérarchisés (LOGISTICIAN)
8. Maintenance limitée à 5 (LOGISTICIAN)
9. Incohérence stone/slate (LOGISTICIAN)
10. Section fidélité peu actionable (CLIENT)
11. Suggestions personnalisées manquantes (CLIENT)
12. Sidebar collapse/expand (Navigation)
13. Badges notification sur items (Navigation)
14. Tableaux non optimisés mobile (Responsive)
15. Hero sections compressées mobile (Responsive)
16. Structure des titres (Accessibilité)
17. Text alternatives images (Accessibilité)
18. Empty states basiques (États UX)
19. Pas d'états success (États UX)
20. Pas d'états disabled (États UX)
21. Validation en temps réel (Parcours réservation)
22. Calcul dynamique prix (Parcours réservation)
23. Vue emplacements stockage (Parcours lieu)
24. Vue lieux dashboards (Parcours lieu)
25. Images formules non affichées (Identité visuelle)

### P3 - FINITION (15 problèmes)
1. Personnalisation visuelle (ADMIN)
2. Couleurs génériques (SUPERVISOR)
3. Couleurs génériques (SECRETARY)
4. Incohérence stone/slate (LOGISTICIAN)
5. Couleurs génériques (CLIENT)
6. Menu dropdown utilisateur (Navigation)
7. Boutons trop petits mobile (Responsive)
8. Labels formulaires (Accessibilité)
9. États loading boutons (États UX)
10. Page 403 personnalisée (États UX)
11. Suggestions formules (Parcours réservation)
12. Carte interactive (Parcours lieu)
13. Validation adresse (Parcours lieu)
14. Aspect SaaS générique (Identité visuelle)
15. Animations dashboards admin (Animations futures)

---

## 18. Top 20 des corrections recommandées

1. **Ajouter des états loading** (skeleton screens, spinners) - P0
2. **Ajouter des états error** (boundary components) - P0
3. **Ajouter des aria-label sur les icons** - P0
4. **Ajouter des patterns pour les daltoniens** (texture, icons) - P0
5. **Connecter la section "Alertes" aux notifications réelles** (ADMIN) - P1
6. **Ajouter des KPIs de performance** (ADMIN) - P1
7. **Ajouter une section hero** (ADMIN) - P1
8. **Ajouter des boutons d'action rapide dans la hero section** (SUPERVISOR) - P1
9. **Ajouter une vue sur les équipes** (SUPERVISOR) - P1
10. **Ajouter un sélecteur de période** (SUPERVISOR) - P1
11. **Ajouter une section "Priorités du jour"** (SECRETARY) - P1
12. **Augmenter les messages non lus à 10** (SECRETARY) - P1
13. **Ajouter un indicateur d'évolution** (SECRETARY) - P1
14. **Ajouter une vue sur les emplacements** (LOGISTICIAN) - P1
15. **Ajouter une vue sur les équipes** (LOGISTICIAN) - P1
16. **Augmenter les réservations à 5** (CLIENT) - P1
17. **Ajouter une vue sur les paiements** (CLIENT) - P1
18. **Intégrer les couleurs du Château** (Identité visuelle) - P1
19. **Utiliser Quicksand pour les titres** (Identité visuelle) - P1
20. **Améliorer les empty states** (États UX) - P1

---

## 19. Ce qui NE DOIT PAS être modifié

✅ **Architecture**: Layout Sidebar + Header + Main content
✅ **RBAC**: Rôles et permissions
✅ **Schema Prisma**: Structure de la base de données
✅ **Migrations**: Aucune migration
✅ **Services métier**: Logique métier existante
✅ **Server Actions**: Actions serveur existantes
✅ **Authentification**: Supabase Auth
✅ **Bridge 1**: Réservations, CRM, fidélité
✅ **Bridge 2**: 5 dashboards distincts
✅ **Bridge 3**: Localisation
✅ **Données réelles**: Pas de fake data

---

## 20. Conclusion

### État global
Les 5 dashboards sont **fonctionnels** et **distincts** dans leur mission respective:
- ADMIN: Pilotage global
- SUPERVISOR: Supervision opérationnelle
- SECRETARY: Gestion administrative/commerciale
- LOGISTICIAN: Opérations logistiques
- CLIENT: Espace personnel

### Forces
- ✅ Architecture claire et cohérente
- ✅ RBAC bien implémenté
- ✅ Données réelles (pas de fake data)
- ✅ Navigation intuitive
- ✅ Responsive de base
- ✅ Parcours réservation bien conçu

### Faiblesses principales
- ❌ **Identité visuelle absente** - Les dashboards n'utilisent pas les couleurs/fonts du Château
- ❌ **États UI manquants** - Loading, error, success absents ou basiques
- ❌ **Accessibilité incomplète** - Icons sans aria-label, color coding only
- ❌ **Incohérence visuelle** - Chaque dashboard a sa propre palette
- ❌ **Sections statiques** - Alertes, performance non dynamiques

### Recommandation principale
**NE PAS refaire les 5 dashboards avec le même template.**

Les 5 espaces doivent:
1. **Partager l'identité** du Château du Mwana (couleurs or/rouge/vert, fonts Quicksand/Playfair)
2. **Conserver leurs missions distinctes** (structure et KPIs adaptés)
3. **Uniformiser le design system** (couleurs, espacements, composants)
4. **Améliorer les états UI** (loading, error, success, empty)
5. **Améliorer l'accessibilité** (aria-label, skip links, patterns)

### Pages qui donnent encore une impression de prototype
- `/dashboard/admin` - Section alertes statique, performance vide
- `/dashboard/supervisor` - Hero peu actionable
- `/dashboard/secretary` - Pas de priorités
- `/dashboard/logistician` - Pas d'emplacements
- `/dashboard/client` - Réservations limitées
- `/admin/reservations/new` - Page placeholder
- Toutes les pages admin - Couleurs génériques, pas d'identité Château

---

## BRIDGE 4 STATUS

**AUDIT ONLY**

**Tests**: NON EXÉCUTÉS (audit uniquement)

**Fichiers modifiés**: BRIDGE_4_UX_UI_AUDIT.md uniquement

**Aucune modification de code effectuée.**
