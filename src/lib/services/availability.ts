import { db } from '../prisma';

export type AvailabilityCheckResult = {
  isAvailable: boolean;
  reason?: string;
  availableCapacity: number;
  conflictingResources: string[];
};

/**
 * Vérifie la disponibilité d'une formule pour un nombre de participants et une période donnée.
 */
export async function checkFormulaAvailability(
  tx: any,
  formulaId: string,
  startDate: Date,
  endDate: Date,
  participants: number
): Promise<AvailabilityCheckResult> {
  // 1. Charger la formule et ses ressources requises
  const allFormulas = await tx.orm.public.Formula.all();
  const formula = allFormulas.find((f: any) => f.id === formulaId);
  if (formula) {
    const allResources = await tx.orm.public.ServiceResource.all();
    formula.resources = allResources.filter((r: any) => r.formulaId === formula.id);
    const allEquipments = await tx.orm.public.Equipment.all();
    for (const r of formula.resources) {
      r.equipment = allEquipments.find((e: any) => e.id === r.equipmentId);
    }
  }

  if (!formula) {
    throw new Error("Formule introuvable.");
  }
  if (!formula.availability) {
    return { isAvailable: false, reason: "La formule n'est pas disponible.", availableCapacity: 0, conflictingResources: [] };
  }

  // 2. Vérifier la capacité de la formule (base)
  if (formula.capacity !== null && participants > formula.capacity) {
    return { 
      isAvailable: false, 
      reason: `Capacité maximale dépassée (max: ${formula.capacity}, demandée: ${participants}).`,
      availableCapacity: formula.capacity,
      conflictingResources: []
    };
  }

  // 3. Calculer la capacité restante en fonction des réservations concurrentes
  if (formula.capacity !== null) {
    const allReservations = await tx.orm.public.Reservation.all();
    const overlappingReservations = allReservations.filter((res: any) => {
      const isConfirmed = ['CONFIRMED', 'COMPLETED'].includes(res.status);
      const startTemp = typeof res.startDate.epochMilliseconds === 'number' ? new Date(res.startDate.epochMilliseconds) : new Date(res.startDate);
      const endTemp = typeof res.endDate.epochMilliseconds === 'number' ? new Date(res.endDate.epochMilliseconds) : new Date(res.endDate);
      const s = startDate instanceof Date ? startDate : new Date((startDate as any).epochMilliseconds);
      const e = endDate instanceof Date ? endDate : new Date((endDate as any).epochMilliseconds);
      
      const isOverlap = startTemp < e && endTemp > s;
      return isConfirmed && isOverlap;
    });

    const allItems = await tx.orm.public.ReservationItem.all();
    for (const res of overlappingReservations) {
      res.items = allItems.filter((i: any) => i.reservationId === res.id);
    }

    let usedCapacity = 0;
    for (const res of overlappingReservations) {
      if (res.items.some((item: any) => item.formulaId === formula.id)) {
        usedCapacity += res.participants || 0;
      }
    }

    const remainingCapacity = formula.capacity - usedCapacity;
    if (participants > remainingCapacity) {
      return {
        isAvailable: false,
        reason: `La capacité restante pour ce créneau est insuffisante (restant: ${remainingCapacity}, demandée: ${participants}).`,
        availableCapacity: remainingCapacity,
        conflictingResources: []
      };
    }
  }

  // 4. Vérifier les ressources (ServiceResource)
  const conflictingResources: string[] = [];
  
  if (formula.resources && formula.resources.length > 0) {
    for (const resource of formula.resources) {
      const equipmentId = resource.equipmentId;
      const requiredQty = resource.requiredQuantity;
      
      const allInventories = await tx.orm.public.Inventory.all();
      const inventories = allInventories.filter((i: any) => i.equipmentId === equipmentId && i.status === 'AVAILABLE');
      let totalStock = 0;
      const inventoryIds: string[] = [];
      for (const inv of inventories) {
        totalStock += inv.quantity;
        inventoryIds.push(inv.id);
      }

      if (totalStock < requiredQty) {
        conflictingResources.push(resource.equipment.name);
        continue;
      }

      if (inventoryIds.length > 0) {
        const allAllocations = await tx.orm.public.InventoryAllocation.all();
        const allocations = allAllocations.filter((alloc: any) => {
          const isInv = inventoryIds.includes(alloc.inventoryId);
          const isSt = ['RESERVED', 'DEPLOYED'].includes(alloc.status);
          const startTemp = typeof alloc.startDate.epochMilliseconds === 'number' ? new Date(alloc.startDate.epochMilliseconds) : new Date(alloc.startDate);
          const endTemp = typeof alloc.endDate.epochMilliseconds === 'number' ? new Date(alloc.endDate.epochMilliseconds) : new Date(alloc.endDate);
          const s = startDate instanceof Date ? startDate : new Date((startDate as any).epochMilliseconds);
          const e = endDate instanceof Date ? endDate : new Date((endDate as any).epochMilliseconds);
          const isOverlap = startTemp < e && endTemp > s;
          return isInv && isSt && isOverlap;
        });

        let usedStock = 0;
        for (const alloc of allocations) {
          usedStock += alloc.quantityAllocated;
        }

        const remainingStock = totalStock - usedStock;
        if (remainingStock < requiredQty) {
          conflictingResources.push(resource.equipment.name);
        }
      }
    }
  }

  if (conflictingResources.length > 0) {
    return {
      isAvailable: false,
      reason: `Ressources insuffisantes pour ce créneau : ${conflictingResources.join(', ')}.`,
      availableCapacity: formula.capacity || 9999,
      conflictingResources
    };
  }

  return {
    isAvailable: true,
    availableCapacity: formula.capacity || 9999,
    conflictingResources: []
  };
}
