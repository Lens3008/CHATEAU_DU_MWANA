# BRIDGE MASTER — AUDIT TOTAL

## 1. Identité du projet

- Projet vérifié : `C:\laragon\www\CHATEAU DU MWANA`
- Cwd confirmé exactement sur ce chemin.
- Présence vérifiée : `prisma/schema.prisma`, `prisma/`, `src/app/`, `src/components/`, `src/lib/`, `package.json`, rapports `BRIDGE_4_*`.
- Stack actuelle : Next.js 16.3.4, React 19, TypeScript, App Router, Tailwind CSS v4, Supabase Auth, Supabase/PostgreSQL, Prisma Next/Postgres ORM.

## 2. Commit / branche / état Git

- Branche : `master`
- HEAD : `8d3e1291932fcadff709509c53095516dcc04426`
- Aucun commit/push/reset/checkout/clean/revert/merge/pull n'a été effectué pendant cet audit.
- Le checkout était déjà fortement modifié et contenait de nombreux fichiers non suivis. Ils ont été conservés.
- Le seul fichier créé par cet audit est `BRIDGE_MASTER_TOTAL_AUDIT_CHATEAU_DU_MWANA.md`.
- Les modifications antérieures visibles dans `git status` ne sont pas attribuées à cet audit.

## 3. Architecture actuelle

```text
Next.js App Router / React
        ↓
Server Components / Server Actions / route handlers
        ↓
Supabase Auth + requireAuth / requireRole
        ↓
services métier
        ↓
Prisma Next ORM / SQL paramétré
        ↓
PostgreSQL / Supabase
```

L'application sépare partiellement les lectures d'écran, les Server Actions et les services métier. Les services existent pour réservation, disponibilité, paiement, facture, CRM, fidélité, logistique, CMS, médias, notifications, analytics et audit.

## 4. Évolution par rapport au cahier

La stack actuelle est une évolution technologique vers Next.js/App Router/Server Actions/Prisma Next. Cette évolution n'est pas, en elle-même, une non-conformité fonctionnelle.

### EVOLUTION ARCHITECTURALE

- l'ancien cahier/les anciens rapports peuvent évoquer une organisation différente ;
- le code actuel utilise `db.orm.public`, `db.transaction` et des Server Actions ;
- les objectifs fonctionnels ne sont considérés comme réalisés que lorsque le workflow est prouvé, pas parce qu'une route ou un service existe.

## 5. Résumé exécutif

Le projet possède une base fonctionnelle large et compile. Les pages publiques principales, l'authentification de base, le catalogue public, la création de réservation et plusieurs lectures de dashboards sont présentes.

Les limites majeures constatées :

- paiement et facturation ont été branchés au frontend dans le Bloc 2.2, mais aucun test E2E authentifié avec écriture n'a été possible ; leur statut reste donc non validé ;
- plusieurs boutons logistiques, catalogue, maintenance, CRM et encaissement historique restent décoratifs ou partiellement câblés ;
- `/admin/crm` et `/admin/cms` lèvent `Unauthorized` en accès anonyme et ont produit HTTP 500 lors du smoke test, au lieu d'une réponse protégée homogène ;
- les dashboards de rôle n'ont pas été validés avec des sessions réelles ;
- la galerie publique charge des `GalleryItem` sans champ de publication/visibilité propre ;
- la règle de publication des services/formules est générique et protège les fixtures publiques ;
- le drift Prisma/RLS précédemment documenté reste volontairement non résolu ;
- le compte de test et les réservations existent en base, mais aucune mutation financière n'a été lancée.

## 6. Matrice complète Cahier → Code

