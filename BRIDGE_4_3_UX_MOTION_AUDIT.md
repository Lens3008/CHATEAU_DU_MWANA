# BRIDGE 4.3 — AUDIT UX/UI & MOTION INDÉPENDANT

## 1. Executive Summary

Cet audit examine principalement le site public du Château du Mwana : Accueil, Présentation, Prestations/Formules, Galerie, Contact et Réservation. La cohérence avec les dashboards est vérifiée sans chercher à transformer les espaces métier en pages marketing. Aucun fichier du projet n’est modifié par cet audit.

Le site possède déjà une direction exploitable : logo officiel, bleu profond, or, photographie réelle, ton familial et premium, sections narratives et plusieurs états de contenu. L’accueil suit déjà une progression commerciale lisible : hero, expérience, formules, galerie, réservation. Le problème principal n’est donc pas l’absence d’animation. C’est l’absence d’un langage motion distinctif : les interactions actuelles reposent surtout sur `FadeIn`, stagger, translate, zoom, gradients et transitions génériques. Elles donnent de la vie, mais ne rendent pas encore reconnaissable la « magie du Château ».

La recommandation est de faire porter l’identité par la composition avant l’effet : architecture du Château, cadrages photographiques, lignes fines, espace, or comme lumière et transitions mesurées. La motion doit ensuite révéler cette composition, jamais la remplacer. La magie peut être exprimée par quelques moments rares : une ligne architecturale qui se dessine, une lumière chaude qui accompagne une révélation, un scintillement très discret autour d’un point important. Elle ne doit pas devenir une couche permanente de particules.

Le principe directeur proposé est : **70 % composition et design, 20 % motion, 10 % magie**. Si toutes les animations sont désactivées, le site doit rester premium, compréhensible, chaleureux et commercialement efficace.

### Verdict

**READY FOR IMPLEMENTATION**

Le projet est suffisamment structuré pour commencer BRIDGE 4.3 : les pages publiques sont identifiées, le wrapper motion et les primitives `framer-motion` existent déjà, les assets photographiques réels sont présents et les principaux parcours sont en place. Cette décision signifie que la direction peut être implémentée de manière progressive et mesurable. Elle ne signifie pas que toutes les idées de motion sont validées sans réserve.

Avant toute mise en œuvre, les garde-fous suivants sont indispensables :

- conserver une version statique complète de chaque section ;
- limiter le nombre de familles d’animation à quelques primitives cohérentes ;
- éviter toute animation continue hors micro-interactions nécessaires ;
- tester desktop, tablette, mobile, clavier et `prefers-reduced-motion` ;
- mesurer le poids et le rendu des images avant d’ajouter un effet visuel ;
- ne modifier ni données, ni réservation, ni paiements, ni logique métier, ni nouvelles routes métier.

## 2. État actuel

### Périmètre et surfaces observées

- `src/app/(public)/page.tsx` : accueil, hero, expérience, formules, galerie, CTA final.
- `src/app/(public)/presentation/page.tsx` : présentation, mission, vision.
- `src/app/(public)/services/page.tsx` : formules, services additionnels, cartes avec images et CTA.
- `src/app/(public)/gallery/page.tsx` et `src/components/public/GalleryGrid.tsx` : galerie masonry, hover, lightbox.
- `src/app/(public)/contact/page.tsx` et `src/components/public/ContactFormClient.tsx` : coordonnées, formulaire, succès et erreur.
- `src/app/(public)/reserver/page.tsx` et `src/components/public/BookingWizardClient.tsx` : parcours de réservation en quatre étapes.
- `src/app/(public)/layout.tsx` : header public, navigation, CTA global, footer.
- `src/components/public/MotionWrapper.tsx` : `FadeIn`, `StaggerContainer`, `StaggerItem`.
- `src/components/public/Lightbox.tsx` : ouverture modale avec `AnimatePresence`.
- `src/app/globals.css` : tokens de marque, waves, masonry, transitions et reduced motion.

### Ce qui fonctionne déjà

- Le hero de l’accueil utilise une photographie réelle issue de la galerie lorsqu’elle est disponible.
- L’accueil présente un récit commercial complet au lieu d’une simple grille de produits.
- Les pages publiques partagent une navigation et un footer cohérents.
- Les formules et services disposent d’images réelles lorsque les données en fournissent.
- La galerie propose une ouverture en lightbox, une fermeture par Escape et un blocage du scroll.
- Le formulaire de contact affiche des états de chargement, d’erreur et de succès.
- Le wizard de réservation rend les étapes visibles et utilise une transition latérale courte entre les étapes.
- `useReducedMotion` est pris en compte dans le wrapper motion et une règle CSS globale existe pour réduire les animations.
- Les dashboards conservent une structure fonctionnelle, distincte du site public. Cette séparation doit être maintenue.

### Ce qui limite aujourd’hui la signature visuelle

