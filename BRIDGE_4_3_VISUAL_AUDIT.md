# BRIDGE 4.3 — CONTRÔLE VISUEL FINAL
## « LA MAGIE DU CHÂTEAU »

## 1. Périmètre et méthode

Contrôle visuel réalisé sur le site public lancé localement, avec inspection des pages :

- `/` — Accueil
- `/presentation` — Présentation
- `/services` — Services / Formules
- `/gallery` — Galerie
- `/contact` — Contact
- `/reserver` — Réservation

Viewport inspectés : desktop 1440 px, tablette 768 px et mobile configuré à 375 px CSS. Les contrôles ont porté sur le rendu visible, le défilement, les hover, l’ouverture du lightbox, le clavier, le reduced motion et les états de chargement observables. Des captures ont été prises pendant l’inspection des zones suivantes : hero accueil desktop/mobile, hero présentation, hero services, hero galerie, galerie défilée et lightbox, contact, réservation, cartes de formules et expérience accueil.

Ce rapport ne valide pas une intention déclarée par le code : il classe ce qui est réellement perceptible à l’écran.

## 2. Verdict

# PARTIAL

Le résultat est cohérent, utilisable et plus soigné qu’un template brut, mais il ne traduit pas encore pleinement « La magie du Château ». La base commerciale est solide : photographie réelle, hiérarchie globale, CTA visibles sur desktop, formulaire et wizard fonctionnels, galerie ouvrable. En revanche, la signature architecturale n’est pas suffisamment propriétaire, les pages secondaires partagent presque toutes le même hero bleu-gradient, et le mobile présente un défaut visible de largeur sur l’accueil.

Le verdict est **PARTIAL**, principalement pour ces raisons :

1. La `ChateauLine` est perceptible comme un court trait doré, mais pas comme une ligne architecturale identifiable.
2. La « lumière chaude » est surtout rendue par des fonds or/jaune et des gradients, pas par une intervention lumineuse subtile et maîtrisée.
3. Les pages Présentation, Services, Galerie et Contact ont une identité narrative faible entre elles : badge, hero sombre/bleu, titre centré et sous-titre sont presque la même composition.
4. L’accueil déborde horizontalement au viewport mobile observé à 375 px CSS (`scrollWidth` mesuré à 388 px), ce qui est incompatible avec un contrôle visuel final pleinement validé.
5. Le lightbox s’ouvre au clavier mais le focus reste sur le bouton déclencheur ; le dialogue ne prend pas clairement le focus.
6. La réservation expose à l’écran des noms de formules de test comme `TEST_FORMULA` et `TEST_B3_FORMULA`, ce qui dégrade directement la perception premium.

Aucun P0 bloquant n’a été confirmé pendant ce contrôle. Plusieurs P1 restent toutefois suffisamment visibles pour empêcher un verdict PASS.

## 3. Synthèse visuelle

| Zone | Résultat visuel | Priorité |
|---|---|---|
| Hero accueil | Belle présence photographique et CTA lisibles sur desktop, mais image sombre, header disproportionné et signature dorée trop faible. | P1 |
| Signature ChâteauLine | Visible sous forme de petit trait, mais générique et non architecturale à l’écran. | P1 |
| Lumière | Or bien présent dans la marque et les CTA ; pas de véritable passage lumineux distinctif perceptible. | P2 |
| Motion | Révélations et hover fluides, mais vocabulaire encore standard : fade, stagger, zoom, overlay. | P1 |
| Composition | Accueil équilibré par sections, pages secondaires répétitives et parfois trop hautes. | P1 |
| Services | Cartes lisibles, images et prix visibles, CTA clairs ; catalogue encore standardisé. | P2 |
| Galerie | Les vraies images et le lightbox créent une sensation de souvenirs ; hover générique. | P2 |
| Contact | Formulaire clair, mais hero identique aux pages Catalogue/Galerie et informations par défaut visibles. | P2 |
| Réservation | Structure du wizard rassurante et lisible ; noms de données de test visibles dans les choix. | P1 |
| Mobile | Accueil en débordement horizontal et CTA secondaire peu contrasté ; pages secondaires plus contenues mais très verticales. | P1 |
| Accessibilité visuelle | Contraste global acceptable, reduced motion partiel, lightbox clavier incomplet. | P1 |

