# BRIDGE 4.2 — AUDIT UX/UI INDÉPENDANT

## 1. Résumé exécutif

Cet audit porte sur l’état observé des cinq espaces authentifiés : ADMIN, SUPERVISOR, SECRETARY, LOGISTICIAN et CLIENT. Il évalue la compréhension immédiate du tableau de bord, la hiérarchie, les actions, les états d’interface, le responsive, l’accessibilité et la cohérence avec l’identité du Château du Mwana. Il ne propose aucune nouvelle fonctionnalité métier et ne conclut pas par un statut global du Bridge.

Le socle est lisible et partagé : sidebar, header, cartes, compteurs et liens de détail. Le routage visible par rôle est compréhensible et la navigation est filtrée selon le rôle. En revanche, les cinq espaces ressemblent encore à des déclinaisons d’un même tableau de bord générique. Les différences de mission existent dans les données affichées, mais elles sont moins visibles dans la composition, le vocabulaire d’action et l’ordre de priorité.

La réponse à la question des cinq secondes est donc inégale :

| Espace | Compréhension immédiate | Diagnostic court |
|---|---|---|
| ADMIN | Partielle | L’activité globale est visible, mais les alertes et les actions prioritaires sont noyées dans plusieurs blocs équivalents. |
| SUPERVISOR | Bonne pour les volumes, moyenne pour l’action | Les opérations du jour ressortent, mais les incidents et décisions de supervision ne dominent pas assez. |
| SECRETARY | Moyenne | Les compteurs commerciaux sont présents, mais les priorités sont répétées dans deux sections concurrentes. |
| LOGISTICIAN | Moyenne à faible | Beaucoup d’informations opérationnelles, mais l’ordre d’exécution terrain n’est pas assez direct. |
| CLIENT | Bonne pour la réservation, moyenne pour le suivi | La réservation à venir est identifiable, mais l’état exact, le prochain geste et le paiement se dispersent. |

Les problèmes les plus importants sont P1 : hiérarchie de triage insuffisante, répétitions, CTA textuels peu saillants, surcharge progressive des dashboards opérationnels, et états de chargement/erreur non spécifiques aux pages. Aucun P0 d’accès incorrect n’est retenu sur la base du code observé : `/dashboard` redirige selon le rôle et la sidebar filtre les destinations. Les droits réels restent à vérifier par tests utilisateurs authentifiés, mais cela relève du contrôle d’accès plutôt que de la présentation UX.

## 2. État global

### Forces observées

- Une structure commune réduit l’apprentissage entre espaces : sidebar à gauche, header fixe, contenu principal contraint et cartes homogènes.
- Les cinq dashboards affichent des données réelles et des statuts métier lisibles sous forme de compteurs, listes et badges.
- Les liens de détail sont présents dans la plupart des sections et les actions rapides sont regroupées en fin de page.
- Les états vides existent dans plusieurs listes et donnent généralement une explication courte.
- Un lien d’évitement « Passer au contenu principal » est présent au niveau racine et la préférence `prefers-reduced-motion` est prise en compte.

### Risques transverses

- Le contenu commence souvent par le titre, puis plusieurs KPI, puis des cartes, puis les actions. L’action à faire maintenant arrive donc après le diagnostic au lieu d’être son prolongement direct.
- Le chiffre principal d’une section est souvent répété dans un hero, une carte KPI et une liste. Cette répétition augmente la longueur sans augmenter la décision possible.
- Les CTA sont majoritairement des liens textuels « Voir… », placés en bas des cartes. Ils sont moins repérables que les compteurs et ne donnent pas toujours le verbe exact attendu.
- Les cartes blanches, bordures slate et ombres légères sont très nombreuses. Elles structurent, mais produisent de grands espaces vides et une hiérarchie peu contrastée.
- Les données limitées à 3 ou 5 éléments ne signalent pas toujours la portée de la liste ni la priorité de ce qui est masqué.
- Le loading global est générique (« Chargement… ») et les squelettes préparés ne sont pas intégrés aux dashboards. L’utilisateur voit donc une attente sans aperçu de la structure qui arrive.
- L’erreur globale expose `error.message`, ce qui peut être trop technique ou trop peu utile selon l’erreur ; elle ne propose pas de contexte propre au dashboard.

