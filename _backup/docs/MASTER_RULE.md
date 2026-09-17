# RÈGLE MAÎTRESSE — CHÂTEAU DU MWANA

Le site ne doit pas être "inspiré" des images de référence.
Il doit être CONÇU À PARTIR DE LEUR LANGAGE VISUEL. 

Les images de référence constituent le DESIGN SOURCE OF TRUTH.
Le cahier des charges constitue le BUSINESS / FUNCTIONAL SOURCE OF TRUTH.

## ARCHITECTURE OBLIGATOIRE :

CONTENT
→ PAGE
→ TEMPLATE
→ SECTION
→ COMPONENT
→ VARIANT
→ THEME
→ RESPONSIVE RULES
→ ANIMATION

Aucun contenu métier ne doit être mélangé au CSS.
Aucun composant visuel ne doit être dupliqué inutilement.
Aucune page ne doit contenir un CSS "jetable" ou spécifique sans justification.

Chaque élément visuel doit être un composant réutilisable.

### EXEMPLES :

*   **Hero** → HeroComponent → HeroVariant → HeroTheme → HeroResponsiveRules
*   **Service** → ServiceCard → ServiceCardVariant → ServiceCardTheme → ServiceCardResponsiveRules
*   **Galerie** → Gallery → GalleryGrid / GalleryMasonry / GalleryImmersive
*   **Navbar** → Navbar → NavbarClassic / NavbarTransparent / NavbarFloating / NavbarImmersive / NavbarMoon
*   **Footer** → Footer → FooterVariant
*   **CTA** → CTAButton → CTAGroup
*   **Section** → Section → SectionHeader → SectionContainer

Le changement de template ou de thème ne doit JAMAIS modifier la logique métier, les données, les réservations, les paiements ou les modèles Laravel.

**UNE MÊME DONNÉE DOIT POUVOIR ÊTRE AFFICHÉE PAR PLUSIEURS TEMPLATES SANS DUPLICATION.**

SERVICE + TEMPLATE A  *ou*  SERVICE + TEMPLATE B (sans modifier le Service).
Même principe pour : Hero, Services, Formules, Galerie, Contact, Réservation, Footer, Navbar.

---

## DESIGN SOURCE OF TRUTH

**IMAGE 1** = référence absolue du SITE PUBLIC.
**IMAGE 2** = référence absolue du BACK-OFFICE.

Ne pas inventer une troisième direction artistique.

Le rendu doit conserver le langage visuel observé :
*   bleu nuit / marine profond
*   blanc ivoire / crème
*   doré premium
*   touches pastel maîtrisées
*   coins arrondis
*   cartes élégantes
*   ombres douces
*   bordures discrètes
*   grandes images immersives
*   espaces blancs généreux
*   typographie élégante
*   hiérarchie visuelle nette
*   boutons premium
*   badges et états lisibles
*   interface moderne
*   esthétique féerique mais adulte
*   esthétique familiale mais non enfantine
*   esthétique premium mais chaleureuse

**INTERDICTION :**
*   design enfantin
*   couleurs criardes
*   cartes génériques Bootstrap
*   apparence SaaS générique
*   template gratuit
*   interface étudiant
*   composants visuellement incohérents
*   CSS improvisé
*   styles inline dispersés
*   duplication de composants
*   valeurs arbitraires répétées
*   responsive ajouté après coup

---

## DESIGN TOKENS

Toutes les dimensions visuelles importantes doivent être centralisées.
Créer un système de tokens pour : COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, BORDERS, CONTAINERS, BREAKPOINTS, BUTTONS, CARDS, FORMS, BADGES, NAVIGATION, ANIMATIONS.

Un composant ne doit pas inventer sa propre couleur, son propre rayon, son propre spacing ou son propre shadow si un token existe déjà.

---

## RESPONSIVE SOURCE OF TRUTH

Le design doit être conçu **MOBILE FIRST**.
Chaque composant possède ses règles : Desktop, Tablet, Mobile.

Ne jamais construire Desktop puis "réparer" Mobile.
Une modification Desktop ne doit pas casser Mobile.
Une modification Mobile ne doit pas casser Desktop.

