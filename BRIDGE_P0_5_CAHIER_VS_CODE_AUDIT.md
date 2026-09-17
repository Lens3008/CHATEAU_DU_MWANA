# P0.5 — Audit Cahier des Charges V3.0 vs Code

Date de l'audit : 16 septembre 2026. Portée : lecture statique uniquement ; aucun test, script, migration, appel réseau ou mutation de données n'a été exécuté.

## A. Référence et méthode

La source fonctionnelle est l'annexe du document `CODEX_P0_5_CAHIER_VS_CODE_AUDIT_READ_ONLY.md`. Son annexe est matériellement incomplète : elle s'arrête au début de la section Secrétaire. Les exigences antérieures sont évaluées ; celles absentes de l'annexe ne sont pas inventées.

Le code courant est comparé au checkpoint historique `647ef32181c75cb9d4a3e9e98fe3de2d80ef0978`, sans le restaurer. La preuve ci-dessous signifie uniquement : **code trouvé**, **UI trouvée**, **backend trouvé**, **modèle de données trouvé**, **test trouvé**. Aucun élément n'est marqué VALIDÉ, car aucune validation de bout en bout n'a été autorisée.

## B. Baseline et écarts actuels

- `647ef32` contient l'application fonctionnelle étendue : 80 fichiers `src/app`, 23 `src/components`, 52 `src/lib`, le contrat Prisma, deux tests E2E et les migrations.
- Trois fichiers actuels ne correspondent à aucun commit accessible : `src/app/(protected)/layout.tsx`, `src/components/layout/AppSidebar.tsx`, `src/lib/auth/user.ts`.
- L'arbre reste divergent : la baseline n'est pas une branche de travail. Ce constat est un risque de traçabilité, pas une instruction de restauration.

## C. Matrice cahier → code

