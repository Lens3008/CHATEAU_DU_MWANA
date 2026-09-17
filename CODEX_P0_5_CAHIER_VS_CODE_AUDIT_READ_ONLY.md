# CODEX — P0.5 AUDIT EXHAUSTIF CAHIER DES CHARGES → CODE
## LE CHÂTEAU DU MWANA
## READ-ONLY — AUCUNE MODIFICATION

OBJECTIF
Réaliser le croisement définitif entre le CAHIER DES CHARGES V3.0 fourni en ANNEXE CI-DESSOUS et le projet réel situé dans :

C:\laragon\www\CHATEAU DU MWANA

Référence historique :
647ef32181c75cb9d4a3e9e98fe3de2d80ef0978

IMPORTANT
- Le cahier ci-dessous est LA SOURCE FONCTIONNELLE DE RÉFÉRENCE.
- Ne remplace pas ses exigences par des suppositions.
- Ne corrige pas silencieusement ses exigences.
- Distingue les exigences V1 opérationnelles des intégrations explicitement désactivées en V1.
- Compare le cahier au CODE RÉEL ACTUEL, pas uniquement au checkpoint historique.
- Utilise P0.4 comme contexte complémentaire, mais refais les vérifications nécessaires lorsque la preuve manque.

RÈGLES ABSOLUES
- READ-ONLY.
- Aucun changement de fichier.
- Aucun git add/commit/reset/clean/restore/checkout/merge/rebase/pull/push.
- Aucune migration.
- Aucun changement DB/Prisma/Supabase/RLS/Auth/RBAC.
- Aucun seed/update/delete.
- Aucun test écrivant dans la base.
- Aucun paiement, réservation, facture ou mutation métier réelle.
- Ne lis ni n'affiche les secrets .env.
- Ne considère jamais l'existence d'un fichier/fonction comme une validation.
- Ne considère jamais un build réussi comme une validation fonctionnelle.

MÉTHODE DE MESURE DU CAHIER
Le cahier impose :
ABSENT
EN COURS
IMPLÉMENTÉ
TESTÉ
VALIDÉ

Ajoute NON VÉRIFIABLE uniquement lorsque la preuve est réellement inaccessible.

Règle essentielle du cahier :
Une fonctionnalité n'est VALIDÉE que lorsqu'elle fonctionne réellement de bout en bout.

AUDIT

1. VISION / PÉRIMÈTRE
Vérifier la couverture de la plateforme complète :
site public, réservation, ventes, paiements, factures, CRM, fidélité, stocks, équipements, maintenance, logistique, livraisons, rapports, contenus, utilisateurs, permissions, statistiques, audit.

2. IDENTITÉ / DESIGN SYSTEM
Comparer au cahier :
- identité Château du Mwana ;
- direction Féerique + Premium + Élégant + Familial + Événementiel + Moderne ;
- interdiction d'apparence enfantine/amateur/générique/template gratuit ;
- typographie ;
- couleurs ;
- composants ;
- états ;
- cohérence visuelle.

3. NAVIGATION / TEMPLATES
Vérifier :
- navbar classique premium ;
- transparente ;
- flottante ;
- immersive ;
- croissant de lune ;
- choix du style depuis le backend ;
- templates des pages ;
- séparation contenu/design/logique.

4. SITE PUBLIC
Vérifier précisément :
- Accueil ;
- Présentation ;
- Services/Prestations ;
- Galerie ;
- Contact ;
- réservation ;
- CTA ;
- informations commerciales ;
- responsive ;
- animations ;
- SEO ;
- accessibilité.

5. RÉSERVATION
Tracer le workflow complet du cahier :
prestation → date → heure → participants → disponibilité → client → résumé → confirmation → référence.

Vérifier :
- double réservation ;
- double allocation ;
- capacité ;
- conflits ressources ;
- transactions ;
- concurrence ;
- historique ;
- statut réservation séparé du paiement ;
- location ;
- persistance.