## 3. ADMIN

### Lecture par dimension

| Dimension | Constat indépendant |
|---|---|
| Hiérarchie visuelle | Le hero « Vue d’ensemble » domine, puis quatre KPI, puis trois cartes opérationnelles. La hiérarchie est stable mais trop uniforme : rien ne signale fortement ce qui exige une décision maintenant. |
| Hero | Le gradient slate donne un point d’entrée, mais le titre reste descriptif. Il ne résume ni la santé de l’activité ni l’alerte principale. |
| KPI | CA, clients actifs, réservations confirmées et équipe sont pertinents. Le CA et les réservations réapparaissent ensuite, avec un risque de redondance. |
| CTA | Les actions rapides sont présentes, mais reléguées après les KPI et les sections d’analyse. « Accès Rapide » ne hiérarchise pas l’accès le plus important. |
| Navigation | Le rôle ADMIN voit beaucoup de destinations. La navigation est exhaustive mais peu regroupée par décision : activité, commerce, opérations et configuration sont mélangés. |
| Densité | Densité moyenne sur desktop, longue sur mobile à cause de nombreux blocs verticaux. Les trois cartes opérationnelles ont une faible densité informationnelle. |
| Informations prioritaires | L’activité globale est visible ; les maintenances servent de proxy d’alerte, mais alertes, notifications et opérations ne sont pas distinguées. |
| Actions principales | Analytics, réservations, CRM et CMS sont traités comme des accès équivalents, alors que leur fréquence et leur impact sont différents. |
| Alertes | « Alertes » affiche les maintenances en cours, tandis que le lien mène aux notifications : le libellé et la destination ne couvrent pas exactement la même information. |
| Activité récente | Cinq réservations récentes sont utiles, mais la liste ne rend pas l’urgence, le client ou l’étape suivante immédiatement visibles. |
| États vides | L’activité vide est un texte seul, sans explication ni lien d’exploration ; les composants d’empty state préparés ne sont pas utilisés ici. |
| Loading | Le loading de layout est plein écran et générique ; il ne préserve pas la forme du hero ou des KPI. |
| Error | L’erreur est globale au layout protégé et permet de réessayer, mais ne distingue pas erreur de données, d’autorisation ou de réseau. |
| Responsive | Les grilles passent en une colonne, mais la page devient une longue succession de cartes ; l’ordre des priorités n’est pas renforcé sur petit écran. |
| Accessibilité | Les intitulés et liens sont textuels, mais la structure de titres et les états actifs sont à vérifier ; les icônes ajoutent peu de sens dans les cartes. |
| Identité Château | Le bleu profond du sidebar est cohérent, mais l’ADMIN utilise surtout slate/indigo et très peu l’or de marque ; la photographie réelle est absente. |

### Problèmes spécifiques

- **P1 — Triage peu explicite :** « Alertes », « Performance » et « Activité Récente » sont trois lectures différentes, mais aucune ne répond directement à « que dois-je regarder maintenant ? ».
- **P1 — Redondance :** CA, réservations et maintenance sont présentés à plusieurs endroits avec peu de contexte supplémentaire.
- **P2 — CTA tardifs :** l’action d’une carte est souvent le dernier élément, sous une grande zone vide.
- **P2 — KPI hors période :** les chiffres globaux n’indiquent pas clairement une période de référence, ce qui limite leur interprétation.
- **P3 — Finition visuelle :** l’hero sombre est plus proche d’un SaaS générique que d’un espace de pilotage premium associé au Château.

## 4. SUPERVISOR

### Lecture par dimension

