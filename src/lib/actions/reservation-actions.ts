'use server'

import { requireAuth } from '@/lib/auth/user';
import { createReservation } from '@/lib/services/reservation';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const reservationInputSchema = z.object({
  formulaId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  participants: z.coerce.number().int().positive(),
  locationId: z.string().uuid(),
  locationType: z.enum(['VENUE', 'CUSTOMER_ADDRESS', 'OTHER_LOCATION']),
});

export async function createReservationAction(data: any) {
  try {
    const user = await requireAuth();
    
    const input = reservationInputSchema.parse(data);

    if (!['ADMIN', 'SECRETARY', 'CLIENT'].includes(user.role)) {
      throw new Error("Action non autorisée");
    }

    // For clients, customerId MUST come from session. For admins/secretaries, they can specify it.
    let customerId = user.role === 'CLIENT' ? user.customerId : (data.customerId || user.customerId);
    
    if (!customerId && user.role === 'CLIENT') {
      let existingCustomer = await db.orm.public.Customer.first({ email: user.email });
      if (!existingCustomer) {
        const nameParts = (user.name || 'Client').split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        // Use Temporal for dates if Prisma custom ORM expects it, or Date.
        const now = new Date();
        
        existingCustomer = await db.orm.public.Customer.create({
          firstName,
          lastName,
          email: user.email,
          updatedAt: now,
          createdAt: now,
        });
      }
      
      await db.transaction(async (tx: any) => {
        const res = db.raw.sql`UPDATE "User" SET "customerId" = ${existingCustomer.id} WHERE id = ${user.id}`.affectedCount().build();
        await tx.execute(res);
      });
      customerId = existingCustomer.id;
    }

    if (!customerId) {
      throw new Error("Client introuvable pour cette rÃ©servation.");
    }

    const location = await db.orm.public.Location.first({ id: input.locationId });
    if (!location) {
      throw new Error("Lieu introuvable.");
    }

    if (user.role === 'CLIENT' && !location.isChateau && location.customerId !== customerId) {
      throw new Error("Action non autorisÃ©e");
    }

    const secureData = {
      ...input,
      publicFormulaOnly: user.role === 'CLIENT',
      startDate: input.startDate,
      endDate: input.endDate,
      customerId, // Forced from session if client
      performedById: user.id
    };
    
    const result = await createReservation(secureData);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Une erreur est survenue' };
  }
}