- `FadeIn` est utilisé comme solution presque universelle. Le déplacement de 20 px et l’opacité donnent un reveal standard, pas une identité architecturale.
- Les `StaggerContainer` ajoutent une séquence à de nombreuses grilles. Leur répétition peut rendre le parcours prévisible et ralentir la perception des contenus.
- Les cartes utilisent souvent `hover:-translate-y-*`, zoom d’image et changement de couleur. Ce sont des interactions utiles, mais interchangeables avec beaucoup de sites vitrines.
- Le hero applique un zoom lent de 20 secondes et un overlay sombre ; il ne possède pas encore de ligne, de motif ou de respiration propres au Château.
- La version de secours du hero contient plusieurs particules pulsantes. Elles sont statiques dans l’espace mais restent une décoration continue et générique.
- La carte « Magie garantie » utilise `animate-bounce` en continu. Cette animation attire l’attention sans apporter d’information et entre en tension avec le positionnement premium.
- Les pages Présentation, Prestations, Galerie, Contact et Réservation réutilisent un hero sombre avec gradients et badge « Sparkles ». Cette cohérence est utile, mais le motif est trop proche d’un template unique.
- La galerie d’accueil utilise des blocs visuels cliquables, mais sur cette surface l’ouverture d’image n’est pas reliée à une interaction de détail comme dans la page galerie.
- Le header public est animé par transitions et backdrop blur, mais aucune stratégie de navigation active ou de réduction visuelle au scroll n’est clairement visible.

### Identité actuelle

Les tokens publics déclarent un fond chaud, une surface claire, un bleu profond, un or, un rouge et un vert. La réalisation publique utilise surtout le bleu/slate, l’or et des bleus/indigos secondaires. Le rouge et le vert restent globalement fonctionnels, ce qui est préférable : ils ne doivent pas devenir des couleurs décoratives permanentes.

La typographie `Inter` et `Quicksand` est effectivement chargée ; `Quicksand` est utilisée dans les titres publics. Une typographie plus éditoriale pourrait renforcer l’élégance, mais il n’est pas nécessaire d’introduire une nouvelle dépendance ou une nouvelle famille pour commencer. Le logo et les photographies réelles sont des marqueurs plus importants à stabiliser.

## 3. Analyse du Hero

### Hero actuel de l’accueil

Le hero occupe environ 90vh avec une hauteur minimale de 600 px. Il présente une image plein écran à opacité réduite, un overlay sombre, un badge « Bienvenue dans la magie », un titre très grand, une promesse familiale et deux CTA. La hiérarchie commerciale est bonne : nom, proposition de valeur, réservation, découverte des formules.

Ses forces sont la présence immédiate du nom, la visibilité de la photographie et la clarté des CTA. Ses faiblesses sont la hauteur importante, le contraste très sombre, le recours au gradient comme structure principale et l’absence d’un motif architectural propriétaire. Sur mobile, 90vh peut repousser la section suivante et rendre le premier écran dépendant d’un texte très grand.

### Séquence recommandée « La magie du Château »

Séquence indicative, non obligatoire à chaque visite :

1. **Fond calme et sombre** : conserver une image ou un aplat bleu nuit immédiatement présent, sans écran noir prolongé.
2. **Lumière chaude discrète** : une zone lumineuse très lente accompagne le point focal de l’image, sans halo envahissant.
3. **Ligne architecturale** : une fine ligne inspirée d’une arche, d’un toit ou d’une silhouette de Château se dessine brièvement autour ou sous le titre.
4. **Révélation de la photographie** : l’image passe d’un voile sombre à sa lisibilité normale, par opacité et éventuellement un léger déplacement de cadrage.
5. **Titre et promesse** : le texte reste lisible dès le premier rendu ; le mouvement peut accompagner l’apparition, mais ne doit pas en être la condition.
6. **Passage lumineux** : un balayage très court peut traverser la ligne ou le bord du CTA, une seule fois.
7. **CTA** : le bouton de réservation est présent immédiatement ; la motion peut seulement renforcer son arrivée ou son état de survol.

### Faisabilité

Techniquement réaliste : opacité, transform, clip-path simple, pseudo-élément de ligne, masque CSS limité, animation d’un SVG léger si le motif est nécessaire, et transition Framer Motion pour orchestrer quelques éléments déjà rendus. Le coût restera raisonnable si la photographie est chargée en parallèle et si la ligne ne déclenche pas de recalcul de layout.

Trop lourd ou risqué : une scène 3D, une reconstruction détaillée du Château, un canvas de particules permanent, une vidéo plein écran non optimisée, un scroll piloté par de nombreux listeners ou une séquence bloquante avant l’accès au titre et aux CTA.

### Durée et visibilité