| ID | Section cahier | Exigence exacte | V1/V2 | Code/preuve | UI | Backend | DB | Auth/RBAC | Test | État | Risque | Action proposée |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| V-01 | Vision | Plateforme public + réservation + gestion métier | V1 | Routes, services et modèles couvrent ces domaines | Oui | Oui | Oui | Partiel | Partiel | IMPLÉMENTÉ | Workflows non validés | Valider par scénarios métier |
| DS-01 | Design | Identité féerique/premium, non générique | V1 | `ChateauLine`, `ChateauLight`, palette publique | Oui | N/A | N/A | N/A | Non | EN COURS | Audits UX existants signalent une signature encore générique | Revue visuelle humaine |
| DS-02 | Design | Typographie, couleurs, composants et états cohérents | V1 | `globals.css`, Base/UI, loading/error | Oui | N/A | N/A | N/A | Non | IMPLÉMENTÉ | Contraste et cohérence runtime non vérifiés | Audit visuel/accessibilité |
| NAV-01 | Navigation | Navbar premium et navigation publique | V1 | `PublicHeader`, liens Accueil/Présentation/Services/Galerie/Contact/Réserver | Oui | N/A | N/A | N/A | Non | IMPLÉMENTÉ | Aucun test de navigation | Tester les liens et mobile |
| NAV-02 | Navigation | Styles transparente/flottante/immersive/lune configurables backend | V1 | Un seul header statique détecté | Partiel | Non détecté | Non détecté | N/A | Non | ABSENT | Exigence de personnalisation non couverte | Concevoir préférences de navigation |
| PUB-01 | Public | Accueil, présentation, services, galerie, contact | V1 | Pages `(public)` et composants dédiés | Oui | Oui, données publiques/services | Oui | Public | Test réservation seul | IMPLÉMENTÉ | Contenu réel et rendu non validés | Parcours manuel public |
| PUB-02 | Public | Formules : prix, durée, capacité, disponibilité, ressources | V1 | `public-catalogue`, `Formula`, `ServiceResource` | Oui | Oui | Oui | Indirect | Partiel | IMPLÉMENTÉ | Conditions/variantes non établies | Tester publication et données réelles |
| PUB-03 | Public | Galerie : grille, lightbox, filtres, plein écran, responsive | V1 | `GalleryGrid`, `Lightbox`, pages galerie | Oui | Oui | Oui | Public | Non | EN COURS | Filtres/masonry/optimisation non démontrés | Test visuel et clavier |
| PUB-04 | Public | Contact validé, stocké, notifie secrétariat, Maps/WhatsApp | V1 | `ContactFormClient`, action, `ContactMessage` | Oui | Stockage trouvé | Oui | Action publique | Non | EN COURS | Pas de Zod; Maps, notification secrétaire et WhatsApp non détectés | Ajouter validation et chaîne de notification |
| PUB-05 | Public | SEO, responsive, accessibilité | V1 | metadata, 36 attributs aria, 8 loading et 8 error | Partiel | N/A | N/A | N/A | Non | EN COURS | Un seul reduced-motion, deux usages dark; aucun test responsive/lecteur d'écran | Audit WCAG et appareils |
| RES-01 | Réservation | Prestation → date/heure → participants → résumé → référence | V1 | `BookingWizardClient` → `createReservationAction` → `createReservation` | Oui | Oui | Oui | Client forcé depuis session | E2E présent | IMPLÉMENTÉ | E2E non exécuté | Exécuter sur environnement isolé |
| RES-02 | Réservation | Capacité, conflits ressources, double réservation/allocation | V1 | disponibilité, transaction, verrou `Formula`, allocations | Indirect | Oui | Oui | Oui | Non | EN COURS | Inventaire/allocation lu puis filtré en mémoire, pas de verrou par ligne inventaire | Revue concurrence et test multi-utilisateur |
| RES-03 | Réservation | Statut réservation séparé du paiement, historique, location | V1 | `Reservation`, `Payment`, `ReservationStatusHistory`, `Location` | Oui | Oui | Oui | Partiel | Non | IMPLÉMENTÉ | Création force `CONFIRMED`; règles de cycle de vie non validées | Clarifier transitions métier |
| PAY-01 | Paiements | Espèces, virement, Mobile Money, manuel, partiels/multiples | V1 | `PaymentMethod`, `PaymentTransaction`, `addPayment` | Formulaire paiement | Oui | Oui | ADMIN/SECRETARY/SUPERVISOR | Non | IMPLÉMENTÉ | Prestataire Airtel/Moov non modélisé distinctement | Tester les règles d'encaissement |
| PAY-02 | Paiements | Remboursement | V1 | `addRefund` transactionnel | Non détectée | Oui | Oui | Aucune action UI détectée | Non | EN COURS | Fonction backend orpheline | Ajouter action/UI et tests autorisés |
| PAY-03 | Payment Bridge Android / bot WhatsApp désactivés | Architecture préparatoire seulement | V1 désactivée | Aucun bridge, terminal, webhook, signature, nonce ou bot détecté | Non | Non | Champ WhatsApp client seulement | N/A | Non | ABSENT | Absence non bloquante V1, préparation future absente | Documenter contrat futur sans activer |
| INV-01 | Facturation | Facture, lignes, total, solde, historique | V1 | `generateInvoice`, `Invoice`, `InvoiceItem`, bouton UI | Oui | Oui | Oui | Action protégée | Non | IMPLÉMENTÉ | Numéro aléatoire; taxe fixée à zéro | Définir numérotation/fiscalité |
| INV-02 | Facturation | Impression/téléchargement PDF et préparation WhatsApp | V1 | Aucun générateur PDF ni export facture détecté | Non | Non | Modèles seulement | N/A | Non | ABSENT | Facture non livrable au client | Concevoir PDF/export |
| LOG-01 | Logistique | Ressources → allocation → stock → mission | V1 | Allocation créée à la réservation, modèles Mission/Stock | Pages lecture | Partiel | Oui | LOGISTICIAN + rôles internes | Non | EN COURS | Aucune création automatique de mission détectée | Implémenter workflow mission/alertes |
| LOG-02 | Logistique | Équipements, stocks, mouvements, emplacements, livraisons, historique | V1 | Modèles complets, écrans inventaire/équipement/maintenance/allocation | Principalement lecture | Services KPI | Oui | Oui | Non | EN COURS | CRUD mouvements/livraisons/incidents non détecté | Cartographier puis implémenter actions |
| MNT-01 | Maintenance | Défaut → indisponibilité → alerte → intervention → remise en service | V1 | Modèle `EquipmentMaintenance`, écran lecture | Partiel | Non détecté | Oui | Oui | Non | ABSENT | Aucun workflow/alerte/mise à jour stock détecté | Implémenter chaîne métier |
| CRM-01 | CRM | Fiche client : réservations, achats, paiements, factures, notes | V1 | `getCustomer360`, page client, modèles associés | Oui | Oui | Oui | ADMIN/SUPERVISOR/SECRETARY | Non | IMPLÉMENTÉ | Aucun test ni preuve d'isolation runtime | Ajouter tests de permission |
| LOY-01 | Fidélité | Score multi-critères, niveaux, récompenses, transactions | V1 | Comptes, niveaux, rewards, `earn`/`redeem` | Aucune UI mutation détectée | Partiel | Oui | Action résumé seulement | Non | EN COURS | Calcul demandé (dépenses/fréquence/assiduité/etc.) non démontré | Définir algorithme et UI |
| IMP-01 | Imports | CSV/Excel, normalisation, doublons, prévisualisation, validation humaine | V1 | Formulaire CSV, `ImportJob`, `processImport` | CSV seul | Service comporte commentaire indiquant insertion non réalisée | Oui | ADMIN | Non | EN COURS | Import effectif, Excel, doublons et prévisualisation absents | Concevoir pipeline contrôlé |
| EXP-01 | Exports | Clients, ventes, stocks, logistique, fidélité, statistiques | V1 | Aucun export/Excel détecté | Non | Non | Sources disponibles | N/A | Non | ABSENT | Rapports non exportables | Définir formats et autorisations |
| AUTO-01 | Automatisations | Réservation → paiement/facture/allocation/mission/notification | V1 | Paiement et allocation initiaux; notification/facture/mission non enchaînés | Partiel | Partiel | Oui | Partiel | Non | EN COURS | Chaîne métier incomplète | Orchestration transactionnelle/idempotente |
| AUTO-02 | Automatisations | Stock faible, défaut, client fidèle | V1 | KPI stock et modèles présents | Partiel | Non détecté | Oui | Partiel | Non | ABSENT | Pas d'alerte ni automatisation détectée | Définir événements et notifications |
| ROLE-01 | Rôles | CLIENT, SECRÉTAIRE, SUPERVISEUR, ADMIN | V1 | `requireRole`, redirections, pages protégées | Oui | Oui | Oui | Oui | E2E visiteurs seul | IMPLÉMENTÉ | RLS et tests de chaque rôle non vérifiables | Tester matrice complète |
| ROLE-02 | Rôles | LOGISTICIAN comme évolution | Évolution | Rôle, dashboard et routes logistiques | Oui | Oui | Oui | Oui | Non | IMPLÉMENTÉ | Hors cahier, à valider produit | Valider matrice de permissions |
| DASH-01 | Dashboard | CA, réservations, paiements, clients, stock, maintenance, alertes | V1 | Cinq dashboards, analytics, graphiques/périodes | Oui | Oui | Oui | Rôles partiels | Non | IMPLÉMENTÉ | Calendrier, actions rapides configurables et tendances non exhaustifs | Test données/rôles |
| CAL-01 | Calendrier | Réservations, ressources, missions, livraisons, maintenance, filtres | V1 | Icônes/liens mais aucune route/composant calendrier métier détecté | Non | Non | Modèles présents | N/A | Non | ABSENT | Pilotage opérationnel incomplet | Concevoir calendrier agrégé |
| BO-01 | Personnalisation BO | Thème, widgets, raccourcis, recherche globale | V1 | Quelques styles dark; notifications | Partiel | Non détecté | Partiel | Oui | Non | ABSENT | Personnalisation/recherche absentes | Définir préférences utilisateur |
| SEC-01 | Sécurité | Validation, XSS, uploads, IDOR, URLs directes | V1 | Supabase SSR, actions protégées, contrôle client réservation, upload admin | Partiel | Partiel | Oui | Oui | Partiel | EN COURS | Aucun import Zod; politiques RLS non visibles; limites/type upload non prouvés | Audit sécurité/RLS isolé |
| AUD-01 | Audit log | Traçabilité opérations sensibles | V1 | Modèle `AuditLog`, service; certains services transmettent un utilisateur | N/A | Partiel | Oui | Partiel | Non | EN COURS | Couverture exhaustive des actions non démontrée | Définir événements obligatoires |
| ARC-01 | Architecture | Responsabilités métier malgré changement Laravel→Next | V1 | Next/React/TS + Prisma/Postgres/Supabase, actions/services | Oui | Oui | Oui | Oui | Partiel | IMPLÉMENTÉ | Migration technologique légitime, mais contrats et tests insuffisants | Stabiliser architecture/documentation |
| TST-01 | Tests | Tests unitaires, intégration, E2E reproductibles | V1 | Playwright : 3 cas actifs; scripts TS hétérogènes | N/A | N/A | N/A | N/A | Non exécuté | EN COURS | Pas de script npm test; nombreux scripts DB destructifs | Séparer tests sûrs et CI |

