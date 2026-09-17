# BRIDGE 4.3.1 — RAPPORT DE CONTRÔLE TECHNIQUE
## Projet : Le Château du Mwana

## 1. Périmètre et méthode

Contrôle effectué dans VS Code sur la base actuelle du dépôt, sans reset, checkout, suppression de modification existante, modification de code, modification de données, migration ou schéma.

Surfaces inspectées :

- Accueil : `/`
- Présentation : `/presentation`
- Services / Formules : `/services`
- Galerie : `/gallery`
- Contact : `/contact`
- Réservation : `/reserver`
- `ChateauLine`, `ChateauLight`, `GalleryGrid`, `Lightbox`, `BookingWizardClient`
- Header public, navigation publique et composants de motion
- Rapports BRIDGE 4.3 et état Git

Viewport contrôlés dans le navigateur local : 375 px, 768 px et 1440 px.

## 2. Résumé exécutif

BRIDGE 4.3.1 n’est pas entièrement clôturé techniquement. La compilation est saine et les contrôles structurels Bridge 3.3 passent, mais plusieurs défauts signalés par le contrôle visuel restent présents dans le rendu actuel :

- overflow horizontal persistant sur l’accueil à 375 px ;
- focus du lightbox non déplacé vers le dialogue ;
- données `TEST_FORMULA`, `TEST_B3_FORMULA` et `TEST_SERVICE` visibles publiquement ;
- formule avec `Max 0 enf.` visible dans la réservation ;
- coordonnées par défaut visibles sur Contact ;
- navigation publique mobile réduite au seul CTA Réserver ;
- ChateauLine techniquement présente mais toujours très générique visuellement ;
- pages secondaires encore proches du même hero bleu-gradient ;
- avertissements Next.js sur le ratio du logo et le preload des polices ;
- lint en échec sur de nombreux fichiers existants.

Le build ne suffit donc pas à déclarer le Bridge terminé. Le projet est techniquement compilable, mais le contrôle correctif reste **PARTIAL**.

## 3. État des vérifications

| Contrôle | État | Résultat factuel |
|---|---|---|
| Inspection Git initiale | DONE | Dépôt sur le commit initial ; nombreuses modifications et fichiers BRIDGE déjà présents dans l’arbre de travail. Aucun reset effectué. |
| Inspection BRIDGE 4.3 | DONE | `ChateauLine` et `ChateauLight` présents ; `ChateauImageReveal` créé mais non utilisé ; Réservation non corrigée côté données. |
| TypeScript | DONE | `npx tsc --noEmit` terminé sans sortie d’erreur. |
| Build Next.js | DONE | `npm run build` réussi ; compilation, TypeScript, collecte et génération terminées. |
| Lint | NOT DONE | `npm run lint -- --quiet` échoue sur de nombreuses erreurs `no-explicit-any`, `prefer-const` et autres erreurs existantes. |
| Bridge 3.3 forensic | DONE | `npx tsx validate_phase3_3_forensic.ts` : 92 PASS, 0 FAIL, 0 WARN. |
| Bridge 2 / dashboards | BLOCKED | Script non exécuté car il crée des utilisateurs de test et touche la base. |
| Phase 11 | BLOCKED | Script non exécuté car il crée des clients, services, formules, équipements et réservations de test. |
| E2E Playwright repository | BLOCKED | 15 échecs ; navigateurs Playwright requis indisponibles, notamment WebKit ; les tests ne fournissent pas un verdict fonctionnel fiable dans cet environnement. |
| Responsive public | DONE | Contrôle réel à 375/768/1440 px effectué sur les six routes. |
| Reduced motion | DONE | Le titre accueil est visible avec `opacity: 1` et `transform: none` en mode réduit. |
| Lightbox clavier | NOT DONE | À l’ouverture par clavier, le focus reste sur le bouton déclencheur ; pas de focus trap ni de déplacement initial observé. |
| Données publiques | NOT DONE | Les données de test restent accessibles via les pages publiques. |
| Modifications de code | DONE | Aucune modification applicative, Prisma, migration, RBAC, authentification ou donnée effectuée pendant ce contrôle. |

