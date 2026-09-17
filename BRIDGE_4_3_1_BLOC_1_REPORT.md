# BRIDGE 4.3.1 — Rapport Bloc 1

## Verdict

**PARTIAL** : toutes les corrections fonctionnelles du Bloc 1 sont vérifiées réellement, mais le contrôle global ne peut pas être PASS tant que `npm run lint` et `git diff --check` restent en échec sur des problèmes préexistants. Aucun commit, push, merge, reset, checkout, revert, clean ou suppression de donnée n'a été effectué.

## État Git avant intervention

Snapshot capturé avant toute modification :

```text
## master
 M .gitignore
 M next.config.ts
 M package-lock.json
 M package.json
 D src/app/favicon.ico
 M src/app/globals.css
 M src/app/layout.tsx
 D src/app/page.tsx
 M tsconfig.json
?? .agents/ .claude/ .cursor/ .devin/ .gitattributes .vs/
?? BRIDGE_4_1_IMPLEMENTATION_REPORT.md
?? BRIDGE_4_2_IMPLEMENTATION_REPORT.md
?? BRIDGE_4_2_UX_AUDIT.md
?? BRIDGE_4_3_1_CORRECTIVE_REPORT.md
?? BRIDGE_4_3_IMPLEMENTATION_REPORT.md
?? BRIDGE_4_3_UX_MOTION_AUDIT.md
?? BRIDGE_4_3_VISUAL_AUDIT.md
?? BRIDGE_4_UX_UI_AUDIT.md
?? PHASE15_DESIGN_ANALYSIS.md PHASE15_FINAL_REPORT.md
?? _backup/ docs/ migrations/ prisma/ public/images/
?? src/app/(protected)/ src/app/(public)/ src/app/admin/ src/app/api/
?? src/app/auth/ src/app/catalogue/ src/app/dashboard/ src/app/login/
?? src/app/register/ src/components/ src/lib/ src/prisma/ tests/
?? scripts et fichiers de validation déjà présents dans le checkout
```

`git diff --stat` initial : 9 fichiers suivis, 15 704 insertions et 3 681 suppressions. Les diffs initiaux de `src/app/globals.css`, `src/app/layout.tsx` et `next.config.ts` ont été lus et conservés ; ces modifications préexistantes n'ont pas été réécrites.

## Fichiers modifiés pour Bloc 1

- `src/components/public/PublicHeader.tsx` — nouveau header public avec menu mobile complet.
- `src/components/public/Lightbox.tsx` et `src/components/public/GalleryGrid.tsx` — focus, piège Tab, Escape et restauration du déclencheur.
- `src/components/public/BookingWizardClient.tsx` — capacité optionnelle, aucun libellé `Max 0 enf.`.
- `src/app/(public)/layout.tsx` — intégration du header et correction de l'e-mail non cassable du footer.
- `src/app/(public)/page.tsx` — filtrage catalogue public, suppression de l'affichage numérique `0`, retrait des translations horizontales responsables du débordement.
- `src/app/(public)/services/page.tsx` — filtrage des formules et services de test.
- `src/app/(public)/reserver/page.tsx` — filtrage des formules et capacité absente représentée par `null`.
- `src/lib/public-catalogue.ts` — filtre d'exposition limité aux quatre noms de test demandés.
- `BRIDGE_4_3_1_BLOC_1_REPORT.md` — présent rapport.

Prisma, migrations, RBAC, RLS, Auth, prix, calculs et architecture backend n'ont pas été modifiés.

## Causes et corrections

### Overflow

La mesure navigateur a identifié deux causes réelles :

1. Les `FadeIn` horizontaux de la section Expérience appliquaient une translation X aux largeurs mobiles/tablette et étendaient la largeur scrollable.
2. À 768 px, la colonne Contact du footer contenait `contact@chateaudumwana.com` sans possibilité de coupure, ce qui étendait le document à 818 px.