| ID | Exigence | Domaine | Écran/route | Code/backend | Workflow complet | Preuve | État | Écart | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| C01 | Site public | Public | `/` | page publique + services | lecture publique observée | HTTP 200, code | TESTÉ | pas de navigateur multi-viewport complet | P2 |
| C02 | Navigation publique | Public | `PublicHeader` | liens + menu mobile | navigation statique | `PublicHeader.tsx` | IMPLÉMENTÉ | présentation non exécutée clavier | P2 |
| C03 | Catalogue publié | Catalogue | `/services`, `/reserver` | `public-catalogue.ts` | DB → cartes/wizard | filtre availability/isPublished | TESTÉ | session réelle non requise | P1 |
| C04 | Réservation | Réservation | `/reserver` | action + service + transaction | client → DB | Playwright non destructif seulement | PARTIEL | mutation réelle bloquée | P1 |
| C05 | Disponibilité | Réservation | wizard | `availability.ts` | contrôle au submit | code + transaction | IMPLÉMENTÉ | pas d'E2E mutation | P1 |
| C06 | Paiement | Finance | détail réservation | actions + `addPayment` | UI → DB | tsc/build, pas d'E2E | PARTIEL | mutation réelle non prouvée | P0 |
| C07 | Facture | Finance | détail réservation | action + `generateInvoice` | UI → DB | tsc/build, pas d'E2E | PARTIEL | mutation réelle non prouvée | P0 |
| C08 | Dashboards | Back-office | `/dashboard/*` | pages role-gated | rôle → lectures | code, accès anonymes | PARTIEL | comptes réels non connectés | P1 |
| C09 | CRM | CRM | `/admin/crm` | actions/services | role → DB → table | code, HTTP 500 anonyme | PARTIEL | actions d'édition incomplètes | P1 |
| C10 | Fidélité | Loyalty | fiche CRM/client | summary + services earn/redeem | lecture présente | callers recherchés | PARTIEL | earn/redeem orphelins | P1 |
| C11 | Stock | Inventory | `/admin/logistics/inventory` | lectures ORM | DB → table | code | PARTIEL | boutons sans mutation | P1 |
| C12 | Maintenance | Operations | maintenance | lecture ORM | DB → table | code | PARTIEL | déclarer/clôturer non câblés | P1 |
| C13 | CMS | CMS | `/admin/cms/*` | Server Actions CRUD | action → DB | code | PARTIEL | accès anonyme HTTP 500 | P1 |
| C14 | Galerie publique | CMS | `/gallery` | GalleryItem/Media global | DB → grille | code + HTTP 200 | PARTIEL/RISK | aucune publication dédiée | P1 |
| C15 | Contact | Communication | `/contact` | action SQL INSERT | form → DB → succès | code + HTTP 200 | TESTÉ | mutation non exécutée | P2 |
| C16 | Analytics | Reporting | `/admin/analytics` | services analytics + Recharts | DB → KPI/graphiques | code/build | PARTIEL | filtres rechargent page, session absente | P2 |
| C17 | Auth/RBAC | Security | `/login`, `/dashboard` | Supabase + requireRole | session → route | Playwright anonymous | TESTÉ | rôles réels non E2E | P1 |
| C18 | RLS/Prisma | Infrastructure | DB | audits antérieurs | contract → DB | rapports Bridge | PARTIEL | drift gelé | P0 |

## 7. Audit Frontend

Routes publiques présentes :

`/`, `/presentation`, `/services`, `/gallery`, `/contact`, `/reserver`, `/page/[slug]`, `/catalogue`, `/login`, `/register`, `/auth/callback`.

Routes dashboard :

`/dashboard`, `/dashboard/client`, `/dashboard/reservations`, `/dashboard/secretary`, `/dashboard/logistician`, `/dashboard/supervisor`, `/dashboard/admin`.

Routes admin :

catalogue, réservations, CRM, analytics, logistique, CMS, contact, notifications, imports, utilisateurs.

Constats :

- les pages publiques utilisent des composants de présentation réutilisables et des données dynamiques ;
- les pages back-office mélangent composants réutilisables et markup local ;
- plusieurs pages ont loading/error boundaries de segment ;
- les tables ont des conteneurs de scroll sur certaines vues ;
- les formulaires principaux ont labels ou labels sr-only ;
- plusieurs cartes cliquables du wizard sont des `<div onClick>` et ne sont pas des contrôles clavier natifs.

## 8. Audit Backend

Services identifiés :

`availability`, `audit`, `clients`, `cms`, `contact`, `crm`, `finance`, `gallery`, `imports`, `invoice`, `logistics`, `loyalty`, `media`, `notification`, `notifications`, `payment`, `reservation`, `reservations`, `settings`, `template`, `templates`, analytics spécialisés.

Les lectures sont souvent réalisées par `db.orm.public.<Model>.all()` puis filtrées en mémoire. Cela fonctionne pour les écrans actuels mais crée des risques de performance, d'isolation et de maintenance.

Les transactions existent pour réservation, paiement, remboursement, facture et certaines écritures CMS/loyalty.

## 9. Audit des 5 dashboards