- Durée totale recommandée pour la première entrée : environ 1,2 à 2,0 secondes.
- Ligne architecturale : 500 à 900 ms.
- Lumière : 600 à 1 000 ms, une fois seulement.
- Apparition des éléments textuels : 300 à 600 ms, avec recouvrement partiel plutôt qu’une file d’attente longue.
- Aucun écran d’introduction obligatoire.
- Le nom du Château, la promesse principale et au moins le CTA de réservation doivent être accessibles même si l’animation est supprimée, retardée ou interrompue.

### Risques UX du hero

- Une séquence trop longue retarde la compréhension et la réservation.
- Une image trop sombre affaiblit la confiance et cache la réalité du lieu.
- Un titre qui arrive après le décor peut faire passer l’effet avant le message.
- Une ligne trop fine ou trop lumineuse peut devenir un élément décoratif illisible sur mobile.
- Un CTA qui apparaît tardivement pénalise les visiteurs pressés et les utilisateurs de clavier.

## 4. Analyse du storytelling

La progression actuelle est déjà proche du récit cible. L’enjeu est de donner à chaque section une fonction émotionnelle et commerciale distincte, avec une transition qui aide la lecture au lieu d’ajouter du spectacle.

| Section | Objectif émotionnel | Objectif commercial | Hiérarchie | Motion utile | Transition / interaction |
|---|---|---|---|---|---|
| Hero | Faire sentir un lieu rare, sûr et joyeux. | Faire comprendre immédiatement ce qu’est le Château et conduire vers réservation ou formules. | Nom, promesse, CTA principal, CTA secondaire. | Lumière + ligne architecturale + révélation courte. | Ligne sous le titre ; aucun défilement forcé. |
| L’Expérience | Installer confiance, sérénité parentale et émerveillement enfantin. | Expliquer pourquoi choisir le lieu au-delà du prix. | Preuve photographique, promesse, deux bénéfices maximum. | Révélation d’image par masque/opacité ; icônes immobiles ou micro-réaction au focus. | Une ligne fine qui relie texte et image, sans grande vague décorative. |
| Nos Formules | Donner envie de se projeter dans une fête concrète. | Comparer rapidement les offres et réserver. | Nom, image, prix, capacité/durée, CTA. | Image légèrement révélée ; CTA et bordure réagissent au hover/focus. | Passage du fond chaud au fond clair ; pas de stagger long sur toutes les cartes. |
| Réalisations / Souvenirs | Donner la preuve émotionnelle par de vraies scènes. | Réduire l’incertitude et renforcer la confiance. | Image dominante, contexte court, accès à la galerie. | Zoom très léger, voile lumineux, ouverture élégante. | Section sombre comme respiration ; ligne ou arche en entrée. |
| Contact / Réservation | Transformer l’envie en demande sereine. | Obtenir un message ou une réservation sans friction. | Rassurance, informations essentielles, formulaire ou wizard. | Progression d’étapes sobre ; feedback clair au succès et à l’erreur. | Or comme accent d’action ; pas d’effet de magie autour des champs. |

### Principes de narration

- L’image doit d’abord montrer l’expérience réelle, pas seulement produire une ambiance.
- Le mouvement doit orienter le regard vers un contenu ou un geste précis.
- Une section doit pouvoir être comprise en pause sur n’importe quelle frame.
- Les transitions doivent marquer des changements de chapitre : expérience, offres, souvenirs, action.
- La ligne architecturale est une meilleure signature réutilisable qu’une accumulation de particules.

## 5. Analyse des cartes Formules / Services

### État actuel

Les cartes de formules sont riches : image éventuelle, titre, description, prix, durée, capacité et bouton « Réserver ». Elles utilisent de grands rayons, des ombres, un changement de fond vers le bleu nuit au survol, une montée verticale et un changement de couleur. Les cartes de la page Prestations ajoutent un zoom d’image et un effet de bordure/ombre.

La hiérarchie des informations est bonne, mais la carte peut devenir haute et très arrondie. L’image n’est pas toujours présente, ce qui crée une composition inégale. Le CTA est visible, mais la différence entre carte de découverte et carte de conversion n’est pas explicitée.

### Motion recommandée

- **Zoom image** : 1,02 à 1,04 maximum, avec `transform` et `overflow: hidden` ; 250 à 450 ms au hover/focus.
- **Overlay lumineux** : une variation d’opacité ou une ligne d’or sur le bord, pas un voile blanc couvrant le contenu.
- **Déplacement** : 2 à 4 px au maximum, uniquement si la carte garde son ancrage visuel.
- **CTA** : ne pas le cacher entièrement avant le hover ; renforcer son contraste, son iconographie ou sa bordure au hover/focus.
- **Profondeur** : privilégier une ombre légèrement plus nette et une bordure d’accent plutôt qu’un `scale` global qui peut faire bouger la grille.
- **Focus clavier** : reproduire la même information que le hover, sans dépendre du pointeur.