## D. Contradictions / écarts

1. Le cahier demande une plateforme opérationnelle complète ; P0.4 et le code établissent surtout une couverture statique, pas une validation E2E.
2. Le changement Laravel/MySQL/Filament/Blade → Next.js/React/TypeScript/PostgreSQL/Supabase/Prisma est une évolution technique légitime, non un défaut ; les responsabilités métier restent toutefois à prouver.
3. Payment Bridge Android et bot WhatsApp sont désactivés en V1 : leur absence d'activation n'est pas un défaut V1. Leur architecture préparatoire n'est pas détectée.
4. Le modèle Prisma contient missions, livraisons, mouvements, maintenance et fidélité ; les actions/UI de workflow correspondantes sont incomplètes ou absentes.
5. Les tests E2E présents ne sont pas exécutés et ne valident ni comptes authentifiés, ni paiements, ni finance, ni isolation réelle.
6. L'annexe du cahier s'interrompt avant la fin détaillée des rôles ; aucune exigence non fournie n'a été déduite.

## E. Fonctions orphelines et boutons

| Élément | Fichier | Appelée par | État |
|---|---|---|---|
| `addRefund` | `src/lib/services/payment.ts` | Aucun appel détecté | Orpheline backend |
| `earnLoyaltyPoints` | `src/lib/services/loyalty.ts` | Aucun appel détecté | Orpheline backend |
| `redeemLoyaltyReward` | `src/lib/services/loyalty.ts` | Aucun appel détecté | Orpheline backend |
| `createNotification` | `src/lib/services/notification.ts` | Aucun appel détecté | Orpheline backend |
| `processImport` | `src/lib/services/imports.ts` | `submitImportAction` | Branchée, mais import effectif déclaré non réalisé |
| Réserver | Accueil/services → `BookingWizardClient` | `createReservationAction` | Branché |
| Envoyer contact | `ContactFormClient` | `submitContactMessageAction` | Branché |
| Paiement / facture | `PaymentForm` / `InvoiceButton` | actions correspondantes | Branchés |
| Rembourser | Aucune UI détectée | `addRefund` attendue | Absent |