6. PAIEMENTS
Le cahier demande :
- espèces ;
- virement ;
- Moov Money ;
- Airtel Money ;
- paiement manuel ;
- partiels ;
- plusieurs paiements ;
- remboursement.

Mais Payment Bridge Android est explicitement DÉSACTIVÉ V1.
Le bot WhatsApp est également DÉSACTIVÉ V1.

Ne classe donc pas l'absence d'activation de ces intégrations comme un défaut V1.
En revanche, vérifie si l'architecture préparatoire exigée existe.

7. FACTURATION
Vérifier :
- facture ;
- calcul total ;
- paiements ;
- solde ;
- historique ;
- téléchargement/impression PDF ;
- préparation future WhatsApp.

8. LOGISTIQUE
Vérifier chaque chaîne :
réservation → ressources → disponibilité → allocation → stock → mission.

Puis :
- équipements ;
- états ;
- disponibilité ;
- allocations ;
- stocks ;
- mouvements ;
- missions ;
- livraisons ;
- incidents ;
- emplacements ;
- historique.

9. MAINTENANCE
Vérifier :
défaut → indisponibilité → alerte → intervention → historique → remise en service.

10. CRM
Vérifier la fiche client complète :
identité, contacts, réservations, achats, paiements, factures, historique, assiduité, annulations, fidélité, récompenses, notes.

11. FIDÉLITÉ
Vérifier :
- score ;
- dépenses ;
- fréquence ;
- assiduité ;
- paiements ;
- ancienneté ;
- annulations ;
- niveaux ;
- récompenses ;
- transactions ;
- workflow complet.

12. IMPORTS / EXPORTS
Vérifier :
- Excel ;
- CSV ;
- anciennes données ;
- normalisation ;
- doublons ;
- prévisualisation ;
- validation humaine ;
- import définitif ;
- exports clients/réservations/ventes/paiements/stocks/logistique/maintenance/fidélité/statistiques.

13. WHATSAPP
V1 : bot désactivé.
Vérifier uniquement l'architecture préparée et ne pas exiger son activation.

14. AUTOMATISATIONS
Vérifier les chaînes du cahier :
- réservation validée ;
- stock faible ;
- équipement défectueux ;
- client fidèle.

15. RÔLES
Comparer précisément les rôles et leurs permissions :
- CLIENT ;
- SECRÉTAIRE ;
- SUPERVISEUR ;
- ADMINISTRATEUR.

Si le code actuel possède aussi LOGISTICIAN, documente-le comme évolution actuelle, sans modifier le cahier silencieusement.

16. BACKEND
Le cahier exige une application métier/SaaS, pas une succession de CRUD.
Vérifier :
Ventes / Clients / Prestations / Logistique / Communication / Contenu / Rapports / Administration.

17. DASHBOARD
Comparer les KPI demandés :
CA, réservations, paiements, clients, prestations, occupation, stock, équipements indisponibles, maintenance, alertes.
Vérifier graphiques, tendances, comparaisons, périodes, actions rapides.

18. CALENDRIER
Vérifier :
réservations, disponibilités, ressources, missions, livraisons, maintenance, filtres.

19. PERSONNALISATION BACK-OFFICE
Vérifier :
thème clair/sombre, navigation personnalisée, dashboard configurable, widgets, raccourcis, badges, couleurs d'état, notifications, recherche globale.

20. ANIMATIONS
Vérifier les presets et surtout :
prefers-reduced-motion.
Ne pas exiger une bibliothèque particulière si une solution équivalente respecte le cahier.

21. SÉCURITÉ
Vérifier statiquement :
validation, XSS, requêtes sûres, auth, permissions, IDOR, escalade, URLs directes, uploads, fuite de données, secrets, API.
Ne pas lancer de test destructif.

22. AUDIT LOG
Vérifier la traçabilité des opérations sensibles.