### Recommandation de composition

La carte doit être lisible comme une fiche de décision : image, formule, prix, preuve de capacité/durée, action. Les détails secondaires peuvent rester dans la page de réservation. Éviter d’ajouter des badges, rubans et particules à chaque carte : la premiumisation vient de la respiration et de la photographie, pas de l’empilement d’ornements.

## 6. Analyse de la galerie

La galerie publique utilise une masonry, des images réelles, un hover avec zoom et overlay, puis un lightbox. Le concept « souvenirs » est déjà plus juste que celui d’une simple grille catalogue. La page vide possède une tonalité cohérente, mais l’état plein doit mieux exprimer une collection éditoriale qu’un mur uniforme.

### Recommandations

- Conserver une image dominante ou une première image plus ample pour donner un point d’entrée narratif.
- Utiliser le ratio naturel des photos pour préserver l’authenticité des scènes, mais organiser les premières images pour éviter une mosaïque sans rythme.
- Réserver le zoom à une amplitude faible, autour de 1,02 à 1,05 ; le visiteur doit sentir une proximité, pas un effet de loupe.
- Ajouter une lumière douce ou une ligne au survol/focus pour indiquer que l’image est ouvrable.
- Garder l’ouverture lightbox rapide et réversible ; l’animation de 200 ms est adaptée, la spring doit rester contenue.
- Ajouter un nom de galerie ou un contexte lorsque les données le permettent, sans recouvrir les visages ou les moments essentiels.
- Vérifier le focus initial dans le lightbox, le retour au bouton déclencheur et l’absence de lecture du contenu sous-jacent.

### Ce qui serait à éviter

- Auto-rotation de la galerie.
- Parallax différent pour chaque image.
- Particules au-dessus des photographies.
- Transitions de page qui retardent l’ouverture d’une photo.
- Cropping agressif qui transforme les souvenirs réels en textures décoratives.

## 7. Analyse des transitions entre sections

### Signature recommandée : la Ligne du Château

La signature la plus prometteuse est une ligne fine inspirée d’un détail architectural réel ou du langage du logo : arche, toiture, créneau, contour simplifié ou ligne d’horizon. Elle peut apparaître sous un titre, relier deux colonnes, souligner le passage d’un chapitre ou tracer discrètement le bord d’une section.

La ligne doit rester abstraite et légère. Une copie trop littérale d’un château enfantin risquerait de basculer vers l’esthétique parc de jeu. Elle doit évoquer l’architecture, pas l’illustration de conte.

### Options de transition

- **Arche** : utile entre l’expérience et les formules, comme passage d’un univers à une offre concrète.
- **Courbe douce** : utile pour changer de fond sans créer une vague omniprésente.
- **Ruban de lumière** : utile une seule fois autour du CTA final ou d’une transition majeure.
- **Ligne horizontale** : utile comme séparateur éditorial, avec un reveal au scroll.
- **Fond bleu nuit vers fond chaud** : transition de chapitre plus stable qu’un gradient animé.

### Choix recommandé

Choisir une seule famille de ligne et au maximum deux variantes de courbe. Réserver la lumière aux points de passage importants. Ne pas combiner arche, vague, ruban, halo et particules dans la même section.

## 8. Direction visuelle

### Palette sémantique

1. **Bleu profond / bleu nuit** : structure, confiance, sections immersives, footer, héroes ponctuels.
2. **Or / jaune** : lumière, premium, CTA principal, ligne-signature, focus visible.
3. **Rouge** : accent d’identité et états d’alerte ; jamais une couleur de fond décorative répétée.
4. **Vert** : validation, succès, disponibilité ; pas une couleur de hero permanente.
5. **Neutres chauds et slate** : lecture, surfaces, séparation et repos visuel.

### Composition

- Le public doit alterner des zones chaudes et claires avec des respirations bleu nuit, plutôt que rester dans un gradient sombre continu.
- Les photos réelles doivent être le principal support de la preuve et de l’émotion.
- Les rayons très larges sont déjà une signature actuelle ; les réserver aux grandes sections et réduire ceux des contrôles et petites cartes pour retrouver de la précision.
- Les ombres doivent suggérer une profondeur légère. Éviter le flottement permanent des cartes.
- Les bordures peuvent porter la ligne d’or de manière ponctuelle, surtout en focus ou sur un CTA prioritaire.
- Les icônes Lucide sont adaptées aux repères fonctionnels ; elles ne doivent pas remplacer la photographie ou servir de décoration systématique.

### Typographie

Quicksand convient à l’accueil chaleureux et aux titres actuels. Pour renforcer l’élégance, une hiérarchie plus éditoriale peut être obtenue par le rythme, la largeur de ligne, le poids et l’espace avant d’ajouter une nouvelle police. La lisibilité des formulaires et des informations de prix doit rester en sans-serif stable.