## 4. Hero Accueil

### Ce qui est réellement perceptible

À 1440 px, le hero montre immédiatement une photo d’événement avec enfants et mascotte, le nom « Le Château du Mwana », une promesse familiale et deux CTA. L’ensemble communique bien l’événement, l’enfance et la famille. La photo est un bon choix de preuve réelle.

La séquence annoncée comme une révélation de lumière et d’architecture n’est cependant pas clairement perceptible comme telle. On observe surtout :

- un header blanc très présent avec logo dans un bloc blanc qui descend visuellement sur le hero ;
- une image assombrie par overlay ;
- un badge « Bienvenue dans la magie » ;
- un petit trait doré sous la zone de contenu ;
- une apparition de contenu de type reveal standard ;
- des CTA avec transition de hover.

La signature ne dessine pas une arche, un toit, une silhouette ou un geste architectural lisible. Elle ressemble à un accent doré isolé. La lumière chaude est davantage une couleur de marque qu’un événement lumineux subtil.

### Impression de marque

Le hero donne une impression de lieu familial événementiel, mais moins une impression de Château premium que le concept cible. La photo est authentique et chaleureuse ; la composition autour de la photo reste proche d’un hero marketing générique avec badge, gradient et grand titre.

Le nom et le CTA sont immédiatement accessibles sur desktop. Le premier écran est moins convaincant sur mobile : le logo occupe beaucoup d’espace, le hero est comprimé, la promesse se casse sur de nombreuses lignes et le CTA secondaire devient très faible sur l’image claire/grise du bas.

### Desktop, tablette, mobile

- **Desktop 1440 px** : hiérarchie compréhensible, CTA visibles, mais header/logo trop dominant et photo trop assombrie.
- **Tablette 768 px** : hero lisible mais la composition paraît réduite ; le titre et les CTA occupent un espace plus contraint et l’ampleur premium diminue.
- **Mobile 375 px CSS** : débordement horizontal constaté (`body.scrollWidth = 388` pour un viewport de 375), logo/header trop présents, second CTA presque illisible et texte très fragmenté.

### Classement

- **P1** : corriger le débordement mobile et la composition du header/logo avant de considérer le hero final.
- **P1** : rendre la signature architecturale identifiable, pas seulement dorée.
- **P2** : augmenter légèrement la lisibilité de l’image sans la transformer en fond décoratif sombre.
- **P2** : raccourcir et mieux rythmer la promesse sur mobile.

## 5. Identité « La magie du Château »

### ChateauLine

La ligne est visible dans plusieurs heroes sous forme de petit trait doré. Visuellement, elle ne possède pas encore assez de caractéristiques pour devenir une signature propriétaire : elle ne renvoie pas à une architecture identifiable et paraît proche d’une décoration de séparation générique.

Elle n’est pas excessivement répétée dans les captures, mais sa répétition ne produit pas encore de reconnaissance car sa forme est trop faible. La priorité n’est donc pas d’en ajouter davantage. Il faut d’abord une forme mieux dessinée, puis l’utiliser moins souvent mais à des endroits narrativement importants.

### Couleur et lumière

- Le bleu nuit structure efficacement les heroes et le footer.
- L’or est lisible et cohérent pour les CTA, badges et accents.
- Le rouge et le vert ne sont pas utilisés comme décoration permanente, ce qui est correct.
- Les gradients bleu/indigo reviennent trop souvent et remplacent parfois une composition propre à la page.
- La « lumière » n’est pas encore une signature de mouvement ; elle est surtout une palette.