## 4. Inspection initiale

### Fichiers réellement concernés

- `src/app/(public)/page.tsx`
- `src/app/(public)/presentation/page.tsx`
- `src/app/(public)/services/page.tsx`
- `src/app/(public)/gallery/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/reserver/page.tsx`
- `src/components/public/ChateauLine.tsx`
- `src/components/public/ChateauLight.tsx`
- `src/components/public/MotionWrapper.tsx`
- `src/components/public/GalleryGrid.tsx`
- `src/components/public/Lightbox.tsx`
- `src/components/public/BookingWizardClient.tsx`
- `src/components/layout/AppHeader.tsx`
- `src/components/layout/AppSidebar.tsx`
- `src/app/globals.css`
- `validate_phase11.ts`
- `validate_phase3_workflows.ts`
- `delete_exact_orm.ts` et scripts de nettoyage similaires

### Cause générale

Les composants public affichent les enregistrements disponibles sans filtre de présentation. Les scripts de validation ont créé des enregistrements de test avec `availability: true`, et ces enregistrements sont donc considérés comme des offres publiques normales.

## 5. Contrôle responsive

### Résultats mesurés

| Route | 375 px | 768 px | 1440 px |
|---|---:|---:|---:|
| `/` | **OVERFLOW** : body 388 px | OK | OK |
| `/presentation` | OK | OK | OK |
| `/services` | OK | OK | OK |
| `/gallery` | OK | OK | OK |
| `/contact` | OK | OK | OK |
| `/reserver` | OK | OK | OK |

### Accueil mobile

**NOT DONE — P1**

À 375 px, `body.scrollWidth` reste à 388 px. Le défaut n’a pas été résolu. Il ne faut pas masquer ce problème avec `overflow-x-hidden` sans identifier l’élément qui dépasse.

Effets visibles :

- largeur document supérieure au viewport ;
- header/logo disproportionné ;
- promesse fortement fragmentée ;
- CTA secondaire moins contrasté sur la zone basse du hero.

Cause probable à confirmer dans une correction : combinaison de largeur intrinsèque d’un élément du hero/header, conteneur ou composant motion, et dimensions du logo. Le rapport actuel ne modifie pas cette surface.

### Tablette et desktop

Les pages ne débordent pas aux largeurs testées. À 768 px, les heroes sont cependant plus comprimés et les grands espacements restent coûteux en hauteur. À 1440 px, la composition est stable mais les heroes secondaires restent très similaires.

## 6. Header, logo, CTA et navigation

### Header/logo

**PARTIAL — P1/P2**

Le logo est présent et identifiable. Le navigateur émet toutefois un avertissement Next.js : la largeur ou la hauteur de `/images/logo.png` est modifiée sans compensation de l’autre dimension. Ce signal peut contribuer à une stabilité visuelle insuffisante.

Le header public prend beaucoup d’espace sur mobile. Le contrôle responsive ne montre pas de débordement sur les pages secondaires, mais l’accueil dépasse encore.

### Navigation mobile

**NOT DONE — P1/P2**

À 768 px et en dessous, la navigation principale disparaît et seul le CTA Réserver reste immédiatement visible. Les routes Présentation, Services, Galerie et Contact ne disposent pas d’un menu mobile public clairement accessible dans la surface observée.

### CTA

**PARTIAL**

Les CTA sont visibles sur desktop et la réservation est clairement priorisée. À 375 px, le CTA secondaire de l’accueil perd en contraste sur l’image et le fondu inférieur. Le CTA de réservation reste le plus robuste.

## 7. ChateauLine et ChateauLight

### ChateauLine

**PARTIAL — P1**

Le composant est présent avec quatre variants (`arch`, `horizon`, `accent`, `divider`) et respecte `useReducedMotion`. Cependant, dans le rendu, les usages observés sont principalement des traits courts or (`accent`) et une ligne horizontale. La forme n’est pas suffisamment identifiable comme architecture du Château ; la présence technique ne vaut pas validation visuelle.