### Cohérence avec le dashboard

Le site public peut être plus émotionnel, photographique et narratif. Les dashboards doivent rester opérationnels : surfaces neutres, densité maîtrisée, couleurs fonctionnelles et actions explicites. La cohérence doit venir des tokens, du bleu profond, de l’or de focus et du vocabulaire de marque, pas de l’ajout d’animations marketing dans les espaces ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN ou CLIENT.

## 9. Direction motion

### Langage proposé

| Famille | Fonction | Usage recommandé | Limite |
|---|---|---|---|
| Ligne architecturale | Signer un chapitre ou un point de passage | Hero, séparateurs majeurs, CTA final, focus de carte | Une à deux occurrences fortes par page |
| Lumière chaude | Attirer l’œil vers une preuve ou une action | Révélation d’image, CTA principal, transition de chapitre | Pas de balayage continu |
| Révélation d’image | Montrer la réalité du lieu progressivement | Hero, expérience, galerie | Opacité/clip/transform simples, sans crop agressif |
| Profondeur légère | Confirmer l’interactivité | Hover/focus des cartes et boutons | 2 à 4 px, pas de grille qui saute |
| Magie ponctuelle | Marquer un moment mémorable | Entrée hero ou CTA final, éventuellement succès | Aucun décor pulsant permanent |

### Répartition par page

- **Accueil** : ligne architecturale + révélation photo + lumière au CTA ; pas de particules permanentes.
- **Présentation** : une transition de ligne et révélation de la mission ; pas de hero identique aux autres pages.
- **Prestations** : motion principalement sur les cartes et les images ; le contenu doit rester immédiatement comparable.
- **Galerie** : hover/focus doux et lightbox ; la photographie reste le mouvement principal.
- **Contact** : transitions discrètes de formulaire et succès ; aucune magie derrière les champs.
- **Réservation** : progression d’étapes claire, glissement court et directionnel ; pas d’effet spectaculaire qui cache une validation ou une erreur.

### Motion globale à éviter

Ne pas appliquer `FadeIn` à chaque nœud, faire apparaître une page en cascade pendant plusieurs secondes, animer simultanément plusieurs gradients, ou faire flotter en continu des cartes et badges. La motion doit s’arrêter quand son information est transmise.

## 10. Performance

### Principes techniques

- Prioriser `transform` et `opacity`, idéalement sur des éléments isolés et peu nombreux.
- Préférer CSS pour les hover, focus, lignes, opacités et transformations simples.
- Utiliser Framer Motion pour l’orchestration de quelques transitions et le lightbox existant, pas comme moteur de chaque élément décoratif.
- Éviter les animations qui modifient `width`, `height`, `top`, `left`, `margin` ou la structure de la grille pendant le scroll.
- Éviter les listeners de scroll permanents ; si une interaction au scroll est nécessaire, elle doit être passive, limitée et testée sur mobile.
- Ne pas ajouter de bibliothèque lourde pour dessiner une ligne ou un halo.

### Évaluation des propositions

| Proposition | CPU/GPU | Mobile | Core Web Vitals | Recommandation |
|---|---|---|---|---|
| Opacité + transform | Faible, généralement GPU-friendly | Bonne | Faible impact si le contenu est déjà présent | Priorité haute |
| Ligne CSS/SVG légère | Faible à modéré selon le tracé | Bonne | Faible si dimensions stables | Priorité haute, limiter le nombre de chemins |
| Révélation par clip/masque simple | Modéré | À tester sur appareils bas de gamme | Peut retarder la perception si l’image est lourde | Utiliser sur une ou deux images fortes |
| Zoom photo 1,02–1,05 | Faible | Bonne | Faible | Autorisé sur hover/focus |
| Blur/backdrop-blur massif | Modéré à élevé | Risque élevé sur mobile | Peut dégrader le rendu et la fluidité | Réserver à une surface ponctuelle |
| Particules DOM nombreuses | Élevé | Mauvais risque de surcharge | Risque de jank et de concurrence avec l’image | À éviter |
| Canvas ou WebGL | Variable à élevé | Risqué | Surcharge et accessibilité complexes | Non nécessaire pour ce concept |
| Vidéo hero plein écran | Élevé, poids réseau important | Très risqué | LCP et consommation réseau | Ne pas introduire sans besoin démontré |
| Parallax scroll global | Modéré à élevé | Mauvais avec touch et motion reduction | Risque de saccades | À éviter comme langage principal |

### Images

Les assets réels sont un atout, mais les images de formules, jeux et prestations doivent être dimensionnées, compressées et servies avec des dimensions stables. Une révélation motion ne compense pas une image trop lourde. La priorité est de préserver le LCP du hero et d’éviter que les cartes sous la ligne de flottaison concurrencent son chargement.

### `prefers-reduced-motion`