Les translations horizontales ont été retirées uniquement de l'accueil, en conservant le fondu vertical. L'e-mail du footer est maintenant cassable. Aucun `overflow-x-hidden` global ou cache équivalent n'a été ajouté.

### Lightbox

Le bouton Fermer reçoit le focus initial. Le conteneur est `role="dialog"` avec `aria-modal="true"` et un nom accessible. Tab est piégé entre les éléments focusables, Escape ferme, le clic overlay/bouton reste opérationnel, et le focus revient au bouton image déclencheur. Les transitions sont nulles lorsque `prefers-reduced-motion` est actif. Le scroll du body est restauré à sa valeur précédente.

### Navigation publique mobile

À `<= 768 px`, le bouton menu expose `aria-expanded` et `aria-controls="public-mobile-navigation"`. Le menu contient Accueil, Présentation, Services, Galerie, Contact et Réserver. Le seuil desktop est passé à `lg` afin d'éviter la collision observée à 768 px.

### Données publiques

Les pages Accueil, Services et Réserver filtrent exclusivement les enregistrements `TEST_FORMULA`, `TEST_B3_FORMULA`, `TEST_SERVICE` et `TEST_B3_SERVICE`. Les fixtures et la base ne sont ni supprimées ni modifiées.

### Capacité

Une capacité absente, nulle ou non applicable est transportée comme `null`. Le wizard n'affiche alors ni `Max 0 enf.` ni faux maximum `50`; l'attribut HTML `max` est également absent. Les capacités positives continuent d'être affichées et utilisées comme limite d'interface.

### BookingWizard

Le chargement reste un composant serveur simple avec données transmises au client. L'amélioration directement liée et sûre a été limitée au filtrage des formules et à l'affichage de capacité. Aucun changement métier ou de calcul de réservation n'a été fait.

## Tests exacts et résultats

| Commande / contrôle | Résultat |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS, compilation et 45 routes générées |
| `npm run lint` | FAIL sur erreurs préexistantes hors périmètre, notamment `no-explicit-any` et `prefer-const`; aucun correctif global non lié n'a été engagé |
| `git diff --check` | FAIL sur espaces finaux préexistants dans `src/app/globals.css` |
| Playwright Chromium installé pour validation locale | PASS |
| Home `scrollWidth` à 375 px | PASS, 375 = 375 |
| Home `scrollWidth` à 768 px | PASS, 768 = 768 |
| Home `scrollWidth` à 1440 px | PASS, 1440 = 1440 |
| Menu mobile | PASS, `aria-expanded=true`, six liens attendus présents |
| Lightbox clavier | PASS, focus initial `Fermer`, Tab reste dans le dialogue, Escape restaure le déclencheur |
| Pages `/`, `/services`, `/reserver` | PASS, aucun nom `TEST_*` exposé |
| Home 375 px | PASS, aucun texte `0` ou `Max 0 enf.` parasite |

## Responsive et accessibilité

Validation navigateur réelle effectuée à 375, 768 et 1440 px. Le document ne dépasse plus la largeur viewport sur les trois largeurs. La navigation mobile est vérifiée à 375 px et le seuil tablette reste dans le mode menu.

La vérification reduced motion est statique et comportementale via le composant Lightbox ; le CSS global existant conserve la règle `prefers-reduced-motion`. Aucun test lecteur d'écran complet n'a été réalisé.

## Limites et hors périmètre

- Le lint global reste en échec à cause de problèmes préexistants répartis dans le checkout.
- `git diff --check` signale des espaces finaux préexistants dans `globals.css`.
- Les warnings Next.js existants sur `next.config.ts`, le ratio de l'image logo et le preload de polices n'ont pas été traités, car ils ne sont pas nécessaires à Bloc 1.
- Aucun nettoyage de base, fixture, Prisma, migration, RBAC, RLS, Auth, prix ou règle métier n'a été effectué.
- Bloc 2 et Bridge 4.4 n'ont pas été commencés.