| Dashboard | Route | Données | KPI | Actions | Backend | RBAC | État |
|---|---|---|---|---|---|---|---|
| Admin | `/dashboard/admin` | réservations, clients indirects, users, stock, missions, maintenance | CA, réservations, clients, missions, incidents, maintenance, stock | liens vers CRM/logistique/CMS/analytics | ORM direct | ADMIN | PARTIEL |
| Supervisor | `/dashboard/supervisor` | réservations, missions, équipements, inventaire, maintenance, livraisons, users | opérations, incidents, stock, maintenance | liens opérationnels | ORM direct | SUPERVISOR | PARTIEL |
| Secretary | `/dashboard/secretary` | réservations, clients, invoices, contacts, catalogue | priorités, factures, CA, messages | liens réservations/contact/catalogue | ORM direct | SECRETARY | PARTIEL |
| Logistician | `/dashboard/logistician` | missions, équipements, inventaire, maintenance, livraisons, allocations, lieux | incidents, préparation, stocks, livraisons | liens logistique | ORM direct | LOGISTICIAN | PARTIEL |
| Client | `/dashboard/client` | Customer, Reservation, Invoice, Loyalty filtrés par customerId | prochaine réservation, dépenses, points, factures | réservation, historique, contact | ORM filtré | CLIENT | PARTIEL |

Le dashboard Client contient une isolation par `customerId` dans les pages lues. Une preuve Client A/Client B avec deux sessions réelles n'a pas été effectuée.

## 10. Audit UX/UI

### Public

L'identité visuelle utilise gold, rouge, vert, bleu profond, surfaces claires, logo, `Quicksand`/`Inter`/`Playfair Display`, cartes arrondies et images. Le résultat est cohérent avec une direction féerique/premium/familiale, sans preuve visuelle navigateur multi-viewport complète dans cet audit.

### Back-office

Le back-office est fonctionnellement orienté KPI/tables/cartes mais présente des styles locaux multiples, des CTA sans actions et une densité variable. La recherche header est explicitement désactivée.

## 11. Audit Design System

Variables globales dans `src/app/globals.css` :

- public/admin surfaces ;
- gold/red/green/blue ;
- success/warning/error/neutral ;
- Inter, Quicksand, Playfair Display ;
- focus ring et rayons/ombres.

Composants réutilisés :

- `Button`, `Input`, `Card`, loading/error/empty ;
- `AppHeader`, `AppSidebar`, `PublicHeader` ;
- composants Motion/Chateau ;
- `PaymentForm`, `InvoiceButton`.

Écart : les pages admin recréent encore beaucoup de cartes, boutons, tableaux et badges localement au lieu d'utiliser systématiquement les primitives.

## 12. Audit Responsive

Classes responsive présentes sur les pages publiques et dashboards (`sm`, `md`, `lg`, wrappers de tables et CTA stacks). Le smoke test HTTP a confirmé les routes, mais aucune mesure Playwright automatisée de `scrollWidth` à 375/768/1024/1440 n'a été exécutée pendant cet audit total.

État : **IMPLÉMENTÉ mais non TESTÉ** pour la preuve complète.

Risques ciblés :

- tables et dashboard denses ;
- formulaires/modal/galerie ;
- navigation publique et sidebar mobile ;
- cartes wizard sélectionnées par `<div>`.

## 13. Audit Accessibility

Points positifs :

- `aria-expanded`/`aria-controls` sur menus mobile public et sidebar ;
- labels explicites ou sr-only ;
- `Lightbox` avec `role="dialog"`, `aria-modal`, focus initial sur Fermer, Escape, trap Tab et restauration du focus ;
- messages de formulaire avec `aria-live` dans les composants récents ;
- focus styles présents sur plusieurs contrôles.

Écarts :

- cartes formule/lieu du wizard non clavier-natives ;
- aucun audit automatisé axe identifié ;
- focus/trap de chaque modal admin non démontré ;
- contraste et ordre de tabulation multi-pages non mesurés ;
- notifications header bouton sans flux.

## 14. Audit Animations

| Composant | Utilisation | Réduced motion | État |
|---|---|---|---|
| `ChateauLight` | identifié dans home/sections | `useReducedMotion` | UTILISÉ/PARTIEL |
| `ChateauImageReveal` | composant disponible | `useReducedMotion` | UTILISÉ selon appels |
| `ChateauLine` | utilisé dans pages publiques | à vérifier selon implémentation | PARTIEL |
| `ChateauHeroSequence` | non trouvé comme caller actuel | inconnu | NON UTILISÉ/ORPHELIN |
| `ChateauSectionTransition` | non trouvé comme caller actuel | inconnu | NON UTILISÉ/ORPHELIN |
| `ChateauGalleryReveal` | non trouvé comme caller actuel | inconnu | NON UTILISÉ/ORPHELIN |
| `ChateauBookingTransition` | non trouvé comme caller actuel | inconnu | NON UTILISÉ/ORPHELIN |
| `ChateauSuccessMoment` | non trouvé comme caller actuel | inconnu | NON UTILISÉ/ORPHELIN |
| `BookingWizardClient` | transitions Framer Motion entre étapes | pas de `useReducedMotion` local | PARTIEL |
| `Lightbox` | fade/scale/spring | réduction gérée | TESTÉ statiquement |