Le site possède déjà une prise en compte partielle. La cible BRIDGE 4.3 doit garantir une version sans déplacement, zoom, particules ou balayage : contenu visible, ligne statique éventuelle, transitions instantanées ou très courtes et aucun changement de sens. La préférence doit être testée sur les animations CSS comme sur Framer Motion.

## 11. Accessibilité

- Tout texte, prix, CTA, statut et formulaire doit être lisible sans attendre une animation.
- Les reveals ne doivent pas commencer avec un contenu durablement invisible si JavaScript est lent, désactivé ou interrompu. Un fallback visible doit rester possible.
- Les animations doivent respecter `prefers-reduced-motion: reduce`, y compris le zoom lent du hero, le bounce de la carte flottante, les spinners et le lightbox.
- Le focus clavier doit recevoir les mêmes états visuels que le hover : cartes sélectionnables, liens, boutons, éléments de galerie et étapes du wizard.
- Les changements d’étape de réservation doivent être annoncés de manière compréhensible et ne pas déplacer le focus de façon surprenante.
- Le lightbox doit gérer le focus initial, le focus trap ou une stratégie équivalente, Escape, clic de fermeture et retour au déclencheur.
- Les overlays sombres, textes blancs semi-transparents et badges or doivent être mesurés en contraste ; une ambiance lumineuse ne justifie pas un texte faible.
- La ligne, la lumière et la magie ne doivent jamais être les seuls moyens de signaler un état, un succès, une erreur ou un CTA.
- La motion ne doit pas créer de flash, de scintillement rapide ou de contraste lumineux répétitif.
- Les boutons et liens doivent rester suffisamment grands et espacés sur mobile, particulièrement dans le header et le wizard.

## 12. Responsive

### Desktop

- Conserver la composition éditoriale en deux colonnes lorsque la photo et le texte ont réellement besoin de dialoguer.
- Utiliser l’espace horizontal pour révéler la ligne architecturale et une image dominante, pas pour ajouter des cartes supplémentaires.
- Autoriser une séquence hero courte avec superposition contrôlée, sans cacher le second chapitre sous un écran excessivement haut.
- Les cartes peuvent réagir au hover, mais toute information et toute action doivent rester visibles au repos.

### Tablette

- Réduire les distances, les tailles de titres et les délais de stagger ; la largeur ne permet pas toujours de conserver une composition desktop.
- Empiler les CTA si leur longueur crée une tension.
- Préserver le ratio et le cadrage des photos ; éviter que la ligne architecturale passe derrière le contenu.
- Remplacer les interactions hover par des états de focus ou de tap explicites.

### Mobile

- Garder : apparition courte du hero, révélation d’image légère, ligne statique ou dessin très court, feedback de bouton et progression du wizard.
- Réduire : durée, amplitude, nombre d’éléments en stagger, halos et zooms.
- Supprimer : particules continues, bounce, parallax, grande superposition de blur, transitions qui retardent la réservation.
- Réduire la hauteur du hero pour laisser entrevoir le chapitre suivant ; le CTA principal doit rester proche du titre.
- Utiliser une colonne claire pour les cartes, avec prix et CTA toujours accessibles sans hover.
- Vérifier la table, la galerie et la lightbox avec les dates et textes français les plus longs.
- Ne pas supposer que l’utilisateur mobile a un pointeur : tap, focus et absence de hover doivent donner une expérience complète.

## 13. Architecture motion proposée

Cette architecture est conceptuelle uniquement. Aucun de ces composants ne doit être créé dans le cadre de l’audit.

### Primitives

- **ChateauReveal** : révèle un bloc déjà présent avec opacité et transform très limités ; fallback visible et reduced motion natif.
- **ChateauLine** : dessine ou affiche la ligne architecturale ; variantes `under-title`, `section-divider` et `cta-accent` au maximum.
- **ChateauLight** : passage lumineux très ponctuel sur une zone ciblée ; jamais un background animé permanent.
- **ChateauImageReveal** : révèle une photographie par opacité/clip simple en conservant son ratio et son alt text.
- **ChateauHover** : primitive de hover/focus commune pour image, bordure, ombre et CTA ; aucune translation systématique.

### Compositions

- **ChateauHeroSequence** : orchestre une seule séquence d’entrée courte avec image, ligne, titre et CTA.
- **ChateauSectionTransition** : applique une transition de chapitre entre deux fonds ou deux rythmes narratifs.
- **ChateauGalleryReveal** : gère l’entrée et l’ouverture d’images, en lien avec le lightbox et le clavier.
- **ChateauBookingTransition** : accompagne le changement d’étape du wizard sans masquer les erreurs ni déplacer brutalement le focus.
- **ChateauSuccessMoment** : réserve la lumière ou le motif de magie aux confirmations utiles, notamment le succès de contact ou de réservation.

### Primitive à ne pas prioriser

