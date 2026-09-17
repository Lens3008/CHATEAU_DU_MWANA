# BRIDGE 4.3.1 — BLOC 2.2
## Paiements V1 / Facturation

**Date :** 2026-09-16  
**Projet :** `C:\laragon\www\CHATEAU DU MWANA`  
**Branche :** `master`  
**Commit HEAD au début :** `8d3e1291932fcadff709509c53095516dcc04426`  
**Commit HEAD à la fin :** `8d3e1291932fcadff709509c53095516dcc04426`

## 1. État initial

Le service `src/lib/services/payment.ts` existait déjà et contenait la logique métier d'encaissement :

- transaction ;
- verrou du paiement ;
- contrôle du montant positif ;
- interdiction du dépassement ;
- création de `PaymentTransaction` ;
- recalcul de `Payment.totalPaid` et du statut global ;
- mise à jour de `Reservation.paymentStatus` ;
- création de `PaymentTransactionHistory`.

Le service `src/lib/services/invoice.ts` existait également et contenait :

- chargement de la réservation ;
- protection contre une facture active en doublon ;
- calcul serveur depuis les `ReservationItem` ;
- numérotation ;
- création de `Invoice` et `InvoiceItem`.

Le bouton `Encaisser` dans `src/app/admin/reservations/[id]/page.tsx` était décoratif : aucun formulaire, Server Action, modal ou appel à `addPayment` n'était branché.

Les modèles et enums existants ont été conservés. Aucun statut de vérification V2 n'a été ajouté. Les méthodes restent `CASH`, `CARD`, `MOBILE_MONEY`, `BANK_TRANSFER`, `CHEQUE`.

## 2. Modifications réalisées

### Server Action paiement

Fichier créé : `src/lib/actions/payment-actions.ts`

`addPaymentAction` :

- utilise `requireRole` ;
- autorise `ADMIN`, `SECRETARY`, `SUPERVISOR` ;
- refuse donc les clients et logisticiens ;
- ne reçoit ni `customerId`, ni rôle, ni `performedById` du navigateur ;
- valide `reservationId`, `amount`, `method` et la longueur de `reference` ;
- appelle uniquement `addPayment` pour la logique financière ;
- transmet `performedById: user.id` ;
- revalide le détail, la liste admin et le dashboard client ;
- retourne `{ success, data/error }` exploitable par l'UI ;
- ne renvoie pas de stack trace.

La validation serveur ne duplique pas le calcul du solde : le service reste l'autorité.

### Server Action facture

Fichier créé : `src/lib/actions/invoice-actions.ts`

`generateInvoiceAction` :

- utilise `requireRole` ;
- autorise `ADMIN`, `SECRETARY`, `SUPERVISOR` ;
- vérifie l'identifiant de réservation ;
- appelle uniquement `generateInvoice` ;
- conserve la protection anti-doublon du service ;
- revalide les pages concernées ;
- retourne la facture ou une erreur exploitable.

### Formulaire d'encaissement

Fichier créé : `src/components/admin/PaymentForm.tsx`

Le formulaire affiche :

- montant ;
- méthode ;
- opérateur visuel Airtel/Moov/Autre lorsque `MOBILE_MONEY` est choisi ;
- référence facultative ;
- état `Enregistrement...` ;
- message de succès ou d'erreur accessible via `role="status"` et `aria-live`.

L'opérateur mobile n'est pas ajouté au schéma. En l'absence de colonne dédiée, il reste une information d'interface ; la référence existante est conservée pour la transaction.

Le formulaire bloque côté UX les montants non positifs et supérieurs au solde courant, sans remplacer la validation backend.

### Génération de facture

Fichier créé : `src/components/admin/InvoiceButton.tsx`

Le bouton :

- appelle la Server Action facture ;
- affiche `Génération...` ;
- affiche le numéro généré ou l'erreur ;
- ne génère pas de PDF ;
- ne recalcule aucun montant côté client.

### Page détail réservation

Fichier modifié : `src/app/admin/reservations/[id]/page.tsx`

La page :

- affiche le formulaire d'encaissement pour les rôles non `CLIENT` ;
- affiche le bouton de génération de facture pour les rôles non `CLIENT` ;
- conserve le détail du paiement ;
- affiche l'historique des transactions ;
- utilise les champs réels `date` et `transactionReference` du modèle ;
- charge et affiche les factures existantes avec numéro, total et statut.

Les clients peuvent toujours consulter leur réservation selon le contrôle `customerId` existant, mais ne voient pas les contrôles internes d'encaissement/génération.

## 3. Chaîne finale paiement

```text
Page détail réservation
  → PaymentForm
  → addPaymentAction
  → requireRole
  → addPayment
  → db.transaction + verrou
  → PaymentTransaction
  → Payment + Reservation.paymentStatus
  → PaymentTransactionHistory
  → revalidatePath
  → message UI + historique rechargé
```

La logique métier de montant, solde, statut, transaction et historique reste exclusivement dans `addPayment`.