`globals.css` contient une règle `prefers-reduced-motion`, et plusieurs composants Framer Motion gèrent explicitement cette préférence. La totalité des parcours n'a pas été testée visuellement.

## 15. Audit Auth/RBAC

Auth :

- Supabase `signInWithPassword` dans `src/app/login/actions.ts` ;
- `signUp` dans la même action ;
- `signOut` dans action/header ;
- `getCurrentUser` récupère Supabase puis synchronise `User` local ;
- utilisateur inactif refusé ;
- `/dashboard` redirige par rôle.

RBAC :

- `requireAuth` ;
- `requireRole` ;
- rôles `ADMIN`, `SUPERVISOR`, `SECRETARY`, `LOGISTICIAN`, `CLIENT`.

Problèmes :

- accès anonyme à plusieurs Server Components produit `Unauthorized` côté serveur et parfois HTTP 500 (`/admin/crm`, `/admin/cms`) ;
- les dashboards de rôle n'ont pas été testés avec session réelle ;
- le rôle applicatif est séparé du bypass PostgreSQL et ne prouve pas une isolation RLS.

## 16. Audit Réservations

Chaîne :

```text
BookingWizardClient
→ createReservationAction
→ requireAuth
→ customerId session/lazy sync
→ publicFormulaOnly pour CLIENT
→ createReservation
→ transaction + FOR UPDATE
→ availability
→ Reservation + Item + History + Payment + Allocations
```

La formule est rechargée depuis le serveur et le prix vient du serveur. La capacité, les chevauchements et les ressources sont contrôlés par `checkFormulaAvailability`.

État : **IMPLÉMENTÉ**, **TESTÉ statiquement**, **non VALIDÉ E2E**.

Limites :

- le wizard collecte uniquement date/heure/participants/lieu/formule ;
- pas d'exécution avec compte Client ;
- la concurrence n'a pas été testée en environnement contrôlé ;
- plusieurs accès utilisent `.all()` et filtrage mémoire.

## 17. Audit Paiements

`addPayment` est transactionnel, verrouille le paiement, refuse montant non positif et surpaiement, crée `PaymentTransaction`, met à jour `Payment`, `Reservation.paymentStatus` et l'historique.

Bloc 2.2 :

- `addPaymentAction` ;
- `PaymentForm` ;
- historique réel ;
- méthodes `CASH`, `CARD`, `MOBILE_MONEY`, `BANK_TRANSFER`, `CHEQUE` ;
- RBAC serveur ADMIN/SECRETARY/SUPERVISOR.

`addRefund` existe mais aucun pont UI/action.

État : **PARTIEL**. Test TypeScript/build PASS ; E2E mutation BLOCKED.

## 18. Audit Facturation

`generateInvoice` :

- transaction ;
- réservation source ;
- anti-doublon active ;
- calcul depuis `ReservationItem` ;
- numéro ;
- `Invoice` + `InvoiceItem`.

Bloc 2.2 a ajouté `generateInvoiceAction` et `InvoiceButton`.

État : **PARTIEL**. Aucun PDF, aucun test E2E de génération, aucune preuve de mutation en base dans cet audit.

## 19. Audit Catalogue

Modèles :

`ServiceCategory`, `Service`, `Formula`, `ServiceResource`.

Publication :

- `Service.availability && Service.isPublished` ;
- `Formula.availability && Formula.isPublished` ;
- service parent vérifié ;
- fixtures `TEST_*` dépubliées par la migration existante et exclues du catalogue public.

Public : lectures fonctionnelles.

Admin : lectures et pages présentes, mais plusieurs boutons de création/gestion sont sans action.

État : public **TESTÉ**, admin **PARTIEL**.

## 20. Audit CRM

Actions protégées pour `ADMIN`, `SUPERVISOR`, `SECRETARY`.

Données :

- clients ;
- réservations ;
- factures ;
- paiements ;
- transactions ;
- historique timeline ;
- fidélité.

`getCustomer360Action`, `getCustomersAction`, `getCRMDashboardStatsAction` sont appelées. Le bouton `Modifier Contact` de la fiche CRM est décoratif dans le fichier audité.

État : **PARTIEL** ; accès anonyme `/admin/crm` observé en HTTP 500.

## 21. Audit Fidélité

Présent :

- `LoyaltyAccount`, `LoyaltyLevel`, `LoyaltyTransaction`, `LoyaltyReward` ;
- `getCustomerLoyaltySummaryAction` pour CRM ;
- verrou de compte dans `earnLoyaltyPoints` et `redeemLoyaltyReward`.