- **ChateauParticles** ne devrait être envisagé qu’en dernier recours, à très faible quantité, et uniquement si les essais montrent qu’une poussière de lumière apporte une vraie valeur narrative. Le concept n’en a pas besoin pour être reconnaissable.

### Contrat commun

Chaque primitive devrait accepter une version statique, une version reduced motion, un délai borné, une durée bornée et un comportement déterministe. Les composants ne doivent pas imposer de hauteur ou de position qui crée un décalage de layout.

## 14. Matrice P0/P1/P2/P3

| Priorité | Problème actuel | Recommandation | Justification | Impact UX | Impact technique |
|---|---|---|---|---|---|
| P0 | Aucun blocage motion ou accessibilité définitivement confirmé par l’audit statique. | Préserver le contenu visible, les CTA et le parcours sans dépendance à l’animation avant toute évolution. | Une animation ne doit jamais rendre le site inutilisable. | Garantit compréhension, réservation et contact même en panne ou reduced motion. | Faible ; contrainte d’architecture et de test. |
| P1 | Le langage actuel est surtout fade/stagger/zoom et n’identifie pas le Château. | Introduire une seule signature : ligne architecturale + lumière ponctuelle + révélation photo. | Une grammaire limitée est mémorisable et cohérente. | Renforce la reconnaissance et la narration sans surcharge. | Modéré ; primitives réutilisables, CSS/Framer Motion existant. |
| P1 | Le hero peut retarder le message si la séquence devient trop ambitieuse. | Garder image, titre et CTA visibles dès le premier rendu ; limiter la séquence à 1,2–2 s. | Le hero est un point d’entrée commercial, pas une intro de film. | Compréhension et conversion immédiates. | Faible à modéré ; nécessite fallback et mesure LCP. |
| P1 | L’animation `animate-bounce` de « Magie garantie » est continue et décorative. | Supprimer conceptuellement les mouvements permanents non informatifs ; réserver une micro-réaction au focus/entrée. | Le bounce attire l’œil sans expliquer ni aider. | Moins de distraction, ton plus premium. | Faible. |
| P1 | Les reveals peuvent rendre des contenus invisibles avant la fin de l’hydratation. | Garantir un rendu visible sans JS lent ou indisponible ; tester SSR/hydration et reduced motion. | La motion doit enrichir, pas conditionner l’accès au contenu. | Meilleure robustesse et accessibilité. | Modéré ; stratégie de fallback à définir. |
| P1 | Les images sont le principal support émotionnel mais peuvent coûter cher. | Stabiliser dimensions, compression, priorisation du hero et lazy-loading sous la ligne de flottaison. | Le poids de l’image influence plus l’expérience que l’effet visuel. | Chargement plus rapide et confiance préservée. | Modéré ; audit assets et métriques. |
| P1 | Les pages secondaires réutilisent presque le même hero sombre/gradient. | Différencier les chapitres par composition et ligne, sans créer cinq thèmes animés. | La cohérence ne doit pas devenir répétition. | Parcours plus riche et mémorisable. | Modéré ; changements de composition, peu de JS. |
| P1 | La galerie possède un bon lightbox mais son traitement reste proche d’une masonry générique. | Faire de l’image dominante, du contexte et d’une ouverture douce la signature « souvenirs ». | La galerie doit porter la preuve réelle du lieu. | Plus d’émotion et de confiance. | Faible à modéré ; interaction existante à affiner. |
| P2 | Le stagger répété sur les sections et cartes allonge la perception du chargement. | Réserver le stagger aux groupes courts ; afficher les cartes sans file d’attente longue. | Le visiteur doit scanner les offres rapidement. | Comparaison et réservation plus rapides. | Faible. |
| P2 | Les cartes combinent montée, zoom, ombre, changement de fond et couleur. | Réduire chaque carte à un seul changement de profondeur et un accent lumineux subtil. | Trop de signaux diminuent la lisibilité. | Interactions plus calmes et prévisibles. | Faible. |
| P2 | Les transitions entre sections ne possèdent pas de marqueur commun. | Introduire la ligne du Château sur les changements de chapitre majeurs seulement. | Une signature répétée avec parcimonie crée la continuité. | Meilleure orientation narrative. | Faible à modéré. |
| P2 | Le wizard utilise un glissement latéral fonctionnel mais peu contextualisé. | Conserver le glissement court et renforcer l’état de progression, le focus et les erreurs. | Le mouvement doit expliquer « où j’en suis ». | Moins d’incertitude dans la réservation. | Faible à modéré. |
| P2 | Les heroes et sections utilisent beaucoup de blur/backdrop-blur et gradients. | Réserver blur et gradients aux surfaces ciblées ; préférer aplats, image et contraste. | Les effets répétés coûtent et banalisent l’identité. | Plus de lisibilité et de distinction. | Faible. |
| P2 | Le header public ne montre pas clairement de relation entre navigation, scroll et chapitre courant. | Étudier une indication active ou une réduction discrète du header, sans listener lourd. | L’orientation doit rester compréhensible. | Navigation plus rassurante. | Modéré si scroll ; faible si basé sur route et CSS. |
| P3 | Les particules de fallback et les badges Sparkles sont des signes de magie génériques. | Remplacer progressivement le symbole générique par la ligne et la lumière propres au Château. | La magie doit être propriétaire et rare. | Image plus mature et premium. | Faible. |
| P3 | Les rayons très larges et ombres fortes sont répétés sur plusieurs surfaces. | Réserver les grands rayons aux chapitres et grands médias ; normaliser les contrôles. | La précision soutient l’élégance. | Moins d’effet template. | Faible. |
| P3 | Les succès et erreurs ont des animations ou icônes fonctionnelles sans lien avec le récit. | Garder feedback clair ; utiliser une lumière discrète seulement lors du succès. | Le métier prime sur la décoration. | Confirmation plus chaleureuse sans ambiguïté. | Faible. |