### Impression globale

Le site communique « lieu de fête familial avec identité colorée ». Il communique partiellement « Château premium et magie élégante ». Il ne bascule pas dans le jeu vidéo, le kitsch ou les confettis, ce qui est un point positif. Il reste toutefois plus proche d’un site vitrine moderne générique que d’un langage propriétaire abouti.

## 6. Motion

### Animations utiles

- Les apparitions courtes des sections aident à rythmer le défilement et ne bloquent pas la lecture.
- Le zoom léger des images de galerie renforce l’affordance de clic.
- L’ouverture du lightbox est douce, rapide et visuellement cohérente.
- Le glissement entre étapes du wizard aide à comprendre qu’un chapitre de réservation change.
- Les hover des cartes renforcent leur interactivité et gardent les CTA visibles.

### Animations encore génériques

- Les `FadeIn`, `StaggerContainer` et `StaggerItem` produisent un reveal standard, identique d’une page à l’autre.
- Les zooms d’image, changements d’ombre et overlays de galerie sont efficaces mais ne sont pas spécifiques au Château.
- Les badges avec icône Sparkles signalent la magie de manière explicite, mais générique.
- Les pages secondaires donnent parfois l’impression d’un même template bleu-gradient avec un texte différent.

### Bounce permanent et effets enfantins

Le contrôle réalisé sur l’accueil actuel ne retrouve pas d’élément `animate-bounce` actif dans le DOM observé au moment de l’inspection. Aucun bounce permanent visible n’a donc été retenu comme défaut actuel. Le rendu ne montre pas de confettis permanents, de pluie de particules ni d’effet de jeu vidéo.

### Hover

Les hover sont généralement fluides et rapides. La galerie affiche un overlay sombre avec le titre et la description ; c’est lisible, mais le traitement est un pattern de galerie courant. Les cartes Services montent légèrement et agrandissent l’image ; l’effet reste raisonnable et ne fait pas sauter la grille dans les captures.

### Classement

- **P1** : remplacer progressivement le reveal générique par une grammaire limitée autour de la ligne, de la lumière et de la photographie.
- **P2** : réduire le nombre d’éléments en stagger dans les pages longues.
- **P2** : conserver les hover mais les rendre plus éditoriaux et moins dépendants du simple zoom/ombre.
- **P3** : réduire la dépendance visuelle aux badges Sparkles lorsque la ligne Château sera stable.

## 7. Composition et rythme

### Accueil

L’accueil est la page la plus narrative. La section « L’Expérience » fonctionne bien visuellement : texte à gauche, collage photographique à droite, bénéfices courts et carte de réassurance. Le rapport texte/image est équilibré et le ton est chaleureux.

La suite Formules, Galerie et CTA final est lisible mais longue. Les cartes de formules sont propres, puis la galerie sombre crée une respiration, puis le CTA or ferme la page. La structure commerciale est claire ; la signature motion ne porte pas encore le rythme.

### Pages secondaires

Les pages secondaires ont une composition correcte mais trop homogène : header public identique, hero centré, badge, titre blanc, sous-titre blanc, fond bleu/indigo. La ligne dorée n’est pas assez forte pour créer une narration propre à chaque page.

Les grands espaces vides du hero et la hauteur fixe des bandeaux donnent une sensation de section répétée plutôt que de chapitre distinct. Présentation est la plus différente par son bandeau jaune, mais ce traitement est plat et ressemble moins à une scène premium qu’à un aplat de couleur.

## 8. Présentation

### Constat visuel

La page affiche « Notre Magie » dans un large bandeau jaune/or avec un texte centré, puis un bloc blanc arrondi contenant plusieurs paragraphes et deux cartes Mission/Vision. La lecture est claire et la copie est cohérente avec la famille, la sécurité et l’émerveillement.

### Évaluation