Orphelins :

- `earnLoyaltyPoints` sans caller UI/action ;
- `redeemLoyaltyReward` sans caller UI/action ;
- aucune permission dans ces fonctions elles-mêmes.

`getCustomerLoyaltySummary` peut créer un niveau/compte pendant une lecture.

État : lecture **IMPLÉMENTÉE**, mutations **ABSENTES de l'UI**, concurrence non E2E validée.

## 22. Audit Stock

Lectures présentes pour Inventory, allocations, équipements et emplacements.

Boutons identifiés sans action :

- Transférer ;
- Entrée/Sortie ;
- Ajuster.

État : **PARTIEL**. La réservation crée des allocations, mais les mouvements manuels ne sont pas démontrés.

## 23. Audit Équipements

Lectures Equipment/EquipmentCategory présentes.

Boutons `Nouvel équipement` et `Ajouter une famille` sans mutation identifiée.

État : **PARTIEL**.

## 24. Audit Maintenance

Lecture `EquipmentMaintenance` avec équipement/responsable.

Boutons :

- `Déclarer une panne` sans action ;
- `Clôturer` sans action.

État : **PARTIEL**, workflow maintenance non complet.

## 25. Audit Logistique

Lectures présentes :

- `LogisticsMission` ;
- `Delivery` ;
- `DeliveryItem` ;
- allocations ;
- équipements ;
- lieux.

Les dashboards calculent missions, incidents, livraisons, stock et maintenance. Les mutations de mission/livraison ne sont pas démontrées dans les pages auditées.

La cohérence `Delivery.reservationId`/`mission.reservationId` n'a pas été prouvée par un test de données complet.

État : **PARTIEL**.

## 26. Audit Livraisons

`Delivery` et `DeliveryItem` sont présents dans le schéma et lus par le dashboard/détail. Les liens UI existent vers les écrans logistiques. Les transitions d'état et création/modification de livraison ne sont pas toutes câblées.

État : **PARTIEL**.

## 27. Audit Locations

`Location` porte les champs d'adresse, ville, commune, coordonnées et instructions utilisés dans le détail réservation. La page logistique lit les emplacements.

Les boutons `Ajouter` des lieux de stockage/physiques sont sans action.

État : lectures **IMPLÉMENTÉES**, mutations **PARTIELLES**.

## 28. Audit CMS

`ContentPage` possède `isPublished`, `slug`, `seo`, contenu et dates.

Actions admin identifiées :

- create/update/delete page ;
- publication/unpublication dans service ;
- galerie ;
- médias ;
- templates ;
- settings ;
- contact.

État : **PARTIEL** :

- actions CMS existent ;
- routes admin protégées ;
- `/admin/cms` anonyme produit HTTP 500 ;
- plusieurs services utilisent `any` et des écritures SQL ;
- test E2E authentifié non réalisé.

## 29. Audit Galerie

`Gallery`, `GalleryItem`, `Media` existent.

La page publique charge tous les `GalleryItem` avec média URL. Aucun `isPublished`/`isVisible` n'existe dans ces modèles.

Le `isPublished` de `ContentPage` n'est pas réutilisable sémantiquement pour Gallery/Media.

État : **PARTIEL/RISK** : exposition publique potentielle d'éléments internes non classifiés.

## 30. Audit Notifications/Contact

Contact public :

- `ContactFormClient` ;
- `submitContactMessageAction` ;
- INSERT `ContactMessage` ;
- succès/erreur UI.

Contact admin :

- changement de statut via actions ;
- rôles ADMIN/SECRETARY, selon action.

Notifications :

- lecture et marquage read ;
- suppression/mark all dans page/actions ;
- bouton header de notifications sans flux d'affichage identifié.

WhatsApp/gateway externe : aucun branchement identifié ; aucune affirmation de disponibilité.

## 31. Audit Imports/Exports

`ImportJob`, `ImportError`, `imports-actions.ts`, `imports.ts` et pages import existent. L'accès est ADMIN/SUPERVISOR dans les pages/actions auditées.

Le test CSV/import réel n'a pas été exécuté. Export général non identifié comme workflow complet.

État : **PARTIEL**.

## 32. Audit Analytics/Rapports

Services analytics reservations, finance, clients et logistics présents. Recharts est utilisé dans `DashboardClient`.

Les filtres changent la query string et rechargent `/admin/analytics`. Les KPI sont calculés depuis réservations/paiements/transactions/inventaire.

État : **IMPLÉMENTÉ mais non validé E2E**.

Limites :

- commentaire du code indique qu'un fetch action/API pourrait être utilisé mais la page fait une navigation complète ;
- session rôle non testée ;
- chiffres DB non reproduits exhaustivement.