**Tester systématiquement :** 360px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px.

**Aucun(e) :** horizontal overflow, image déformée, carte cassée, texte coupé, bouton inaccessible, navbar cassée, grille qui déborde, section qui crée un espace vide anormal.

---

## IMAGES

Les images sont des éléments structurants du design.
*   Ne jamais déformer une image.
*   Ne jamais appliquer un crop destructif sans décision de design explicite.
*   Utiliser : aspect-ratio contrôlé, object-fit adapté, lazy loading, optimisation, responsive images.
Les images doivent conserver leur identité visuelle.

---

## CSS

Le CSS doit être ARCHITECTURAL et non correctif.

**INTERDIT :**
*   `".foo { margin-top: 137px; }"` uniquement pour réparer une cassure.
*   `".bar { width: 843px; }"` uniquement parce que cela fonctionne sur un écran.

Une valeur spécifique doit avoir une raison architecturale.
Privilégier : design tokens, layout primitives, containers, grid, flex, gap, clamp(), minmax(), aspect-ratio, responsive utilities, composants réutilisables.

Le CSS doit décrire le DESIGN, pas réparer les conséquences d'un mauvais layout.

---

## AVANT DE CODER

L'agent doit :
1. analyser les références visuelles ;
2. analyser le cahier des charges ;
3. identifier les composants communs ;
4. identifier les variantes ;
5. créer les design tokens ;
6. définir la grille ;
7. définir les breakpoints ;
8. définir les templates ;
9. définir les règles responsive ;
10. définir les états ;
11. **seulement ensuite coder.**

NE PAS commencer directement par une page.

---

## APRÈS CHAQUE MODULE

L'agent doit vérifier :
`[ ] structure` `[ ] données` `[ ] responsive` `[ ] états` `[ ] erreurs` `[ ] loading` `[ ] empty state` `[ ] accessibility` `[ ] interactions` `[ ] cohérence visuelle` `[ ] absence de duplication` `[ ] absence de CSS correctif` `[ ] desktop` `[ ] tablet` `[ ] mobile`

Un module n'est pas terminé parce qu'il "s'affiche". Il est terminé uniquement lorsqu'il fonctionne réellement de bout en bout.

---

## RÈGLE ANTI-CASSURE

AVANT toute modification d'un composant partagé :
1. identifier toutes les pages qui l'utilisent ;
2. identifier toutes ses variantes ;
3. identifier ses dépendances ;
4. identifier ses breakpoints ;
5. prévoir l'impact Desktop / Tablet / Mobile ;
6. modifier le composant ;
7. tester toutes ses utilisations.

**NE JAMAIS corriger une page en cassant une autre.**

---

## RÈGLE ANTI-FAUX CSS

Si un problème visuel apparaît : NE PAS immédiatement ajouter un margin, padding, width, position ou transform arbitraire.
Diagnostiquer d'abord :
1. mauvais parent ?
2. mauvais container ?
3. mauvais grid/flex ?
4. mauvaise dimension intrinsèque ?
5. mauvais breakpoint ?
6. mauvais aspect-ratio ?
7. mauvais composant ?
8. mauvais token ?
9. conflit CSS ?
10. **seulement ensuite : correction locale.**

---

## RÈGLE MÉTIER

Le design ne doit jamais modifier la logique métier. Laravel reste responsable de tout le métier (réservations, disponibilité, paiements, factures, etc.). Le frontend présente ces données, il ne doit pas les réinventer.

---

## RÈGLE FINALE

Chaque décision doit répondre à cette question :
*"Est-ce que cette décision renforce le système visuel modulaire du Château du Mwana et reste cohérente avec les deux images de référence sur tous les écrans ?"*
*   **Si NON :** ne pas implémenter.
*   **Si OUI :** implémenter sous forme de composant, token, template ou variante réutilisable.

**OBJECTIF :** UN DESIGN COHÉRENT + DES COMPOSANTS RÉUTILISABLES + DES TEMPLATES INTERCHANGEABLES + UN RESPONSIVE NATIF + ZÉRO CSS DE RÉPARATION + ZÉRO DUPLICATION + ZÉRO RUPTURE ENTRE LES PAGES.