23. BASE / ARCHITECTURE
Comparer l'intention fonctionnelle du cahier au stack réellement utilisé.
ATTENTION :
le cahier historique mentionne Laravel/MySQL/Filament/Blade, alors que le projet actuel est une évolution Next.js/React/TypeScript/PostgreSQL/Supabase/Prisma.
Ne classe pas automatiquement ce changement comme défaut.
Évalue plutôt si les responsabilités métier exigées sont conservées.

24. TESTS
Pour chaque exigence critique :
- code trouvé ;
- UI trouvée ;
- backend trouvé ;
- DB trouvée ;
- Auth/RBAC ;
- test présent ;
- test exécuté ;
- validation réelle.

MATRICE OBLIGATOIRE

ID | Section cahier | Exigence exacte | V1/V2 | Code/preuve | UI | Backend | DB | Auth/RBAC | Test | État | Risque | Action proposée

Ne regroupe pas excessivement les exigences.
Les exigences importantes doivent être individualisées.

5 NIVEAUX
ABSENT
EN COURS
IMPLÉMENTÉ
TESTÉ
VALIDÉ

NON VÉRIFIABLE seulement si nécessaire.

CONTRADICTIONS
Crée une section :
"Contradictions / écarts entre cahier, P0.4 et code actuel"

Inclure notamment :
- fonctionnalités annoncées comme terminées mais non validées ;
- exigences du cahier absentes ;
- fonctions backend sans UI ;
- UI sans backend ;
- tests non exécutés ;
- intégrations volontairement désactivées en V1 ;
- évolutions techniques légitimes.

FONCTIONS ORPHELINES
Lister :
fonction → fichier → appelée par → état.

BOUTONS DÉCORATIFS
Lister :
bouton/CTA → route/page → action attendue → backend trouvé ? → état.

P0/P1/P2/P3
Prioriser selon :
P0 = sécurité, intégrité financière, réservation, isolation, corruption/perte de données.
P1 = fonctionnalité métier importante inutilisable/incomplète.
P2 = fonctionnalité demandée mais non critique.
P3 = finition UX/design/documentation.

VERDICT FINAL
Donner obligatoirement l'un des quatre :
PRÊT
PARTIEL
NON PRÊT
BLOQUÉ

Justifier le verdict par les exigences du cahier, pas par une impression générale.

RAPPORT À PRODUIRE
Créer uniquement :
BRIDGE_P0_5_CAHIER_VS_CODE_AUDIT.md

Aucun autre fichier.

ANNEXE — CAHIER DES CHARGES V3.0 COMPLET
============================================================

# 📋 CAHIER DES CHARGES COMPLET

# LE CHÂTEAU DU MWANA

**Version : 3.0 — Cahier des charges fonctionnel, technique, UX/UI et métier**

**Projet : plateforme web professionnelle du Château du Mwana**

**Technologies principales : Laravel + MySQL + Filament + JavaScript**

**Paiement Android et bot WhatsApp : architecture préparée, mais non activés dans la V1**

---

# 1. 🎯 VISION DU PROJET

Le Château du Mwana doit être plus qu'un simple site vitrine.

Il doit devenir une **plateforme numérique complète de présentation, réservation, vente, gestion client, gestion logistique, gestion des stocks, facturation, fidélisation et administration**.

L'objectif est d'obtenir :

### Côté client

Un site :

-  professionnel ; 
-  élégant ; 
-  féerique ; 
-  moderne ; 
-  familial ; 
-  immersif ; 
-  responsive ; 
-  rapide ; 
-  rassurant ; 
-  facile à utiliser. 

### Côté entreprise

Une véritable application métier permettant de gérer :

-  clients ; 
-  prestations ; 
-  réservations ; 
-  paiements ; 
-  factures ; 
-  stocks ; 
-  équipements ; 
-  maintenance ; 
-  logistique ; 
-  livraisons ; 
-  CRM ; 
-  fidélité ; 
-  rapports ; 
-  contenus ; 
-  utilisateurs ; 
-  permissions ; 
-  statistiques ; 
-  audit. 