## 33. Audit Calendrier métier

Aucune page ou composant de calendrier métier complet couvrant réservations, disponibilité, ressources, missions, livraisons et maintenance n'a été identifié dans les routes inventoriées.

État : **ABSENT ou non démontré**. Priorité P1.

## 34. Audit Personnalisation

Présents :

- thème clair/styling ;
- sidebar par rôle ;
- badges/couleurs d'état ;
- settings CMS ;
- notifications partiellement.

Absents/non démontrés :

- thème sombre fonctionnel ;
- dashboard configurable par widgets ;
- raccourcis configurables ;
- recherche globale active ;
- personnalisation navigation par utilisateur.

État : **PARTIEL**.

## 35. Audit SEO

Des `metadata` existent sur plusieurs pages publiques et dashboards. Les titres/descriptions sont présents sur home, services, galerie, contact, réserver, dashboards.

Non identifié de façon complète :

- canonical global ;
- OpenGraph complet ;
- sitemap ;
- robots ;
- structured data ;
- audit performance SEO réel.

État : **PARTIEL**.

## 36. Audit Performance

Points à risque :

- nombreuses lectures `.all()` puis filtrage mémoire ;
- plusieurs waterfalls séquentiels dans pages/services ;
- images publiques parfois `<img>` au lieu de `next/image` ;
- framer-motion client components ;
- galerie charge tous les items ;
- analytics/grands dashboards chargent de gros ensembles.

Points positifs :

- animations majoritairement transform/opacity ;
- `next/image` utilisé pour logo/hero à plusieurs endroits ;
- build production PASS.

État : **PARTIEL**, aucune mesure Web Vitals réalisée.

## 37. Audit Sécurité

Positifs :

- Auth Supabase ;
- `requireAuth`/`requireRole` ;
- customerId dérivé session dans réservation/client ;
- paiement/facture actions serveur protégées ;
- SQL paramétré dans les interpolations observées ;
- `SUPABASE_SERVICE_ROLE_KEY` côté serveur ;
- client detail vérifie `reservation.customerId`.

Risques :

- nombreux `any` ;
- validations manuelles et incomplètes ;
- accès `.all()` filtrés en mémoire ;
- route `/api/auth-test` divulgue des diagnostics de rôle/connexion ;
- pages CRM/CMS erreurs 500 anonymes ;
- galerie sans publication dédiée ;
- `getCustomerLoyaltySummary` écrit pendant une lecture ;
- `addRefund` ne refuse pas explicitement les montants non positifs ;
- RLS/policies et rôle runtime non-bypass non validés.

## 38. Audit Tests

Tests Playwright présents :

- `tests/e2e/auth.spec.ts` : redirections anonymes `/dashboard` et `/admin` ;
- `tests/e2e/reservation.spec.ts` : lien public vers `/reserver` et présence du formulaire.

Tests rôles réels/commentés : non exécutables sans credentials.

Scripts de validation nombreux, certains mutatifs : ils n'ont pas été lancés dans cet audit.

`npx tsc --noEmit` : PASS.  
`npm run build` : PASS.  
`git diff --check` ciblé : PASS.

## 39. Audit Données de test

Fixtures/scénarios trouvés :

- `TEST_FORMULA`, `TEST_B3_FORMULA`, `TEST_SERVICE`, `TEST_B3_SERVICE` ;
- scripts `validate_phase*`, scripts de suppression et tests de concurrence ;
- migration publication qui dépublie les quatre noms.

Catalogue public :

- filtre générique `availability + isPublished` ;
- contrôle service parent ;
- pas de dépendance exclusive à une blacklist.

Dashboards internes :

- lectures globales pouvant voir des fixtures internes si elles sont dans les modèles concernés.

Aucune donnée n'a été supprimée.

## 40. Audit Prisma/PostgreSQL/RLS

Prisma :

- contrat `schema.prisma` ;
- artefacts `schema.json`/`schema.d.ts` ;
- relations FK applicatives auditées dans Bloc 1.12 ;
- transactions et `FOR UPDATE` observés.

PostgreSQL :

- connexion réelle lue en audit précédent ;
- comptes applicatifs présents par rôle ;
- cinq réservations lues sans mutation dans Bloc 2.3.

RLS :

- rapports antérieurs documentent 47 tables RLS et absence de policies exploitées ;
- rôle `postgres`/connexion actuelle ne prouve pas un runtime non-bypass ;
- drift Prisma/migrations reste gelé.

État : **PARTIEL/BLOCKED pour production**.

## 41. Boutons / actions mortes

