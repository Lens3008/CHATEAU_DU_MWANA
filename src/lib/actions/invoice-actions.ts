'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/user'
import { generateInvoice } from '@/lib/services/invoice'

export async function generateInvoiceAction(reservationId: string) {
  try {
    await requireRole(['ADMIN', 'SECRETARY', 'SUPERVISOR'])

    if (typeof reservationId !== 'string' || reservationId.trim().length === 0) {
      return { success: false, error: 'Réservation invalide.' }
    }

    const invoice = await generateInvoice(reservationId.trim())
    revalidatePath(`/admin/reservations/${reservationId}`)
    revalidatePath('/admin/reservations')
    revalidatePath('/dashboard/client')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('[generateInvoiceAction] Invoice generation failed', error)
    return { success: false, error: error instanceof Error ? error.message : 'Facture impossible.' }
  }
}