## 15. Recommandations finales

1. **Stabiliser la composition avant la motion.** Définir pour chaque page le contenu principal, la photo dominante, le CTA et la transition de chapitre avant de choisir un effet.
2. **Créer une signature visuelle unique.** La ligne architecturale doit être le fil conducteur de BRIDGE 4.3 ; la lumière et la magie restent des accents.
3. **Repenser le hero comme une révélation courte.** Image et message doivent être disponibles tout de suite ; la séquence accompagne la découverte pendant environ 1,2 à 2 secondes.
4. **Réserver la magie aux moments qui comptent.** Entrée du hero, passage entre chapitres, succès de contact ou de réservation ; pas de mouvement permanent.
5. **Préserver la comparaison des formules.** Les cartes doivent être rapides à lire, stables dans la grille et complètes sans hover.
6. **Faire de la galerie un album de souvenirs.** Prioriser la qualité du cadrage, les images réelles, le contexte et l’ouverture lightbox plutôt qu’un empilement d’effets.
7. **Aligner le motion avec la performance.** CSS et transform/opacity pour le quotidien ; Framer Motion pour l’orchestration utile ; aucun canvas, WebGL ou plugin lourd sans preuve de valeur.
8. **Traiter reduced motion comme une vraie direction de design.** La version sans animation doit rester belle, hiérarchisée et émotionnelle, pas seulement tolérable.
9. **Vérifier le public par scénarios.** Tester : « Que propose le Château ? », « Quelle formule choisir ? », « Comment réserver ? », « Où voir les souvenirs ? », avec et sans motion.
10. **Garder les dashboards hors de la mise en scène marketing.** Ils peuvent partager bleu profond, or de focus, logo et qualité typographique, mais leurs interactions doivent rester sobres et orientées tâche.

## 16. Ce qui NE DOIT PAS être fait

- Ne pas ajouter un fade-in ou un slide-up à chaque élément simplement parce qu’un wrapper existe déjà.
- Ne pas afficher des particules, confettis ou scintillements en continu.
- Ne pas transformer le site en jeu vidéo, parc d’attractions numérique ou interface enfantine.
- Ne pas multiplier les gradients animés, halos, blur et glassmorphism.
- Ne pas retarder le titre, le prix, le CTA ou les champs de réservation pour laisser jouer une animation.
- Ne pas cacher une information importante derrière un hover inaccessible au clavier ou au tactile.
- Ne pas utiliser le rouge et le vert comme décoration de marque permanente ; ils restent des couleurs fonctionnelles.
- Ne pas remplacer les photographies réelles par des illustrations abstraites lorsque le visiteur doit comprendre le lieu.
- Ne pas ajouter une vidéo plein écran, du canvas, du WebGL ou une bibliothèque motion lourde sans mesure et justification.
- Ne pas lancer de listener de scroll global non optimisé pour produire du parallax.
- Ne pas animer la mise en page avec des changements de largeur, hauteur, marge ou position qui provoquent des sauts.
- Ne pas utiliser une animation continue pour compenser une hiérarchie faible, une copie imprécise ou un CTA difficile à trouver.
- Ne pas appliquer la direction marketing du site public aux dashboards ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN ou CLIENT.
- Ne pas modifier Prisma, les migrations, le RBAC, la logique métier, les réservations, les paiements, le CRM, l’isolation client, les données ou les routes métier dans le cadre de BRIDGE 4.3.

### Conclusion de l’audit

Le Château du Mwana n’a pas besoin de davantage d’animations ; il a besoin d’un langage visuel plus propriétaire. La ligne architecturale, la lumière chaude et la révélation mesurée des photographies peuvent créer cette signature tout en respectant la confiance, la famille, l’élégance et la performance. La magie sera convaincante précisément parce qu’elle restera rare, lisible et désactivable.