Impact : la signature est cohérente avec la palette mais reste générique et ne différencie pas réellement les pages.

### ChateauLight

**PARTIAL — P2**

Le composant anime un gradient horizontal avec Framer Motion et est appliqué autour des CTA du hero. L’effet est discret et non bloquant, mais sa contribution visuelle est difficile à distinguer d’un simple gradient. Il n’existe pas de preuve que la lumière soit devenue une signature perceptible plutôt qu’une teinte or.

### ChateauImageReveal

**NOT DONE — P2**

Le rapport d’implémentation indique que `ChateauImageReveal` a été créé, mais la recherche des usages ne montre pas son intégration aux pages inspectées. Il ne peut donc pas être considéré comme une fonctionnalité livrée.

## 8. Pages publiques et identité narrative

### Accueil

**PARTIAL**

La page possède la narration la plus aboutie : hero, expérience, formules, galerie et CTA final. Elle reste toutefois générique dans la motion et conserve l’overflow mobile.

### Présentation

**PARTIAL — P1/P2**

La page utilise un hero or et une ligne, mais demeure principalement un bandeau coloré suivi d’un grand bloc de texte. La ChateauLine ne suffit pas à créer une histoire visuelle propre.

### Services / Formules

**PARTIAL**

Les cartes présentent prix, titre, images et CTA. La composition reste catalogue standard : cartes blanches arrondies, ombre, zoom léger et pictogramme Sparkles. Le contenu est lisible, mais la perception premium et propriétaire est incomplète.

### Galerie

**PARTIAL**

Les images réelles évoquent des souvenirs et le lightbox s’ouvre. Le traitement hover reste un zoom/overlay courant. Le focus clavier est incomplet, ce qui empêche une validation accessibilité.

### Contact

**NOT DONE — P1**

Le rendu expose encore `Adresse sur demande` et `Non spécifié` lorsque les réglages ne sont pas renseignés. Cela donne une impression de site incomplet. La page reste très proche du hero Services/Galerie.

### Réservation

**NOT DONE — P1**

Le wizard est structuré, mais la page charge toutes les formules disponibles depuis la base. Elle expose donc `TEST_FORMULA`, `TEST_B3_FORMULA` et une option affichée avec `Max 0 enf.`. Le chargement initial affiche également un spinner et le texte générique `Chargement magique en cours...` avant interaction.

La correction ne doit pas consister à modifier la disponibilité, la capacité ou la logique métier sans décision explicite. Il faut d’abord distinguer nettoyage de données de test, règle de publication et données commerciales réelles.

## 9. Données de test visibles publiquement

### Résultat de contrôle

`npx tsx check_formulas.ts` a listé :

- `TEST_FORMULA = 15000`
- `TEST_B3_FORMULA = 25000`

Le navigateur a confirmé :

| Route | Données visibles |
|---|---|
| `/` | `TEST_FORMULA`, `TEST_B3_FORMULA` |
| `/services` | `TEST_SERVICE` |
| `/reserver` | `TEST_FORMULA`, `TEST_B3_FORMULA`, `Max 0 enf.` |
| `/contact` | `Adresse sur demande`, `Non spécifié` |

### Origine identifiée

- `validate_phase11.ts` crée `TEST_SERVICE` puis `TEST_FORMULA` à `15000`, avec capacité 50.
- `validate_phase3_workflows.ts` crée `TEST_B3_SERVICE` à `25000` puis `TEST_B3_FORMULA` à `25000`, avec capacité 30.
- Les scripts de nettoyage `delete_exact_orm.ts`, `delete_all_tests.ts` et variantes existent, mais les données sont toujours présentes au moment du contrôle.
- `src/app/(public)/reserver/page.tsx` charge toutes les formules disponibles.
- `src/app/(public)/services/page.tsx` charge tous les services disponibles.

### État

**NOT DONE — P1**

