import { db } from '../prisma';
import { Temporal } from '@js-temporal/polyfill';

/**
 * Génère un numéro de facture unique (Ex: INV-2026-0001)
 */
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear().toString();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${year}-${randomStr}`;
}

export async function generateInvoice(reservationId: string) {
  return await db.transaction(async (tx: any) => {
    // 1. Charger la réservation
    const allReservations = await tx.orm.public.Reservation.all();
    const reservation = allReservations.find((r: any) => r.id === reservationId);

    if (!reservation) {
      throw new Error("Réservation introuvable.");
    }

    // Check if an invoice already exists
    const allInvoices = await tx.orm.public.Invoice.all();
    const existingInvoice = allInvoices.find((i: any) => i.reservationId === reservationId && i.status !== 'CANCELLED');
    if (existingInvoice) {
      throw new Error("Une facture active existe déjà pour cette réservation.");
    }

    // Charger les items de la réservation
    const allItems = await tx.orm.public.ReservationItem.all();
    const items = allItems.filter((i: any) => i.reservationId === reservationId);

    if (items.length === 0) {
      throw new Error("La réservation n'a aucun item à facturer.");
    }

    // 2. Calcul des montants
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.totalPrice);
    }
    
    // Simplification : pas de taxes gérées nativement dans les items pour le moment
    const taxAmount = 0;
    const totalAmount = subtotal + taxAmount;

    // 3. Déterminer un numéro unique
    let number = generateInvoiceNumber();
    let numExists = allInvoices.find((i: any) => i.number === number);
    while (numExists) {
      number = generateInvoiceNumber();
      numExists = allInvoices.find((i: any) => i.number === number);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 jours pour payer

    // 4. Créer la facture
    const invoice = await tx.orm.public.Invoice.create({
      reservationId: reservation.id,
      customerId: reservation.customerId,
      number,
      issueDate: new Date(),
      dueDate,
      status: 'ISSUED', // ou DRAFT
      subtotal,
      taxAmount,
      totalAmount,
      updatedAt: Temporal.Now.instant()
    });

    // 5. Créer les lignes de facture (InvoiceItem)
    const allFormulas = await tx.orm.public.Formula.all();
    for (const item of items) {
      const formula = allFormulas.find((f: any) => f.id === item.formulaId);
      const desc = formula ? formula.name : "Prestation sur mesure";
      
      await tx.orm.public.InvoiceItem.create({
        invoiceId: invoice.id,
        description: desc,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        formulaId: item.formulaId
      });
    }

    return invoice;
  });
}