| Label | Fichier | État |
|---|---|---|
| Encaisser | détail réservation | désormais câblé via `PaymentForm`/action ; E2E non testé |
| Générer la facture | détail réservation | câblé via action ; E2E non testé |
| Modifier Contact | CRM client | DEAD BUTTON |
| Nouvel équipement | page équipements | DEAD BUTTON |
| Ajouter une famille | page équipements | DEAD BUTTON |
| Transférer | inventaire | DEAD BUTTON |
| Entrée / Sortie | inventaire | DEAD BUTTON |
| Ajuster | inventaire | DEAD BUTTON |
| Ajouter lieu | locations | DEAD BUTTON |
| Déclarer une panne | maintenance | DEAD BUTTON |
| Clôturer | maintenance | DEAD BUTTON |
| Gestion ressources | catalogue service | DEAD/PARTIEL |
| Notifications header | AppHeader | PLACEHOLDER |
| Recherche header | AppHeader | explicitement désactivée |

## 42. Workflows frontend → backend

| Workflow | Auth | RBAC | Validation | Service/DB | Retour UI | État |
|---|---|---|---|---|---|---|
| Login | Supabase | session | présence champs | Auth | redirect | TESTÉ partiel |
| Register | Supabase | défaut Client | présence champs | Auth/lazy User | redirect | PARTIEL |
| Catalogue | public | n/a | publication | ORM | cards | TESTÉ |
| Contact | public | n/a | champs minimaux | SQL ContactMessage | success/error | IMPLÉMENTÉ |
| Réservation | requireAuth | Client/staff | manuelle + service | transaction | success/error | PARTIEL |
| Paiement | requireRole | staff | action + service | transaction | message/revalidation | PARTIEL/BLOCKED E2E |
| Facture | requireRole | staff | id réservation/service | transaction | message/revalidation | PARTIEL/BLOCKED E2E |
| CRM read | requireRole | staff | id | ORM | table | PARTIEL |
| CMS CRUD | requireRole | admin | manuelle | SQL/ORM | revalidation | PARTIEL |
| Stock mutation | variable | role page | non démontrée | absent caller | absent | FAIL |

## 43. Fonctions orphelines

- `earnLoyaltyPoints` ;
- `redeemLoyaltyReward` ;
- `addRefund` côté UI/action ;
- `generateInvoice` avant Bloc 2.2, désormais action mais E2E non testé ;
- plusieurs helpers/services de template/media selon callers ;
- composants Chateau avancés sans caller confirmé ;
- boutons de catalogue/logistique/maintenance sans action.

## 44. Contradictions des anciens rapports

Corrections confirmées :

- l'isolation catalogue n'est plus une simple blacklist : `isPublished` générique est utilisée ;
- la lightbox possède désormais focus initial, trap Tab, Escape, restauration et reduced motion ;
- le paiement/facture est maintenant câblé au niveau code dans Bloc 2.2.

Affirmations non encore prouvées :

- PASS fonctionnel de paiement/facture : contredit par Bloc 2.3 `BLOCKED` faute de mutation réelle ;
- dashboards fonctionnels de bout en bout : le code existe mais les sessions réelles n'ont pas été testées ;
- galerie publique sûre : aucun champ publication Gallery/Media n'est présent ;
- responsive complet : classes présentes, mesure multi-viewport complète absente.

## 45. Matrice P0/P1/P2/P3

| Priorité | Problème | Preuve | Impact | Correction/test nécessaire |
|---|---|---|---|---|
| P0 | Drift Prisma/RLS/runtime non résolu | rapports Bloc 1.5–1.12 | production | décision/gouvernance + test rôle dédié |
| P0 | Paiement/facture non E2E validés | Bloc 2.3 BLOCKED | finance | session contrôlée + mutation approuvée |
| P1 | Galerie sans publication | schema + pages publiques | exposition | décision public/privé et règle |
| P1 | Calendrier métier absent | routes inventoriées | workflow planning | implémentation dédiée |
| P1 | Mutations logistique/maintenance absentes | boutons sans action | opérations | câbler ou retirer CTA |
| P1 | CRM/CMS HTTP 500 anonyme | smoke test | sécurité/UX | redirection/refus contrôlé |
| P1 | Fidélité earn/redeem orpheline | services sans callers | parcours client | actions/RBAC/UI |
| P2 | Nombreux `.all()`/`any` | services/pages | performance/robustesse | requêtes filtrées/types |
| P2 | SEO incomplet | metadata sans sitemap/canonical | visibilité | audit SEO dédié |
| P2 | Accessibilité wizard | div onClick | clavier | contrôles natifs |
| P3 | Recherche désactivée | AppHeader | confort | implémenter plus tard |