| Dimension | Constat indépendant |
|---|---|
| Hiérarchie visuelle | « Opérations du Jour » est correctement en tête et les incidents/stock critique sont visibles dans les KPI. La section équipe prend toutefois autant de place que les décisions opérationnelles. |
| Hero | Le hero répond bien au quotidien avec réservations, missions et livraisons. Les deux boutons rendent l’espace plus actionnable que les autres rôles. |
| KPI | À planifier, en cours, incidents et stock critique sont alignés avec la supervision. Ils ne précisent pas tous la prochaine action ni la gravité. |
| CTA | Les CTA du hero sont visibles. Les actions rapides répétées en bas de page doublonnent partiellement ces accès. |
| Navigation | Le superviseur voit réservations, analytics, CRM, catalogue, logistique, CMS, messages, imports et utilisateurs. Cette largeur de menu dilue sa mission opérationnelle. |
| Densité | Densité élevée : hero, quatre KPI, équipe, réservations, maintenance et actions rapides. Sur mobile, l’essentiel est repoussé par les sections secondaires. |
| Informations prioritaires | Incidents, missions et stock critique devraient dominer ; l’équipe et les analytics ont une priorité secondaire mais une présence visuelle comparable. |
| Actions principales | « Gérer les réservations » et « Voir la logistique » sont correctes, mais les listes d’incidents et de maintenance ne proposent pas toujours une action au niveau de la ligne. |
| Alertes | Les incidents sont comptés, mais pas séparés en niveau de gravité ; le stock critique et la maintenance utilisent des codes visuels différents sans légende commune. |
| Activité récente | Il s’agit davantage de listes de réservations/maintenance que d’un fil d’activité. Les décisions récentes ou changements d’état ne sont pas explicités. |
| États vides | Les listes affichent des messages sobres (« Aucune… »), mais l’état normal sans incident pourrait être plus rassurant et plus utile dans sa formulation. |
| Loading | Même loading générique que les autres rôles, sans distinction entre attente de planning et attente de stock. |
| Error | L’erreur est commune au layout ; une erreur sur une source ne permet pas de conserver les autres informations fiables. |
| Responsive | Les cartes et boutons en flex peuvent devenir serrés ; le hero et ses deux CTA doivent être vérifiés avec des libellés longs sur mobile. |
| Accessibilité | Les KPI sont visuellement compréhensibles, mais la priorité ne repose pas seulement sur la couleur ; les incidents ont besoin d’un libellé textuel de gravité. |
| Identité Château | Le gradient indigo est cohérent avec une convention produit mais pas avec les couleurs déclarées Château ; il concurrence le bleu profond de la marque. |

### Problèmes spécifiques

- **P1 — Mission diluée :** la vue équipe, analytics, CMS et utilisateurs occupent un espace visuel comparable aux incidents et missions.
- **P1 — Incidents non triés :** le compteur indique un volume, pas ce qui doit être traité en premier.
- **P2 — Actions répétées :** les CTA du hero et les quatre actions rapides du bas se recouvrent.
- **P2 — Listes tronquées :** réservations et maintenance sont limitées à cinq éléments sans repère clair sur le reste.
- **P3 — Vocabulaire :** « Voir la logistique » est moins opératoire que le verbe attendu dans un contexte de supervision.

## 5. SECRETARY

### Lecture par dimension