Le système doit être pensé pour pouvoir évoluer sans devoir reconstruire toute l'application.

---

# 2. 🏰 IDENTITÉ DU CHÂTEAU DU MWANA

L'identité visuelle doit s'appuyer sur le logo fourni du Château du Mwana :

-  château ; 
-  drapeau rouge ; 
-  château jaune ; 
-  élément vert courbé ; 
-  inscription « Le Château du Mwana ». 

La direction artistique doit évoluer vers :

> **Féerique + Premium + Élégant + Familial + Événementiel + Moderne**

Il faut absolument éviter l'apparence :

-  enfantine ; 
-  amateur ; 
-  générique ; 
-  surchargée ; 
-  « template gratuit » ; 
-  interface étudiant. 

---

# 3. 🎨 DESIGN SYSTEM

Le projet doit posséder un véritable **Design System Château du Mwana**.

## 3.1 Typographie

Définir une hiérarchie claire :

-  titres principaux ; 
-  titres secondaires ; 
-  sous-titres ; 
-  texte courant ; 
-  légendes ; 
-  boutons ; 
-  informations secondaires. 

Les textes doivent être rédigés dans un français professionnel, naturel et commercial.

---

## 3.2 Couleurs

Créer un système de couleurs cohérent autour de l'identité du Château.

Prévoir :

-  couleur principale ; 
-  couleur secondaire ; 
-  couleur accent ; 
-  couleurs neutres ; 
-  couleurs de succès ; 
-  avertissement ; 
-  erreur ; 
-  information. 

Les couleurs doivent être utilisées avec retenue.

---

## 3.3 Composants

Créer des composants réutilisables :

-  boutons ; 
-  cartes ; 
-  badges ; 
-  inputs ; 
-  selects ; 
-  formulaires ; 
-  modales ; 
-  menus ; 
-  navbar ; 
-  footer ; 
-  tableaux ; 
-  alertes ; 
-  notifications ; 
-  tabs ; 
-  accordéons ; 
-  timelines ; 
-  KPI ; 
-  graphiques. 

---

# 4. 🌙 NAVIGATION DU SITE PUBLIC

La navigation actuelle doit être entièrement repensée.

Le système doit pouvoir proposer plusieurs styles de navigation.

Exemples :

### Navbar classique premium

```
```

```
LOGO | Accueil | Présentation | Services | Galerie | Contact | Réserver
```

### Navbar transparente

Sur le Hero, elle devient transparente puis évolue au scroll.

### Navbar flottante

Navigation sous forme de bloc flottant.

### Navbar immersive

Navigation minimaliste avec menu déployable.

### Navigation « croissant de lune »

Reprendre le concept visuel du croissant/lune déjà imaginé pour Château du Mwana.

Le backend doit pouvoir choisir le style de navigation actif.

---

# 5. 🖥️ PAGES PUBLIQUES

## 5.1 Accueil

La page doit comporter :

-  Hero spectaculaire ; 
-  présentation rapide ; 
-  prestations principales ; 
-  formules ; 
-  avantages ; 
-  galerie ; 
-  témoignages éventuellement ; 
-  appels à l'action ; 
-  réservation ; 
-  contact ; 
-  réseaux sociaux ; 
-  footer. 

Le Hero doit pouvoir utiliser plusieurs templates.

---

# 6. 🏰 PRÉSENTATION

La page doit présenter :

-  histoire ; 
-  concept ; 
-  valeurs ; 
-  équipe ; 
-  environnement ; 
-  philosophie ; 
-  éléments différenciateurs. 

La présentation doit être narrative et visuelle.

---

# 7. 🎡 SERVICES / PRESTATIONS

Afficher :

-  catégories ; 
-  services ; 
-  formules ; 
-  prix ; 
-  descriptions ; 
-  images ; 
-  disponibilité ; 
-  ressources nécessaires ; 
-  conditions ; 
-  durée ; 
-  capacité. 

Les cartes doivent être professionnelles et non enfantines.

---