La présence de ces lignes prouve que le contrôle de publication des données de test n’est pas clôturé. Aucun nettoyage n’a été exécuté pendant cette mission afin de ne pas modifier les données sans instruction explicite.

## 10. Lightbox et accessibilité

### Lightbox

**NOT DONE — P1**

Test réalisé :

1. ouverture de `/gallery` ;
2. focus clavier sur la première image ;
3. `Enter` ;
4. lecture de `document.activeElement` ;
5. `Escape` ;
6. vérification du focus après fermeture.

Résultat : avant et après fermeture, le focus reste sur le bouton déclencheur. Le focus n’est pas déplacé vers « Fermer », le dialogue n’est pas focusable et aucun focus trap n’est observé.

Points positifs : `role="dialog"`, `aria-modal="true"`, Escape, alt text et blocage du scroll sont présents.

### Reduced motion

**DONE**

En mode `prefers-reduced-motion: reduce`, le titre accueil observé a `opacity: 1` et `transform: none`. La ligne et la lumière possèdent également des branches reduced motion. Une vérification exhaustive de toutes les transitions reste à faire après correction.

### Contraste et focus visible

**PARTIAL**

Les CTA principaux sont lisibles sur desktop. Le CTA secondaire de l’accueil et certains textes blancs semi-transparents sur image nécessitent une mesure WCAG dédiée. Le focus du lightbox reste le défaut le plus concret.

## 11. Performance et warnings

### Images

Les assets publics incluent plusieurs images de formules, prestations et jeux. Les plus gros fichiers doivent être optimisés et dimensionnés avant d’ajouter davantage de motion. La mesure de poids a été effectuée par classement des fichiers, mais aucun remplacement ou compression n’a été réalisé.

### Warnings observés

- Next.js signale un ratio modifié pour `/images/logo.png`.
- Next.js signale des polices préchargées non utilisées dans le délai attendu.
- `next.config.ts` contient une option `eslint` devenue non supportée par la version Next installée.
- `git diff --check` signale des espaces finaux dans `src/app/globals.css`.

### État

**PARTIAL — P2**

Le build est performant au sens compilation, mais ces warnings de finition et le poids des images restent à traiter avant une validation visuelle complète.

## 12. Tests et validations

### Commandes réussies

```text
npx tsc --noEmit
npm run build
npx tsx validate_phase3_3_forensic.ts
npx tsx check_formulas.ts
```

Résultats :

- TypeScript : succès sans sortie d’erreur.
- Build : succès, routes générées.
- Bridge 3.3 forensic : 92 PASS, 0 FAIL, 0 WARN.
- Catalogue : données de test confirmées présentes.

### Commandes en échec ou bloquées

```text
npm run lint -- --quiet
npx playwright test tests/e2e --reporter=line
```

- Lint : échec sur de nombreuses erreurs existantes, principalement `@typescript-eslint/no-explicit-any` et `prefer-const`.
- Playwright : 15 tests échouent dans l’environnement actuel ; les navigateurs requis ne sont pas tous installés, notamment WebKit (`Playwright.exe` absent). Ce résultat ne doit pas être interprété comme un échec produit pur.

### Tests volontairement non exécutés

- `validate_phase2_dashboards.ts` : crée des utilisateurs de test et touche la base.
- `validate_phase11.ts` : crée des clients, services, formules, équipements et réservations de test.
- E2E/scripts qui créent des réservations, paiements, factures ou clients : non exécutés pour éviter des effets de bord sur les données partagées.

Ils nécessitent une base de test isolée ou un mécanisme de transaction/rollback avant exécution fiable.

## 13. Matrice corrective