| Dimension | Constat indépendant |
|---|---|
| Hiérarchie visuelle | Les KPI de nouvelles réservations, messages, factures et nouveaux clients sont pertinents. Les deux grandes sections « Planning du Jour » puis « Priorités du Jour » se concurrencent. |
| Hero | Le planning du jour est utile, mais il partage le rôle de hero avec un second bloc amber. Aucun des deux ne formule l’ordre de traitement. |
| KPI | Les quatre KPI correspondent bien à l’activité commerciale et administrative. Les nouvelles réservations et messages ont un potentiel de priorité supérieur à « nouveaux clients ». |
| CTA | Les actions de réservation et de messages sont visibles dans les heroes ; l’action facture pointe vers analytics, ce qui crée une correspondance faible entre libellé et destination. |
| Navigation | CRM, réservations, catalogue, analytics et messages sont pertinents. L’absence de regroupement visuel rend le menu plus large que la mission quotidienne. |
| Densité | Densité élevée, avec deux gradients, deux séries de compteurs et plusieurs cartes commerciales. La répétition se ressent fortement sur mobile. |
| Informations prioritaires | Messages non lus, réservations à confirmer et factures en attente sont les priorités observables, mais elles apparaissent à plusieurs endroits sans ordre commun. |
| Actions principales | Traiter les messages et confirmer les réservations sont les gestes centraux ; ils ne sont pas réunis dans une zone unique de priorité. |
| Alertes | Les messages utilisent amber, les réservations blue et les factures purple. La couleur indique des catégories, pas clairement une urgence. |
| Activité récente | Les messages sont listés jusqu’à cinq éléments. Il n’y a pas de synthèse récente couvrant réservations, contacts et factures. |
| États vides | Le message « Aucun message non lu » est clair. Il manque un traitement équivalent et contextualisé pour les autres priorités nulles. |
| Loading | L’attente est commune et ne montre pas les blocs de travail commerciaux. |
| Error | L’erreur globale ne permet pas d’identifier quelle source commerciale est indisponible. |
| Responsive | Deux heroes empilés et quatre actions rapides prolongent beaucoup la page ; les CTA peuvent être repoussés sous la ligne de flottaison. |
| Accessibilité | La plupart des informations ont un texte associé, mais la hiérarchie des titres doit être vérifiée et les états ne doivent pas dépendre des seules teintes amber/blue/purple. |
| Identité Château | Le bleu clair et l’ambre sont lisibles, mais l’ensemble ne construit pas une identité premium cohérente ; les couleurs fonctionnelles gagneraient à être plus rares et mieux sémantisées. |

### Problèmes spécifiques

- **P1 — Deux priorités concurrentes :** planning et priorités réaffichent les mêmes nombres au lieu de former une séquence de travail unique.
- **P1 — CTA mal aligné :** « Voir les factures » renvoie à analytics, ce qui augmente l’incertitude au moment du clic.
- **P2 — Liste partielle :** les messages non lus sont limités à cinq et la page ne dit pas immédiatement combien restent à traiter au-delà de cette liste.
- **P2 — KPI interprétables difficilement :** le CA est global, sans période explicite, et se trouve plus bas que les urgences opérationnelles.
- **P3 — Ton visuel :** la succession de gradients bleus puis amber crée un effet de signalisation plutôt qu’une composition Château maîtrisée.

## 6. LOGISTICIAN

### Lecture par dimension

| Dimension | Constat indépendant |
|---|---|
| Hiérarchie visuelle | Les quatre KPI d’opérations sont bons, mais le hero d’état des équipements arrive ensuite et repousse les incidents et tâches terrain dans un flux long. |
| Hero | L’état des équipements est utile, mais il devrait compléter la mission en cours plutôt que la remplacer comme message principal. |
| KPI | À planifier, préparation, en cours et incidents sont directement liés au métier. Le volume ne distingue pas ce qui est dû aujourd’hui de ce qui est simplement ouvert. |
| CTA | Stock et maintenance sont accessibles dans le hero ; missions, livraisons et emplacements arrivent plus bas. Les actions prioritaires ne sont donc pas toutes au même niveau. |
| Navigation | Le menu logistique est cohérent, mais la page et les actions rapides répètent les mêmes quatre destinations. |
| Densité | C’est le dashboard le plus chargé : stock, maintenance, livraisons, emplacements et actions rapides. La densité devient une charge de tri sur mobile. |
| Informations prioritaires | Incidents, missions en préparation et livraisons en attente devraient être avant les inventaires généraux et les emplacements. |
| Actions principales | L’exécution terrain est suggérée par « Gérer le stock » et « Voir la maintenance », mais les lignes de stock critique n’offrent pas de lien direct. |
| Alertes | Les alertes stock sont concrètes et textuelles. Les incidents et maintenance utilisent aussi amber/red, sans ordre de gravité partagé. |
| Activité récente | Il n’y a pas de fil des opérations récentes ; les listes représentent des états courants plutôt que les derniers événements. |
| États vides | Les états de stock et d’emplacements sont relativement explicites. Un état vide de livraisons ou missions n’est pas mis en avant comme état normal de travail. |
| Loading | Une attente globale est insuffisante pour une page issue de plusieurs sources logistiques. |
| Error | Une défaillance partielle de stock ou livraison devrait être localisable ; l’état global actuel ne le permet pas visuellement. |
| Responsive | Les longues listes et quatre actions rapides empilent beaucoup de contenu ; les tableaux/listes détaillés doivent rester scannables sans réduire excessivement le texte. |
| Accessibilité | Les statuts sont accompagnés de libellés, ce qui est positif. La couleur seule reste toutefois utilisée comme renforcement principal des niveaux. |
| Identité Château | Le hero vert peut fonctionner comme état de disponibilité, mais le gradient vert en grande surface transforme une couleur fonctionnelle en couleur de marque dominante. |

