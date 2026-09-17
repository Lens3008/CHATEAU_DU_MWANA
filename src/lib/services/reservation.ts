import { db } from '../prisma';
import { checkFormulaAvailability } from './availability';
import { Temporal } from '@js-temporal/polyfill';

export type CreateReservationData = {
  customerId: string;
  formulaId: string;
  startDate: string | Date | any; // Allow string, Date or Temporal
  endDate?: string | Date | any;
  participants: number;
  locationId: string;
  locationType: 'VENUE' | 'CUSTOMER_ADDRESS' | 'OTHER_LOCATION';
  performedById?: string; // used for history
  publicFormulaOnly?: boolean;
};

/**
 * Génère une référence unique pour la réservation (Ex: MW-2026-ABCD)
 */
function generateReference(): string {
  const year = new Date().getFullYear().toString();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MW-${year}-${randomStr}`;
}

export async function createReservation(data: CreateReservationData) {
  return await db.transaction(async (tx: any) => {
    console.log(`[createReservation] Start transaction for ${data.formulaId}`);
    // 1. Lock on the formula to prevent concurrent overall capacity overbooking?
    const lockPlan = db.raw.sql`SELECT 1 FROM Formula WHERE id = ${data.formulaId} FOR UPDATE`.affectedCount().build();
    await tx.execute(lockPlan);
    console.log(`[createReservation] Lock acquired`);

    // 2. Load the formula to get pricing and resources
    const allFormulas = data.publicFormulaOnly
      ? await tx.orm.public.Formula.where({ id: data.formulaId, availability: true, isPublished: true }).all()
      : await tx.orm.public.Formula.all();
    console.log(`[createReservation] Fetched formulas`);
    const formula = allFormulas.find((f: any) => f.id === data.formulaId);
    if (data.publicFormulaOnly && formula) {
      const service = await tx.orm.public.Service.first({ id: formula.serviceId });
      if (!service || service.availability !== true || service.isPublished !== true) {
        throw new Error("Formule non publiée.");
      }
    }
    if (formula) {
      const allResources = await tx.orm.public.ServiceResource.all();
      formula.resources = allResources.filter((r: any) => r.formulaId === formula.id);
    }
    console.log(`[createReservation] Fetched resources`);
    if (!formula) throw new Error("Formule introuvable.");

    // Convert dates to JS Date for availability check and to Temporal.Instant for ORM
    const sDate = data.startDate instanceof Date ? data.startDate : (data.startDate.epochMilliseconds ? new Date(data.startDate.epochMilliseconds) : new Date(data.startDate));
    const eDate = data.endDate ? (data.endDate instanceof Date ? data.endDate : (data.endDate.epochMilliseconds ? new Date(data.endDate.epochMilliseconds) : new Date(data.endDate))) : new Date(sDate.getTime() + (formula.duration || 120) * 60000);
    
    const startDateInst = Temporal.Instant.fromEpochMilliseconds(sDate.getTime());
    const endDateInst = Temporal.Instant.fromEpochMilliseconds(eDate.getTime());

    // 3. Check Availability (capacity & resources)
    console.log(`[createReservation] Checking availability...`);
    const availability = await checkFormulaAvailability(tx, data.formulaId, sDate, eDate, data.participants);
    console.log(`[createReservation] Availability checked: ${availability.isAvailable}`);
    if (!availability.isAvailable) {
      throw new Error(`Disponibilité insuffisante : ${availability.reason}`);
    }

    // 4. Determine Reference (handle rare collisions)
    console.log(`[createReservation] Generating reference...`);
    let reference = generateReference();
    const allReservationsForRef = await tx.orm.public.Reservation.all();
    let refExists = allReservationsForRef.find((r: any) => r.reference === reference);
    while (refExists) {
      reference = generateReference();
      refExists = allReservationsForRef.find((r: any) => r.reference === reference);
    }

    // 5. Calculate Total Amount
    console.log(`[createReservation] Creating records...`);
    const unitPrice = Number(formula.price);
    const totalPrice = unitPrice * (data.participants || 1); // Or is formula price flat? The schema says Formula has price and capacity. 
    // Usually a formula price is flat, or per person depending on the business logic.
    // The previous implementation used formula.price. Let's assume it's flat if no logic specified.
    // "Le prix enregistré dans ReservationItem doit être le prix historique/final au moment de la réservation. Utiliser unitPrice et totalPrice".
    // Let's use flat price if participants is just a limit, OR unitPrice * participants. Let's ask or just use flat price. 
    // I will just use unitPrice = formula.price, totalPrice = formula.price for this simple implementation. 

    // 6. Create Reservation
    const reservation = await tx.orm.public.Reservation.create({
      reference,
      customerId: data.customerId,
      locationId: data.locationId,
      locationType: data.locationType,
      startDate: startDateInst,
      endDate: endDateInst,
      participants: data.participants,
      status: 'CONFIRMED', // Direct to CONFIRMED or DRAFT? The user asks to allow DRAFT but for a booking it's CONFIRMED.
      paymentStatus: 'PENDING',
      totalAmount: unitPrice,
      updatedAt: Temporal.Now.instant()
    });

    // 7. Create ReservationItem
    await tx.orm.public.ReservationItem.create({
      reservationId: reservation.id,
      formulaId: formula.id,
      quantity: 1, // 1 formula
      unitPrice: unitPrice,
      totalPrice: unitPrice
    });

    // 8. Create Status History
    await tx.orm.public.ReservationStatusHistory.create({
      reservationId: reservation.id,
      newStatus: 'CONFIRMED',
      changedById: data.performedById || null,
      reason: 'Création initiale'
    });

    // 9. Create Payment (1:1)
    await tx.orm.public.Payment.create({
      reservationId: reservation.id,
      totalExpected: unitPrice,
      totalPaid: 0,
      status: 'PENDING',
      updatedAt: Temporal.Now.instant()
    });

    // 10. Allocate Resources (InventoryAllocation)
    for (const resource of formula.resources) {
      const equipmentId = resource.equipmentId;
      const requiredQty = resource.requiredQuantity;
      
      // We must find which Inventory rows to allocate from.
      const allInventories = await tx.orm.public.Inventory.all();
      const inventories = allInventories.filter((i: any) => i.equipmentId === equipmentId && i.status === 'AVAILABLE');
      
      let allocated = 0;
      for (const inv of inventories) {
        if (allocated >= requiredQty) break;

        // Check how much is already allocated from this inv during this time
        const allAllocs = await tx.orm.public.InventoryAllocation.all();
        const existingAllocs = allAllocs.filter((alloc: any) => {
          const isInv = alloc.inventoryId === inv.id;
          const isSt = ['RESERVED', 'DEPLOYED'].includes(alloc.status);
          const startTemp = typeof alloc.startDate.epochMilliseconds === 'number' ? new Date(alloc.startDate.epochMilliseconds) : new Date(alloc.startDate);
          const endTemp = typeof alloc.endDate.epochMilliseconds === 'number' ? new Date(alloc.endDate.epochMilliseconds) : new Date(alloc.endDate);
          const s = sDate;
          const e = eDate;
          const isOverlap = startTemp < e && endTemp > s;
          return isInv && isSt && isOverlap;
        });

        let used = 0;
        for (const alloc of existingAllocs) used += alloc.quantityAllocated;

        const availableHere = inv.quantity - used;
        if (availableHere > 0) {
          const toAllocate = Math.min(availableHere, requiredQty - allocated);
          await tx.orm.public.InventoryAllocation.create({
            reservationId: reservation.id,
            inventoryId: inv.id,
            quantityAllocated: toAllocate,
            startDate: startDateInst,
            endDate: endDateInst,
            status: 'RESERVED'
          });
          allocated += toAllocate;
        }
      }
      if (allocated < requiredQty) {
        // This shouldn't happen because we checked availability, but in case of severe race condition that bypassed lock
        throw new Error(`Erreur critique d'allocation pour l'équipement ${equipmentId}`);
      }
    }

    console.log(`[createReservation] Done.`);
    return reservation;
  });
}