## 4. Chaîne finale facture

```text
Page détail réservation
  → InvoiceButton
  → generateInvoiceAction
  → requireRole
  → generateInvoice
  → db.transaction
  → Invoice + InvoiceItem
  → revalidatePath
  → numéro/total/statut affichés
```

La logique de calcul, de numérotation et d'idempotence reste exclusivement dans `generateInvoice`.

## 5. Remboursement

`addRefund` existe toujours dans `src/lib/services/payment.ts`, mais aucun pont UI ou Server Action de remboursement n'a été ajouté dans ce bloc.

Motif :

- le périmètre demandé est le branchement paiement/facture V1 ;
- le service actuel ne possède pas de statut de demande/vérification de remboursement ;
- ajouter une interface complète élargirait le contrat métier ;
- aucun schéma, migration ou nouveau statut n'était autorisé.

Le remboursement reste V1.1/V2 à traiter avec les mêmes contrôles Auth/RBAC et sans logique financière frontend.

## 6. Sécurité et RBAC

Contrôles côté serveur :

- utilisateur non authentifié : refus via `requireRole` ;
- `CLIENT` : refus ;
- `LOGISTICIAN` : refus ;
- `ADMIN`, `SECRETARY`, `SUPERVISOR` : autorisés par l'action ;
- aucun rôle fourni par le navigateur ;
- aucun `customerId` fourni par le navigateur ;
- `performedById` vient de la session ;
- montant et méthode sont contrôlés côté serveur ;
- le service conserve le contrôle transactionnel et le verrou.

Le bouton masqué côté client n'est pas la seule protection : la Server Action refuse également les rôles non autorisés.

## 7. Tests et validations

### Exécutés

```text
npx tsc --noEmit
```

Résultat : **PASS**.

```text
npm run build
```

Résultat : **PASS**.

```text
git diff --check -- <fichiers du bloc>
```

Résultat : **PASS** pour les fichiers du bloc.

### Avertissements existants

Le build continue de signaler l'option `eslint` non reconnue dans `next.config.ts`. Cet avertissement est préexistant et n'a pas été modifié dans ce bloc.

### Non exécutés

Aucune mutation de base partagée n'a été lancée. Les scénarios suivants restent à exécuter dans un environnement de test approuvé :

1. anonyme → paiement refusé ;
2. CLIENT → paiement refusé ;
3. LOGISTICIAN → paiement refusé ;
4. rôle autorisé → paiement accepté ;
5. montant zéro/négatif → refus ;
6. dépassement → refus ;
7. paiement partiel → `PARTIAL` ;
8. paiement exact → `PAID` ;
9. doublon/concurrence ;
10. facture générée ;
11. deuxième facture active refusée ;
12. historique affiché ;
13. clavier et responsive à 375/768/1440.

Le test d'intégration réel exige un compte autorisé et une réservation existante ; aucune donnée n'a été créée pour ce bloc.

## 8. Fichiers du bloc

Créés :

- `src/lib/actions/payment-actions.ts`
- `src/lib/actions/invoice-actions.ts`
- `src/components/admin/PaymentForm.tsx`
- `src/components/admin/InvoiceButton.tsx`
- `BRIDGE_4_3_1_BLOCK_2_2_PAYMENT_INVOICE_REPORT.md`

Modifié :

- `src/app/admin/reservations/[id]/page.tsx`

Non modifiés volontairement :

- `prisma/schema.prisma`
- `prisma/migrations/*`
- Auth Supabase
- RBAC global
- RLS/policies
- modèles de réservation
- logique de prix, capacité et allocation
- fixtures et données existantes

## 9. Limites connues

- La transaction existante marque immédiatement l'encaissement comme `SUCCESS`, conformément à la V1 approuvée ; aucun workflow `DECLARED/PENDING_VERIFICATION/VERIFIED` n'a été introduit.
- Airtel/Moov restent une sélection visuelle lorsque `MOBILE_MONEY` est choisi ; aucun champ Prisma n'a été ajouté.
- Le bouton de génération de facture redevient disponible après une facture existante, mais le service refuse toute nouvelle facture active et affiche l'erreur métier. Une amélioration UX pourrait masquer le bouton lorsqu'une facture active est déjà chargée, sans être nécessaire à la sécurité.
- Aucun remboursement frontend n'a été ajouté.
- Les validations réelles avec comptes de rôles n'ont pas été exécutées pour ne pas muter la base partagée.

## 10. Verdict

### PARTIAL

Le pont paiement/facturation V1 est implémenté et vérifié par TypeScript/build sans modification du schéma ni de la base. Le parcours serveur est sécurisé par Auth/RBAC et délègue la logique aux services existants.

Le verdict reste **PARTIAL** jusqu'à l'exécution approuvée de tests avec un compte autorisé et une réservation existante, notamment pour confirmer en base `Payment`, `PaymentTransaction`, `Reservation.paymentStatus`, `PaymentTransactionHistory`, `Invoice` et `InvoiceItem`.