### Problèmes spécifiques

- **P1 — Ordre d’exécution insuffisant :** la page montre l’état des actifs avant de rendre évidente la prochaine mission à exécuter.
- **P1 — Surcharge :** les mêmes accès logistiques apparaissent dans le hero, dans les liens de section et dans les actions rapides.
- **P2 — Pas d’action au niveau des alertes :** une ligne de stock critique identifie le problème, mais le clic d’action n’est pas direct.
- **P2 — Portée temporelle ambiguë :** « aujourd’hui » est calculé pour les missions créées ce jour, ce qui ne se lit pas comme une liste de missions à exécuter aujourd’hui.
- **P3 — Cohérence de palette :** indigo pour les liens, vert pour le hero, amber pour la préparation et red pour les incidents donnent une palette très expressive mais peu systémique.

## 7. CLIENT

### Lecture par dimension

| Dimension | Constat indépendant |
|---|---|
| Hiérarchie visuelle | L’accueil personnalisé et les réservations à venir ouvrent correctement le parcours. Le total dépensé et les points fidélité prennent toutefois autant de poids que le prochain rendez-vous. |
| Hero | Il n’y a pas de hero de réservation ou de prochaine étape ; le message « Bonjour » est accueillant mais ne répond pas immédiatement à « que puis-je faire maintenant ? ». |
| KPI | Réservations à venir, total dépensé, points et factures couvrent le compte. Le total dépensé est moins utile à l’action immédiate que l’état de la prochaine réservation. |
| CTA | « Réserver maintenant » est bien placé en état vide. En état rempli, la prochaine action n’est pas mise en avant au niveau de chaque réservation. |
| Navigation | Dashboard, réservations, réservation publique et contact sont compréhensibles. Le lien « Mon Profil » renvoie au dashboard client plutôt qu’à une page de profil dédiée, ce qui peut surprendre. |
| Densité | Densité raisonnable desktop, mais quatre KPI, réservations, fidélité, paiements et actions rapides produisent une page longue. |
| Informations prioritaires | La prochaine réservation et son statut devraient dominer ; paiement, fidélité et historique sont secondaires. |
| Actions principales | Réserver, consulter les réservations et contacter le Château sont présents, mais distribués dans le dernier bloc plutôt qu’au moment du besoin. |
| Alertes | Les factures en attente sont comptées, mais pas présentées comme une action urgente ou comme un état à résoudre. |
| Activité récente | L’activité fidélité et l’historique de paiements existent. Elles sont séparées et ne donnent pas un récit simple de la réservation. |
| États vides | Les réservations vides ont un CTA adapté. Les profils absents/non configurés affichent un message de support sans autre orientation visuelle. |
| Loading | Le spinner générique ne donne aucune indication sur les réservations, factures ou fidélité en cours de chargement. |
| Error | L’état d’erreur est commun au layout protégé ; le client ne reçoit pas d’explication spécifique sur ses données. |
| Responsive | Les réservations utilisent des lignes flexibles ; les dates longues en français et les badges peuvent comprimer l’espace. La table dédiée des réservations repose sur un scroll horizontal. |
| Accessibilité | Les actions d’icône de la table ont un texte accessible. Les statuts restent compréhensibles par texte, mais la structure de titres et les annonces d’état doivent être contrôlées. |
| Identité Château | L’or apparaît dans la fidélité, tandis que les CTA utilisent indigo. La photographie réelle et une typographie distinctive sont absentes de cet espace authentifié. |

### Problèmes spécifiques