# 8. 🖼️ GALERIE

Fonctionnalités :

-  grille ; 
-  Masonry ; 
-  catégories ; 
-  filtres ; 
-  Lightbox ; 
-  plein écran ; 
-  navigation entre images ; 
-  optimisation des images ; 
-  responsive. 

Les images doivent conserver leurs proportions et détourages.

Éviter les recadrages destructifs.

---

# 9. 📞 CONTACT

Informations prévues :

**Libreville — Alibandeng / Taiti**

Téléphones :

-  +241 74 15 58 40 
-  +241 66 42 47 37 

Email :

`contact@chateaudumwana.com`

Fonctionnalités :

-  formulaire ; 
-  validation ; 
-  stockage en base ; 
-  notification secrétaire ; 
-  redirection/contact WhatsApp lorsque pertinent ; 
-  Google Maps. 

---

# 10. 🛒 E-COMMERCE / RÉSERVATION

Le site doit permettre :

```
```

```
Choix prestation
↓
Date
↓
Heure
↓
Participants
↓
Disponibilité
↓
Informations client
↓
Résumé
↓
Confirmation
↓
Numéro de réservation
```

Exemple :

```
```

```
CDM-2026-000154
```

---

# 11. 📅 MOTEUR DE RÉSERVATION

Une réservation doit contenir notamment :

-  client ; 
-  prestation ; 
-  date ; 
-  heure ; 
-  nombre de participants ; 
-  montant ; 
-  statut ; 
-  ressources nécessaires ; 
-  historique. 

Le système doit vérifier les disponibilités.

### Important

Il faut empêcher :

-  double réservation ; 
-  double allocation ; 
-  dépassement de capacité ; 
-  conflit de ressources. 

Les opérations critiques doivent utiliser des **transactions SQL et mécanismes de concurrence sûrs**.

---

# 12. 🔵 STATUTS DES RÉSERVATIONS ET PAIEMENTS

Le statut de réservation doit être séparé du statut de paiement.

## Paiement

### ⚪ Blanc

Réservé mais pas payé.

### 🔵 Bleu

Paiement partiel.

### 🟢 Vert

Paiement complet.

### 🔴 Rouge

Impayé / retard.

### 🟣 Violet

Remboursement en cours.

Ces couleurs doivent être utilisées dans :

-  dashboard ; 
-  calendrier ; 
-  tableaux ; 
-  fiches clients ; 
-  réservations ; 
-  factures. 

---

# 13. 💰 PAIEMENTS

Le système doit gérer :

-  espèces ; 
-  virement bancaire ; 
-  Moov Money ; 
-  Airtel Money ; 
-  paiement manuel ; 
-  paiements partiels ; 
-  plusieurs paiements pour une réservation ; 
-  remboursement. 

Exemple :

```
```

```
Total :       50 000 FCFA
Payé :        20 000 FCFA
Reste :       30 000 FCFA
Statut :      PAIEMENT PARTIEL
```

---

# 14. 📱 CDM PAYMENT BRIDGE — ANDROID

### ⚠️ NON ACTIVÉ DANS LA V1

L'architecture doit néanmoins être prévue.

Architecture :

```
```

```
Site / Dashboard
       ↓
API Château
       ↓
Payment Engine
       ↑
CDM Payment Bridge
       ↑
Téléphone Android
       ↑
SIM Moov / SIM Airtel
       ↑
Notification de paiement
```

L'application Android sera développée en **Kotlin**.

Elle servira de passerelle entre les téléphones professionnels et le système Château du Mwana.

---

# 15. 📲 FONCTIONNEMENT DU PAYMENT BRIDGE

Le téléphone :

-  reçoit une notification/SMS ; 
-  détecte le paiement ; 
-  extrait les informations ; 
-  identifie le fournisseur ; 
-  récupère le montant ; 
-  récupère l'identifiant de transaction ; 
-  transmet l'événement au serveur. 

### Le système ne doit jamais demander ni stocker :

❌ PIN Mobile Money.