## 46. Fonctionnalités VALIDÉES

Strictement :

- présence et compilation de la stack ;
- redirection anonyme `/dashboard` testée ;
- accès public HTTP des pages principales testé ;
- filtre public services/formules testé statiquement et précédemment vérifié ;
- TypeScript et build production PASS.

Ces validations ne signifient pas que tous les workflows métier sont validés.

## 47. Fonctionnalités TESTÉES mais non VALIDÉES

- réservation publique : page/formulaire accessible, mutation réelle non testée ;
- paiements/factures : code compilé, mutation réelle bloquée ;
- dashboards : code/RBAC, session réelle non testée ;
- client isolation : filtres présents, deux sessions non testées ;
- responsive/accessibilité : inspection statique, navigateur multi-viewport complet non exécuté.

## 48. Fonctionnalités IMPLÉMENTÉES mais non TESTÉES

- remboursement ;
- mutations earn/redeem loyalty ;
- nombreuses mutations stock/équipements/maintenance ;
- CMS authentifié complet ;
- analytics authentifié par rôle ;
- import réel ;
- workflow livraison/mission complet.

## 49. Fonctionnalités PARTIELLES

- paiement ;
- facturation ;
- CRM ;
- galerie ;
- dashboards ;
- logistique ;
- maintenance ;
- personnalisation back-office ;
- SEO ;
- responsive ;
- Accessibilité globale.

## 50. Fonctionnalités ABSENTES

- calendrier métier complet démontré ;
- workflow remboursement UI ;
- recherche globale active ;
- dashboard configurable par widgets ;
- publication Gallery/Media dédiée ;
- export complet démontré ;
- E2E role-based complet.

## 51. Production readiness

### NOT PRODUCTION READY

Justifications :

- P0 finance non validé E2E ;
- drift Prisma/RLS/runtime non résolu ;
- exposition galerie non classifiée ;
- erreurs HTTP protégées incohérentes ;
- mutations opérationnelles manquantes ;
- tests de rôles/isolation non réalisés.

## 52. Plan de correction recommandé

Plan non exécuté :

1. fournir une procédure de test contrôlé avec compte staff et réservation non critique ;
2. valider paiement/facture et règles RBAC en environnement maîtrisé ;
3. corriger les réponses anonymous CRM/CMS ;
4. décider la politique public/privé galerie ;
5. câbler ou retirer les CTA logistique/maintenance/catalogue ;
6. traiter fidélité earn/redeem avec RBAC ;
7. ajouter tests Playwright multi-viewport/accessibilité ;
8. traiter séparément drift Prisma/RLS et rôle runtime ;
9. compléter calendrier, recherche et personnalisation si requis par le cahier.

## 53. Risques

- mutation financière non contrôlée si un test réel est lancé sans réservation dédiée ;
- confusion entre code présent et workflow validé ;
- fuite de données par lectures globales et galerie non publiée ;
- sur-privilège PostgreSQL ;
- erreurs 500 masquant des refus d'accès ;
- dette `any` et validations manuelles ;
- composants/boutons décoratifs présentés comme fonctionnels ;
- performances dégradées par chargements complets.

## 54. Décisions humaines nécessaires

- autoriser ou non une mutation financière contrôlée sur une réservation existante ;
- choisir le compte/rôle de test sans divulguer de credentials ;
- décider la politique de visibilité Gallery/Media ;
- confirmer les rôles autorisés pour paiement/facturation ;
- décider si les CTA non câblés doivent être implémentés ou retirés ;
- décider le calendrier métier et la recherche dans le périmètre de présentation ;
- valider la stratégie Prisma/RLS/runtime non-bypass.

## 55. Verdict final

# PARTIAL

Le projet réel est identifié, l'architecture est substantielle et plusieurs chaînes publiques/authentification/catalogue sont fonctionnelles ou testées. TypeScript et le build passent. Les audits précédents ont établi l'isolation catalogue et les relations FK applicatives.

Le projet ne peut toutefois pas être déclaré `READY` ou `VALIDÉ` globalement :

- les paiements/factures n'ont pas été prouvés avec une session réelle et une écriture contrôlée ;
- les dashboards et l'isolation Client A/Client B n'ont pas été testés par comptes réels ;
- plusieurs mutations affichées ne sont pas câblées ;
- la galerie ne possède pas de classification public/privé propre ;
- le calendrier métier est absent/non démontré ;
- CRM/CMS ont un comportement anonyme HTTP 500 ;
- le drift Prisma/RLS/runtime reste bloqué par gouvernance.

Cet audit n'a effectué aucune mutation, correction, migration, création de compte, création de paiement, création de réservation ou génération de facture réelle.