| Sujet | État | Priorité | Cause / impact | Test nécessaire |
|---|---|---|---|---|
| Overflow Home 375 | NOT DONE | P1 | Largeur document 388 px ; cause exacte à isoler avant tout masquage. | Playwright 375 px avec assertion `scrollWidth <= innerWidth`. |
| Header/logo | PARTIAL | P1/P2 | Ratio logo averti ; header trop dominant sur mobile. | Screenshots 375/768/1440 et vérification dimensions image. |
| CTA mobile | PARTIAL | P1/P2 | CTA secondaire peu contrasté sur image. | Contraste WCAG + capture mobile. |
| ChateauLine | PARTIAL | P1 | Présente mais visuellement générique. | Revue capture fixe sans animation. |
| Pages similaires | NOT DONE | P1 | Heroes secondaires réutilisent le même pattern. | Comparaison screenshots par route. |
| Focus lightbox | NOT DONE | P1 | Focus reste sur trigger ; pas de focus trap. | Test clavier ouverture, fermeture, retour focus. |
| Données TEST | NOT DONE | P1 | Données de validation `availability=true` exposées. | Requête catalogue + inspection `/`, `/services`, `/reserver`. |
| Loading réservation | PARTIAL | P1 | Attente visible et spinner générique. | Capture cold load et mesure délai jusqu’au wizard. |
| Contact defaults | NOT DONE | P1 | Adresse/téléphone/horaires de secours visibles. | Rendu avec settings absents et settings renseignés. |
| `Max 0 enf.` | NOT DONE | P1 | Donnée/service de capacité affichée comme formule. | Contrôle des payloads de réservation et catalogue. |
| Images/performance | PARTIAL | P2 | Poids et warnings non résolus. | Audit image + LCP/CLS sur réseau mobile. |
| Accessibilité | PARTIAL | P1 | Reduced motion OK, lightbox focus incomplet. | Clavier, lecteur d’écran, contraste et motion reduction. |
| Navigation mobile | NOT DONE | P1/P2 | Navigation principale masquée sans menu public visible. | Parcours mobile de toutes les routes publiques. |

## 14. Recommandation de correction

Avant toute modification importante, documenter pour chaque point : fichier, cause, impact, risque et test. Ordre recommandé :

1. isoler et nettoyer les données de test dans une base de développement dédiée ou selon une procédure approuvée ;
2. corriger le focus du lightbox sans toucher au métier ;
3. isoler la cause exacte de l’overflow Home à 375 px ;
4. corriger dimensions/rendu du logo et la navigation mobile ;
5. clarifier les données Contact par défaut et le rendu `Max 0 enf.` ;
6. mesurer les assets et les contrastes ;
7. seulement ensuite réévaluer ChateauLine, les heroes et la motion.

## 15. Verdict final BRIDGE 4.3.1

### PARTIAL

La base technique compile et les contrôles structurels sensibles passent. Le contrôle visuel et les données publiques montrent toutefois que BRIDGE 4.3.1 n’est pas entièrement terminé.

### DONE

- TypeScript et build Next.js.
- Bridge 3.3 forensic : 92/92.
- Réduction des animations en mode reduced motion observée.
- ChateauLine et ChateauLight présents techniquement.
- Contrôle responsive effectué aux trois largeurs demandées.

### PARTIAL

- Hero et motion : présents mais encore génériques visuellement.
- Responsive : seul l’accueil échoue à 375 px.
- Performance : build OK, warnings et assets à traiter.
- Accessibilité : labels et Escape présents, focus lightbox incomplet.
- Pages publiques : composition cohérente mais trop similaire.

### NOT DONE

- Suppression ou isolation des données de test publiques.
- Correction de l’overflow Home mobile.
- Correction du focus lightbox.
- Navigation mobile complète.
- Résolution des valeurs Contact par défaut visibles.
- Résolution du `Max 0 enf.` visible.
- Validation finale des images, contrastes et poids.

### BLOCKED

- E2E Playwright complet : navigateurs manquants dans l’environnement.
- Tests Bridge 2.1/Phase 11 mutateurs : pas de base isolée disponible pour les lancer sans modifier les données partagées.
- Lint global : nombreuses erreurs préexistantes hors périmètre correctif immédiat.

## 16. Limites et arrêt

Aucun fichier de code, schéma, migration, RBAC, authentification, service métier, réservation, paiement, CRM, fidélité, logistique ou donnée n’a été modifié pendant ce contrôle.

BRIDGE 4.4 n’a pas été commencé.