- **P1 — Prochaine étape peu saillante :** une réservation à venir est listée, mais son action principale et son état détaillé ne dominent pas l’écran.
- **P1 — Actions dispersées :** réservation, consultation, contact et profil sont regroupés tardivement, après des informations secondaires.
- **P2 — Paiement partiellement actionnable :** « en attente » est visible, mais le parcours de résolution n’est pas évident depuis la ligne.
- **P2 — Table mobile lourde :** le scroll horizontal conserve la table mais dégrade la lecture sur petit écran, notamment pour les dates et actions.
- **P3 — Accueil générique :** le salut personnalisé ne suffit pas à porter une expérience client premium et distinctive.

## 8. Navigation

La navigation latérale est techniquement simple et cohérente, avec filtrage par rôle et indication visuelle de la route active. Les écarts UX sont les suivants :

- Les intitulés sont mélangés entre objets (« CRM », « Catalogue »), fonctions (« Analytics »), domaines (« Logistique & Inventaire ») et opérations (« Mes réservations »). Une logique de regroupement améliorerait le balayage sans ajouter de destination.
- Le rôle SUPERVISOR reçoit des entrées CMS, imports et utilisateurs qui ne sont pas centrales dans la question « que dois-je superviser ? ». Leur présence n’est pas nécessairement incorrecte, mais elle dilue la hiérarchie.
- Le header contient une recherche désactivée. Son emplacement ressemble à une fonction disponible, ce qui crée une affordance trompeuse malgré le libellé accessible.
- Le bouton mobile de sidebar est flottant en bas à droite. Il est visible, mais son état ouvert/fermé devrait être annoncé et son libellé accessible devrait refléter l’action courante.
- Le bouton de notifications affiche un point statique. Un indicateur visuel non relié à un état lisible peut induire une fausse priorité.
- Les liens d’action utilisent souvent indigo alors que la navigation active utilise aussi indigo : action, sélection et marque ne sont pas assez différenciées.

## 9. Responsive

- Les grilles `sm:grid-cols-2` et `lg:grid-cols-4` fournissent un repli de base, mais elles ne garantissent pas une hiérarchie mobile ; tout est simplement empilé.
- Les heroes avec deux CTA utilisent `flex` sans stratégie explicite d’empilement ou de largeur. Les libellés longs peuvent devenir serrés sur les petits écrans.
- Les tableaux sont rendus scrollables horizontalement. C’est acceptable comme garde-fou, mais les colonnes essentielles et l’action doivent rester atteignables sans deviner qu’un défilement existe.
- Les pages de dashboard n’emploient pas les utilitaires responsive préparés dans `globals.css`, ce qui indique une différence entre le design system déclaré et son usage réel.
- La sidebar mobile s’ouvre avec overlay, mais le focus, le retour du focus au bouton et la fermeture par Escape ne sont pas établis dans le composant observé.
- Les grands espacements verticaux et les cartes répétées augmentent fortement le temps de scroll. Sur mobile, la priorité doit être déterminée par l’ordre DOM, pas seulement par la couleur.

## 10. Accessibilité

### Points positifs

- `lang="fr"` est déclaré.
- Un skip link existe au niveau racine.
- Les contrôles header principaux ont des `aria-label`.
- Les icônes décoratives sont généralement accompagnées d’un texte visible dans les liens.
- Les statuts sont souvent écrits, et pas seulement représentés par une couleur.
- La préférence de mouvement réduit est prise en compte globalement.

### Points à traiter

- La hiérarchie des titres doit être auditée : les pages utilisent un `h1`, puis des titres de section, mais la structure partagée et les cartes doivent être vérifiées avec un lecteur d’écran.
- L’élément `main` est dans le layout protégé mais le skip link cible un conteneur parent `div`; le point d’arrivée doit être vérifié au clavier.
- La sidebar mobile ne montre pas de gestion explicite du focus modal, de `aria-expanded`, de `aria-controls` ou de fermeture clavier.
- Le lien actif devrait exposer un état programmatique (`aria-current="page"`) et pas seulement une classe de couleur.
- Le champ de recherche désactivé est annoncé, mais sa présence visuelle peut être retirée ou remplacée par une explication non interactive pour éviter une fausse attente.
- Les contrastes doivent être mesurés sur les textes slate/indigo clairs, les textes `white/20` des heroes et les badges colorés. La conformité ne doit pas être déduite du seul nom de la couleur.
- Le code couleur des statuts doit toujours être doublé par libellé, icône ou motif ; les patterns disponibles ne sont pas effectivement employés dans les dashboards inspectés.
- Les états de chargement et d’erreur devraient annoncer leur changement aux technologies d’assistance lorsque le contenu est remplacé.

