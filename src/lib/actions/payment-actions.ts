'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/user'
import { addPayment } from '@/lib/services/payment'

const PAYMENT_METHODS = ['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE'] as const
type PaymentMethod = (typeof PAYMENT_METHODS)[number]

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && PAYMENT_METHODS.includes(value as PaymentMethod)
}

export async function addPaymentAction(data: {
  reservationId: string
  amount: number | string
  method: string
  reference?: string
}) {
  try {
    const user = await requireRole(['ADMIN', 'SECRETARY', 'SUPERVISOR'])

    if (typeof data.reservationId !== 'string' || data.reservationId.trim().length === 0) {
      return { success: false, error: 'Réservation invalide.' }
    }

    const amount = typeof data.amount === 'number' ? data.amount : Number(data.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: 'Le montant doit être supérieur à 0.' }
    }

    if (!isPaymentMethod(data.method)) {
      return { success: false, error: 'Méthode de paiement invalide.' }
    }

    const reference = typeof data.reference === 'string' ? data.reference.trim() : undefined
    if (reference && reference.length > 120) {
      return { success: false, error: 'La référence est trop longue.' }
    }

    const result = await addPayment({
      reservationId: data.reservationId.trim(),
      amount,
      method: data.method,
      reference: reference || undefined,
      performedById: user.id,
    })

    revalidatePath(`/admin/reservations/${data.reservationId}`)
    revalidatePath('/admin/reservations')
    revalidatePath('/dashboard/client')
    return { success: true, data: result }
  } catch (error) {
    console.error('[addPaymentAction] Payment registration failed', error)
    return { success: false, error: error instanceof Error ? error.message : 'Paiement impossible.' }
  }
}