- **Narration** : faible à moyenne. La page explique bien, mais ne fait pas vivre une histoire visuelle du Château.
- **Identité** : l’or est présent, mais le bandeau plat ne suffit pas à évoquer l’architecture ou les souvenirs.
- **Motion** : le reveal de texte est discret, mais générique.
- **Premium** : le grand bloc blanc arrondi donne une présentation propre mais assez standard.

### Priorités

- **P1** : donner à la Présentation une scène visuelle propre, idéalement une photographie réelle et une transition architecturale, au lieu de seulement changer la couleur du hero.
- **P2** : réduire l’effet « bloc de texte dans une carte » et améliorer le rythme éditorial.

## 9. Services / Formules

### Cartes

Sur desktop, les cartes inspectées montrent bien l’image, le titre, la description, le prix et le CTA. Les formules `Combo Mini`, `Combo Kymou` et `Combo Medi` sont immédiatement comparables. Les cartes sont stables, les prix sont forts visuellement et les boutons « Réserver » sont compréhensibles.

Le traitement est néanmoins très catalogue : images rectangulaires, grandes cartes blanches arrondies, ombre, petit pictogramme Sparkles, hover de profondeur. La perception premium vient davantage de la propreté que d’une direction créative propre au Château.

### Problèmes observés

- Certaines données visibles sont des intitulés de test (`TEST_FORMULA`, `TEST_B3_FORMULA`) dans le parcours de réservation. Même si ce n’est pas un problème de motion, c’est un défaut visuel P1.
- Les cartes de services additionnels peuvent afficher des capacités « Max 0 enf. », ce qui paraît incohérent à l’écran pour un service comme Barbe à papa / Popcorn.
- Les images sont fortes et colorées, parfois plus proches d’un catalogue promotionnel que d’un album premium ; leur cadrage et leur qualité doivent être harmonisés.
- La magie est représentée par le pictogramme et la couleur, pas par une interaction vraiment propriétaire.

### Classement

- **P1** : retirer de l’expérience publique les libellés de test visibles et vérifier la présentation des capacités incohérentes.
- **P2** : donner aux cartes une signature d’image et de lumière plus subtile, sans ajouter d’ornements.
- **P2** : harmoniser les ratios et la qualité perçue des images.
- **P3** : réduire l’usage répétitif de Sparkles comme marqueur de magie.

## 10. Galerie

### Qualité visuelle

La galerie utilise de vraies photos d’événements, de jeux et de réalisations. La première image observée montre une scène familiale avec enfants et mascotte ; le lightbox permet de voir le visuel en grand, avec une ouverture rapide et une fermeture claire.

La sensation de souvenirs est réelle grâce aux scènes et aux légendes comme « Réalisations » et « Nos plus beaux événements ». Le traitement reste cependant une masonry classique : zoom 1.05 environ, overlay sombre, texte en bas. L’image porte l’émotion ; l’UI ne lui ajoute pas encore une signature Château distincte.

### Lightbox

Points positifs :

- ouverture visuelle rapide ;
- image centrée et grande ;
- bouton Fermer visible ;
- Escape ferme le dialogue ;
- scroll du body bloqué pendant l’ouverture ;
- alt text présent dans le snapshot accessible.

Point à corriger :

- **P1 accessibilité** : après ouverture par clavier, le focus reste sur le bouton d’image déclencheur au lieu d’aller sur le bouton « Fermer » ou le dialogue. Le contrôle visuel confirme donc un focus management incomplet.

### Classement

- **P1** : corriger le focus initial et le retour de focus du lightbox.
- **P2** : faire de la galerie un récit de souvenirs par une image dominante et un contexte plus éditorial.
- **P2** : remplacer progressivement l’overlay générique par une lumière ou une ligne d’accent plus spécifique.
- **P3** : éviter d’ajouter des particules ou du parallax sur les photos.

## 11. Contact

### Constat visuel