## F. Priorités

- **P0** — Définir la baseline avant modification ; vérifier RLS/policies, isolation réelle et concurrence de réservation sur un environnement isolé ; ne pas considérer les tests présents comme validés.
- **P1** — Finaliser maintenance, mouvements/livraisons/missions, remboursements, workflows fidélité, import réel, PDF facture et validation serveur structurée.
- **P2** — Calendrier métier, exports, recherche globale, personnalisation back-office, architecture préparatoire WhatsApp/Bridge.
- **P3** — Variantes de navigation, signature visuelle plus propriétaire, dark mode et couverture reduced-motion/accessibilité.

## G. Plan proposé — non exécuté

1. Obtenir une décision humaine sur la baseline et les trois fichiers post-checkpoint.
2. Écrire la matrice de rôles et les règles métier de prix, statuts, taxes, remboursements et transitions.
3. Auditer RLS et exécuter des scénarios de sécurité/réservation sur une base de test isolée.
4. Réaliser les P0 puis P1 avec tests non destructifs intégrés à des scripts npm reproductibles.
5. Terminer les parcours métier et seulement ensuite valider les aspects UX/design en conditions réelles.

## H. Décisions humaines nécessaires

- Baseline de référence et conservation des écarts non versionnés.
- Règles exactes du prix d'une formule, de confirmation de réservation et de numérotation fiscale.
- Périmètre V1 des remboursements, imports/exports et automatisations.
- Politiques RLS, matrice d'accès détaillée et responsabilités du rôle LOGISTICIAN.

## Verdict

**NON PRÊT** — le cahier V3.0 exige des workflows opérationnels sécurisés et validés ; le code offre une base large et plusieurs chaînes branchées, mais les preuves de validation E2E, RLS, concurrence, opérations logistiques, import/export, remboursement et PDF sont absentes ou incomplètes.