---

# 16. 🛡️ SÉCURISATION DU PAYMENT BRIDGE

Prévoir :

-  identifiant unique du téléphone ; 
-  authentification du terminal ; 
-  token sécurisé ; 
-  HTTPS ; 
-  signature des requêtes ; 
-  timestamp ; 
-  nonce ; 
-  protection anti-rejeu ; 
-  hash du message ; 
-  identifiant de transaction unique ; 
-  détection de doublons ; 
-  journalisation ; 
-  révocation du terminal ; 
-  heartbeat ; 
-  synchronisation hors ligne. 

Le SMS doit être considéré comme **une source de rapprochement**, et non comme une preuve cryptographique absolue.

---

# 17. 🧠 VÉRIFICATION INTELLIGENTE DES PAIEMENTS

Le système doit pouvoir comparer :

-  référence ; 
-  montant ; 
-  téléphone ; 
-  fournisseur ; 
-  date ; 
-  heure ; 
-  transaction ; 
-  réservation. 

Prévoir un score de confiance.

Exemple de pondération :

```
```

```
Référence exacte          +40
Montant exact             +25
Transaction valide        +20
Bon fournisseur           +5
Téléphone correspondant   +5
Fenêtre temporelle        +5
                           ---
                          100
```

Statuts :

```
```

```
RECEIVED
PARSING
PARSED
MATCHED
PENDING_REVIEW
VERIFIED
DUPLICATE
SUSPICIOUS
REJECTED
```

---

# 18. 🧾 FACTURATION

Lorsqu'une réservation est validée :

-  générer la facture ; 
-  calculer le total ; 
-  enregistrer les paiements ; 
-  calculer le solde ; 
-  conserver l'historique ; 
-  permettre l'impression/téléchargement PDF. 

L'architecture doit permettre ultérieurement l'envoi de la facture via WhatsApp.

---

# 19. 📦 LOGISTIQUE

Chaque équipement doit posséder :

-  ID ; 
-  nom ; 
-  catégorie ; 
-  quantité ; 
-  état ; 
-  emplacement ; 
-  disponibilité ; 
-  historique. 

## États

🟢 Bon état

🟡 État passable

🔴 Mauvais état

⚫ Hors service

Un équipement mauvais ou hors service ne doit plus être considéré comme disponible lorsque les règles métier l'interdisent.

---

# 20. 🔄 ALLOCATION AUTOMATIQUE

Lorsqu'une réservation est validée :

```
```

```
Réservation
↓
Recherche des ressources nécessaires
↓
Vérification disponibilité
↓
Allocation
↓
Mise à jour stock
↓
Création mission logistique
```

Si le matériel est insuffisant :

```
```

```
ALERTE
Matériel requis : 20
Disponible : 14
Manquant : 6
```

La secrétaire et/ou le superviseur doivent être avertis selon les permissions.

---

# 21. 🔧 MAINTENANCE

Lorsqu'un équipement est déclaré défectueux :

```
```

```
Équipement
↓
Statut mauvais
↓
Retrait de disponibilité
↓
Alerte
↓
Intervention maintenance
↓
Historique
↓
Retour en service
```

Conserver :

-  date ; 
-  problème ; 
-  responsable ; 
-  intervention ; 
-  coût éventuel ; 
-  statut ; 
-  date de remise en service. 

---

# 22. 🚚 MISSIONS LOGISTIQUES

Créer :

-  missions ; 
-  responsables ; 
-  équipements ; 
-  réservation associée ; 
-  date ; 
-  heure ; 
-  statut ; 
-  notes ; 
-  incidents. 

Statuts possibles :

```
```

```
À PLANIFIER
PLANIFIÉE
EN PRÉPARATION
EN COURS
TERMINÉE
ANNULÉE
INCIDENT
```

---

# 23. 📦 LIVRAISONS

Gestion :

-  livraison ; 
-  destination ; 
-  matériel ; 
-  responsable ; 
-  statut ; 
-  heure ; 
-  retour ; 
-  incident. 