Le hero Contact reprend le bandeau bleu/indigo, le badge « Nous joindre », le titre et la promesse. Le bloc suivant est équilibré : coordonnées bleu nuit à gauche, formulaire blanc à droite. Les champs sont correctement libellés, le CTA est visible et le retour de succès existe.

### Limites

- La page ressemble visuellement à Services et Galerie avant d’arriver au contenu.
- Les valeurs par défaut « Adresse sur demande », « Non spécifié » et « Non spécifié » sont visibles dans le rendu inspecté. Elles affaiblissent la confiance et la perception professionnelle.
- Le formulaire est fonctionnel mais très standard ; il n’exprime pas une transition sereine ou une lumière de confirmation propre au Château.

### Classement

- **P1** : éviter l’affichage public de coordonnées par défaut lorsqu’elles ne sont pas renseignées, ou présenter cet état de manière plus rassurante et explicitement temporaire.
- **P2** : donner à Contact une composition narrative distincte, sans ajouter de décoration dans les champs.
- **P2** : conserver le feedback succès mais le rendre cohérent avec la ligne/lumière de la marque.

## 12. Réservation

### Constat visuel

Le hero est sombre et plus calme que l’accueil. Le titre « Réserver votre événement », le sous-titre et le chevauchement avec la carte blanche du wizard donnent une bonne impression de parcours sérieux et guidé. La progression en quatre étapes est immédiatement compréhensible.

Le premier écran du wizard présente les choix de formules sous forme de cartes ; le prix et la capacité sont visibles. Le glissement entre étapes est court et utile. Le CTA et les champs sont plus fonctionnels que décoratifs, ce qui est approprié.

### Défauts visibles

- Des formules nommées `TEST_FORMULA` et `TEST_B3_FORMULA` apparaissent dans le parcours inspecté.
- Certaines options sont affichées comme des formules alors qu’elles ressemblent à des services additionnels, ce qui brouille la hiérarchie visuelle du choix.
- Le chargement initial affiche « Chargement magique en cours... » avec un spinner générique ; le délai avant le wizard est perceptible et le message ne renseigne pas sur l’étape en préparation.
- Le hero de réservation est propre, mais reste une variante du même traitement de page secondaire ; il ne possède pas une narration particulière de confiance ou de sérénité.

### Classement

- **P1** : nettoyer les données visibles de test et vérifier la distinction visuelle entre formules et options.
- **P1** : réduire le délai perceptible avant interaction et préserver une structure de wizard stable pendant le chargement.
- **P2** : renforcer le feedback de progression sans ajouter de magie décorative.

## 13. Mobile, tablette et desktop

### Desktop 1440 px

- Header lisible mais logo dans un bloc blanc très dominant.
- Heroes propres mais répétitifs.
- Accueil et cartes de services équilibrés.
- Galerie et lightbox convaincants par leurs vraies images.
- Aucun débordement horizontal observé sur les pages secondaires à ce format.

### Tablette 768 px

- Le hero accueil reste lisible mais paraît comprimé.
- La navigation desktop est remplacée par une version réduite et seul le CTA Réserver demeure visible.
- Les espacements et titres prennent proportionnellement beaucoup de hauteur.
- Les cartes et formulaires nécessitent une vérification sur les libellés les plus longs ; la composition est moins premium qu’en desktop.

### Mobile 375 px CSS

- Accueil : débordement horizontal mesuré, avec une largeur document de 388 px.
- Accueil : second CTA peu contrasté sur la partie basse du hero.
- Accueil : header/logo consomme beaucoup d’espace et déplace la photo et le message.
- Services : le hero est très vertical, le titre se casse sur deux lignes et le contenu paraît étroit ; les cartes restent lisibles après le défilement.
- Pages secondaires : pas de débordement horizontal mesuré dans les vérifications dédiées, mais beaucoup d’espace vertical avant le contenu utile.
- Navigation mobile : le menu de navigation principal disparaît ; le CTA Réserver reste disponible, mais l’accès aux autres pages n’est pas aussi immédiat.