## 11. Design system

Le système déclare des tokens Château (bleu profond, or, rouge, vert), des surfaces, des focus rings et des composants UI réutilisables. Les dashboards utilisent pourtant beaucoup de classes directes `bg-indigo-*`, `text-indigo-*`, `bg-blue-*`, `bg-emerald-*`, `bg-purple-*` et des gradients de rôle. Le problème n’est pas l’absence de couleurs, mais l’absence de sémantique stable.

Recommandation de principe : réserver le rouge et le vert aux états fonctionnels, le bleu profond à la structure, l’or aux actions ou accents premium, et les neutres/slate aux surfaces et textes. Les couleurs de rôle ne devraient pas devenir cinq thèmes concurrents. Les cartes décoratives peuvent être réduites au profit de zones de travail plus plates et mieux hiérarchisées.

La typographie charge Inter et Quicksand, mais les pages de dashboard restent majoritairement en Inter et n’utilisent pas réellement une typographie display ou serif pour exprimer la marque. Une distinction mesurée des titres pourrait renforcer l’identité sans diminuer la lisibilité opérationnelle.

## 12. Cohérence Château du Mwana

L’identité est présente dans les tokens CSS, le logo, le bleu profond du sidebar et quelques gradients or/vert. Elle est moins présente dans la composition réelle des dashboards : peu ou pas de photographie réelle, forte dépendance au blanc/slate, indigo fréquent pour les CTA, et absence d’un langage commun entre les cinq heroes.

La cohérence recherchée ne doit pas consister à ajouter du rouge et du vert partout. Le rouge doit signaler un risque ou une erreur ; le vert une disponibilité ou une réussite ; l’or un accent premium ou une action principale ; le bleu profond la structure et la confiance. Les photos réelles peuvent être réservées aux zones d’accueil pertinentes, sans transformer les dashboards opérationnels en pages marketing.

## 13. Liste P0

Aucun P0 UX/UI confirmé dans le périmètre observé.

- Le point d’entrée `/dashboard` redirige vers le dashboard correspondant au rôle.
- La sidebar filtre ses entrées par rôle.
- Les pages de dashboard appliquent un contrôle de rôle local.

Cette conclusion ne remplace pas un test authentifié de chaque rôle. Elle signifie seulement qu’aucune mauvaise utilisation bloquante ou exposition d’accès n’est démontrée par l’audit visuel et la lecture des surfaces inspectées.

## 14. Liste P1

1. **Triage insuffisant dans ADMIN :** l’écran expose beaucoup de métriques mais ne met pas en évidence la décision prioritaire.
2. **Mission opérationnelle diluée dans SUPERVISOR :** équipe, analytics et configuration concurrencent incidents, missions et stock critique.
3. **Deux blocs de priorités redondants dans SECRETARY :** planning et priorités répètent les compteurs sans ordre de traitement commun.
4. **CTA de factures ambigu :** le libellé « Voir les factures » et la destination analytics ne sont pas alignés.
5. **Ordre d’exécution insuffisant dans LOGISTICIAN :** l’état des équipements précède les missions et alertes à exécuter.
6. **Prochaine étape peu saillante dans CLIENT :** réservation à venir, statut et action associée sont séparés.
7. **États de chargement et d’erreur trop génériques :** le contexte de la page et la source indisponible ne sont pas visibles.
8. **Navigation trop plate par rapport aux rôles :** les différences métier sont plus fortes dans les données que dans la structure et l’ordre des accès.

## 15. Liste P2