---

# 24. 👥 CRM / CLIENTS

Créer une fiche client complète :

```
```

```
Identité
Contacts
Réservations
Achats
Paiements
Factures
Historique
Assiduité
Annulations
Fidélité
Récompenses
Notes
```

---

# 25. ⭐ PROGRAMME DE FIDÉLITÉ

Le système calcule un score selon :

-  dépenses ; 
-  fréquence ; 
-  assiduité ; 
-  ponctualité des paiements ; 
-  ancienneté ; 
-  taux d'annulation. 

Pondération indicative :

```
```

```
Dépenses       35 %
Fréquence      25 %
Assiduité      20 %
Paiements      10 %
Ancienneté     10 %
```

---

# 26. 🏆 NIVEAUX CLIENT

Prévoir notamment :

### Client Découverte

### Client Fidèle

### Client Privilège

### Client Royal

Récompenses possibles :

-  réduction ; 
-  service offert ; 
-  bonus ; 
-  avantages ; 
-  offres spéciales. 

---

# 27. 📥 IMPORT DES ANCIENNES DONNÉES

Les anciennes données peuvent provenir :

-  Excel ; 
-  CSV ; 
-  anciennes bases ; 
-  documents ; 
-  fichiers historiques. 

Processus :

```
```

```
Import
↓
Normalisation
↓
Détection doublons
↓
Prévisualisation
↓
Validation
↓
Import définitif
↓
CRM
```

Les doublons ambigus doivent être soumis à une **validation humaine**.

---

# 28. 📊 RAPPORTS / EXCEL

Utiliser **PhpSpreadsheet**.

Permettre :

-  export clients ; 
-  réservations ; 
-  ventes ; 
-  paiements ; 
-  stocks ; 
-  logistique ; 
-  maintenance ; 
-  fidélité ; 
-  statistiques. 

Prévoir également l'import Excel.

---

# 29. 💬 WHATSAPP

### ⚠️ BOT NON ACTIVÉ DANS LA V1

L'architecture doit être préparée.

Le futur système sera bidirectionnel.

```
```

```
WhatsApp
↕
Webhook
↕
API Château
↕
Business Engine
↕
MySQL
```

Le bot pourra ultérieurement gérer :

```
```

```
/rapport
/stock
/reservation
/livraison
/materiel
/client
```

Et permettre notamment :

-  réception de rapports ; 
-  consultation ; 
-  notifications ; 
-  factures ; 
-  échanges avec les responsables. 

---

# 30. 🧠 AUTOMATISATIONS MÉTIER

## Réservation validée

```
```

```
Réservation
↓
Disponibilité
↓
Paiement
↓
Facture
↓
Allocation
↓
Mission logistique
↓
Notifications
↓
Dashboard
```

## Stock faible

```
```

```
Stock
↓
Seuil atteint
↓
Alerte
↓
Dashboard
↓
Responsable
```

## Équipement défectueux

```
```

```
Défaut
↓
Indisponibilité
↓
Alerte
↓
Maintenance
↓
Recalcul disponibilité
```

## Client fidèle

```
```

```
Activité client
↓
Calcul score
↓
Nouveau niveau
↓
Récompense
↓
Notification
```

---

# 31. 👨‍💼 LES RÔLES

Le système doit avoir au minimum :

## CLIENT

Accès :

-  site public ; 
-  catalogue ; 
-  réservation ; 
-  profil ; 
-  historique ; 
-  factures ; 
-  paiements ; 
-  fidélité. 

---

# 32. 🧑‍💼 SECRÉTAIRE

Interface orientée travail quotidien.

### Dashboard

-  réservations du jour ; 
-  réservations à confirmer ; 
-  paiements ; 
-  impayés ; 
-  messages ; 
-  factures ; 
-  alertes. 

### Gestion

-  clients ; 
-  réservations ;

============================================================
FIN DU CAHIER DES CHARGES
============================================================