### Classement

- **P1** : corriger l’overflow horizontal de l’accueil à 375 px.
- **P1** : assurer un contraste suffisant du CTA secondaire et des textes sur image mobile.
- **P2** : réduire la hauteur des heroes secondaires et laisser apparaître plus vite le contenu utile.
- **P2** : rendre la navigation mobile complète et explicitement découvrable si le menu est masqué.

## 14. Accessibilité visuelle et interaction

### Points positifs

- Le skip link est présent.
- Les textes des CTA sont explicites.
- Les images possèdent des alt text dans les surfaces principales observées.
- Les statuts et étapes de réservation sont accompagnés de texte, pas seulement de couleurs.
- Le reduced motion rend le titre accueil immédiatement visible et supprime le déplacement du reveal observé.
- Escape ferme le lightbox.

### Défauts

- Le focus du lightbox ne se déplace pas vers le dialogue à l’ouverture clavier.
- Les états hover de la galerie ne sont pas équivalents visuellement à un focus suffisamment évident dans le contrôle réalisé.
- Les textes blancs semi-transparents sur les gradients et les CTA secondaires sur photo doivent être mesurés, car plusieurs zones paraissent faibles à l’œil sur mobile.
- Le logo déclenche un avertissement Next.js de dimensions modifiées sans largeur/hauteur compensée, ce qui peut contribuer à un rendu ou un layout moins stable.
- La navigation mobile masquée ne fournit pas dans le contrôle visuel une entrée évidente vers toutes les destinations publiques.

### Classement

- **P1** : focus management du lightbox.
- **P1** : contraste et affordance du CTA secondaire mobile.
- **P2** : mesurer les contrastes WCAG réels des overlays et textes secondaires.
- **P2** : stabiliser le ratio du logo pour supprimer l’avertissement et réduire le risque de décalage.

## 15. Performance visuelle

### Observations

- Les captures ne montrent pas de saccade majeure sur desktop pendant les reveals, hover ou lightbox.
- L’animation de galerie et l’ouverture lightbox restent rapides.
- Le zoom hero de longue durée n’est pas un blocage visible, mais il anime une image lourde potentielle pendant longtemps ; son intérêt narratif reste faible.
- Le chargement de Réservation expose un écran d’attente avant l’interaction. Le délai est acceptable comme état réseau, mais le contenu final arrive après une attente perceptible.
- La console du navigateur signale des polices préchargées non utilisées dans le délai attendu et un ratio logo modifié. Ce sont des signaux de finition/performance, pas une preuve de panne visuelle.
- Le hero dépend d’une grande photographie et de plusieurs overlays ; son poids réel doit être mesuré sur réseau mobile avant d’ajouter une séquence plus riche.

### Classement

- **P1** : optimiser et mesurer le poids de l’image hero avant d’ajouter davantage de motion.
- **P2** : limiter les animations longues et les overlays répétés.
- **P2** : traiter les avertissements de preload de polices et de dimensions d’image.
- **P3** : remplacer les effets de blur décoratifs par des surfaces plus simples lorsqu’ils n’apportent pas d’information.

## 16. Matrice des problèmes