1. Réduire les répétitions de CA, réservations, maintenance et actions rapides.
2. Clarifier la période et la portée des KPI globaux.
3. Indiquer explicitement les listes tronquées et le nombre restant à consulter.
4. Ajouter une action directement associée aux lignes d’alertes stock, maintenance, message ou facture, sans créer de nouvelle capacité métier.
5. Améliorer la hiérarchie mobile par l’ordre DOM et l’empilement des CTA.
6. Traiter les tables mobiles avec une stratégie de lecture explicite, pas uniquement un scroll horizontal.
7. Remplacer le point de notification statique par une présentation cohérente avec l’état réellement affiché, ou le rendre neutre s’il n’y a rien à signaler.
8. Formaliser `aria-current`, `aria-expanded`, le focus modal de la sidebar et les annonces des états dynamiques.
9. Vérifier les contrastes des textes secondaires, badges et heroes avec une mesure WCAG.

## 16. Liste P3

1. Réduire les gradients par rôle et revenir à une palette sémantique Château.
2. Employer plus intentionnellement Quicksand ou une typographie de titre déjà chargée, sans sacrifier la lecture des données.
3. Harmoniser les rayons, ombres et espacements des cartes pour limiter l’effet de collection de blocs.
4. Remplacer les libellés génériques « Voir… » par des verbes plus précis lorsque cela améliore la compréhension.
5. Introduire la photographie réelle uniquement dans les points de contact où elle aide l’identité ou la confiance, pas comme décoration dans chaque dashboard.
6. Harmoniser le français des intitulés de rôle et des titres (« Dashboard Secretary », « Logistique & Inventaire », majuscules variables).

## 17. Recommandations concrètes

1. **Définir une règle de premier écran par rôle.** Au-dessus de la ligne de flottaison, afficher dans cet ordre : situation du jour, problème éventuel, action principale. Les KPI secondaires viennent ensuite.
2. **Créer une hiérarchie de priorité visuelle commune.** Une seule zone de triage par dashboard, avec trois niveaux maximum : à traiter, à surveiller, information.
3. **Réduire les duplications.** Conserver un compteur dans le hero ou dans les KPI, puis utiliser les sections inférieures pour apporter du contexte ou une action différente.
4. **Rendre les CTA contextuels.** Le bouton d’une carte doit ouvrir exactement la liste ou l’action annoncée, notamment pour les factures, notifications et alertes stock.
5. **Réordonner par mission, pas par modèle de carte.** ADMIN commence par la santé de l’activité ; SUPERVISOR par les incidents et opérations ; SECRETARY par les tâches commerciales ; LOGISTICIAN par les missions à exécuter ; CLIENT par la prochaine réservation.
6. **Employer les couleurs comme langage fonctionnel.** Bleu profond pour la structure, or pour l’action/accueil premium, rouge pour le risque, vert pour disponibilité/réussite, neutres pour la lecture. Ne pas colorer chaque rôle différemment.
7. **Intégrer les états UI au niveau de la page.** Utiliser des skeletons qui reprennent hero, KPI et listes ; afficher des erreurs locales lorsque seule une source est indisponible ; rendre les états vides propres à la décision attendue.
8. **Traiter le mobile comme une hiérarchie dédiée.** Empiler les CTA, conserver les libellés complets, mettre les alertes avant les sections secondaires et fournir une alternative lisible aux tables larges.
9. **Faire une passe clavier et lecteur d’écran.** Tester skip link, sidebar mobile, focus visible, fermeture Escape, état actif, annonces de loading/error et compréhension sans couleur.
10. **Valider par scénarios de cinq secondes.** Pour chaque rôle, montrer uniquement le dashboard puis demander : « Que devez-vous faire maintenant ? » ; la réponse attendue doit pointer vers un bloc et un CTA identifiables sans explication externe.

### Périmètre observé

Pages principales des cinq dashboards, layout protégé, sidebar, header, composants d’états UI, styles globaux, page de réservations client et rapports BRIDGE 4 existants. L’audit est statique : il ne remplace pas une session Playwright authentifiée avec captures desktop/mobile ni un test avec lecteur d’écran.