| Priorité | Zone | Problème visuel constaté | Impact |
|---|---|---|---|
| P0 | Toutes | Aucun blocage total confirmé pendant l’inspection. | Le site reste parcourable et les CTA principaux restent utilisables. |
| P1 | Accueil mobile | Débordement horizontal mesuré à 375 px CSS. | Rupture de finition et risque de contenu inaccessible hors cadre. |
| P1 | Accueil | ChateauLine trop courte et générique pour porter la signature propriétaire. | Le concept « Magie du Château » n’est pas reconnaissable par sa forme. |
| P1 | Pages secondaires | Présentation, Services, Galerie et Contact réutilisent presque le même hero bleu-gradient. | Faible identité narrative et impression de template. |
| P1 | Lightbox | Focus clavier resté sur le déclencheur après ouverture. | Dialogue moins robuste pour clavier et technologies d’assistance. |
| P1 | Réservation | `TEST_FORMULA` et `TEST_B3_FORMULA` visibles à l’écran. | Rupture directe de confiance et de perception premium. |
| P1 | Réservation | Délai de chargement perceptible avant le wizard. | Interaction retardée et message d’attente peu informatif. |
| P1 | Contact | « Adresse sur demande » et « Non spécifié » visibles. | Impression de site incomplet ou non finalisé. |
| P2 | Accueil mobile | CTA secondaire peu contrasté sur l’image et le fondu bas. | Action secondaire difficile à repérer. |
| P2 | Heroes secondaires | Trop de bleu/indigo et grands espaces similaires. | Rythme vertical répétitif et différenciation faible. |
| P2 | Galerie | Hover overlay/zoom fonctionnel mais générique. | La galerie évoque des souvenirs par les images, pas par un traitement propriétaire. |
| P2 | Services | Cartes propres mais catalogue standard ; données de capacité parfois incohérentes. | Perception premium limitée et compréhension à clarifier. |
| P2 | Accessibilité | Contrastes des textes semi-transparents et focus hover à mesurer/renforcer. | Lisibilité et navigation clavier potentiellement fragiles. |
| P2 | Performance | Avertissements preload de polices et dimensions logo modifiées. | Finition et stabilité visuelle à consolider. |
| P3 | Magie | Badges Sparkles et petit trait doré restent des signes génériques. | Signature moins distinctive qu’attendu. |
| P3 | Motion | Stagger et fade répétés d’une page à l’autre. | Mouvement prévisible, sans valeur narrative propre. |

## 17. Recommandations finales

1. Corriger d’abord l’overflow de l’accueil mobile et la composition du header/logo.
2. Redessiner la ChateauLine comme une forme architecturale identifiable, puis limiter son usage aux transitions de chapitre et au hero.
3. Donner à chaque page secondaire une composition narrative propre : Présentation par la preuve et l’histoire, Services par la comparaison, Galerie par le souvenir, Contact par la confiance, Réservation par la sérénité.
4. Garder l’image réelle visible et moins assombrie dans le hero ; la lumière doit souligner un point, pas remplacer la photographie.
5. Maintenir les cartes Services lisibles au repos, avec un seul geste de hover/focus et des données propres.
6. Corriger le focus du lightbox et tester le cycle ouverture, fermeture Escape, retour au déclencheur et clavier complet.
7. Nettoyer les intitulés de données visibles dans la réservation et vérifier les valeurs par défaut affichées dans Contact.
8. Mesurer le poids des images, stabiliser les dimensions du logo et vérifier le LCP avant toute animation supplémentaire.
9. Tester avec reduced motion, sans JavaScript lent, et à 375/768/1440 px après chaque étape visuelle.
10. Ne pas confondre une ligne dorée avec une identité : la signature doit être reconnaissable même sur une capture fixe sans animation.

## 18. Ce qui ne doit pas être déclaré comme validé

- Ne pas considérer la présence d’un composant `ChateauLine` comme preuve d’une signature architecturale réussie.
- Ne pas considérer `FadeIn`, `Stagger` et `AnimatePresence` comme preuve d’un motion design propriétaire.
- Ne pas déclarer le mobile final tant que l’overflow accueil à 375 px n’est pas supprimé.
- Ne pas valider la galerie uniquement parce que le lightbox s’ouvre ; le focus clavier doit aussi être correct.
- Ne pas considérer une palette or/bleu comme preuve suffisante de « La magie du Château ».
- Ne pas transformer le dashboard en extension marketing du site public.
- Ne pas commencer BRIDGE 4.4 sur la base de ce contrôle.