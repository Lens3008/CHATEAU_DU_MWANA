// @ts-nocheck
import { db } from '../prisma';

import { Temporal } from '@js-temporal/polyfill';

export type PaymentData = {
  reservationId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  performedById?: string;
};

export async function addPayment(data: PaymentData) {
  return await db.transaction(async (tx: any) => {
    // 1. Lock the Payment row
    const lockPlan = db.raw.sql`SELECT 1 FROM Payment WHERE "reservationId" = ${data.reservationId} FOR UPDATE`.affectedCount().build();
    await tx.execute(lockPlan);

    const allPayments = await tx.orm.public.Payment.all();
    const payment = allPayments.find((p: any) => p.reservationId === data.reservationId);

    if (!payment) {
      throw new Error("Paiement introuvable pour cette réservation.");
    }

    // 2. Validate amount
    const amount = Number(data.amount);
    if (amount <= 0) throw new Error("Le montant doit être supérieur à 0.");
    
    // We allow overpaying? Usually no, unless specified. "Ne jamais dépasser le montant attendu sans règle métier explicite."
    const remaining = Number(payment.totalExpected) - Number(payment.totalPaid);
    if (amount > remaining) {
      throw new Error(`Le montant (${amount}) dépasse le reste à payer (${remaining}).`);
    }

    // 3. Create Transaction (SUCCESS by default for manual entry)
    const transaction = await tx.orm.public.PaymentTransaction.create({
      paymentId: payment.id,
      amount: amount,
      method: data.method,
      status: 'SUCCESS',
      transactionReference: data.reference || null
    });

    // 4. Update Payment totals
    const newTotalPaid = Number(payment.totalPaid) + amount;
    let newStatus = payment.status;

    if (newTotalPaid >= Number(payment.totalExpected)) {
      newStatus = 'PAID';
    } else if (newTotalPaid > 0) {
      newStatus = 'PARTIAL';
    }

    await tx.orm.public.Payment.where({ id: payment.id }).update({
      totalPaid: newTotalPaid,
      status: newStatus,
      updatedAt: Temporal.Now.instant()
    });

    // 5. Update Reservation Payment Status
    await tx.orm.public.Reservation.where({ id: data.reservationId }).update({
      paymentStatus: newStatus,
      updatedAt: Temporal.Now.instant()
    });

    // 6. History
    await tx.orm.public.PaymentTransactionHistory.create({
      transactionId: transaction.id,
      newStatus: 'SUCCESS'
    });

    return { transaction, newStatus, newTotalPaid };
  });
}

export async function addRefund(transactionId: string, amount: number, reason?: string) {
  return await db.transaction(async (tx: any) => {
    const lockPlan = db.raw.sql`SELECT 1 FROM PaymentTransaction WHERE id = ${transactionId} FOR UPDATE`.affectedCount().build();
    await tx.execute(lockPlan);

    const allTransactions = await tx.orm.public.PaymentTransaction.all();
    const transaction = allTransactions.find((t: any) => t.id === transactionId);
    if (transaction) {
      const allPayments = await tx.orm.public.Payment.all();
      transaction.payment = allPayments.find((p: any) => p.id === transaction.paymentId);
    }

    if (!transaction || transaction.status !== 'SUCCESS') {
      throw new Error("Transaction invalide ou non réussie.");
    }

    // Calculate already refunded
    const allRefunds = await tx.orm.public.Refund.all();
    const existingRefunds = allRefunds.filter((r: any) => r.paymentTransactionId === transactionId);
    let refundedSoFar = 0;
    for (const r of existingRefunds) refundedSoFar += Number(r.amount);

    const maxRefundable = Number(transaction.amount) - refundedSoFar;
    if (amount > maxRefundable) {
      throw new Error(`Montant de remboursement supérieur au maximum autorisé (${maxRefundable}).`);
    }

    // Create Refund
    const refund = await tx.orm.public.Refund.create({
      paymentTransactionId: transactionId,
      amount: amount,
      reason: reason || null
    });

    // Update Payment
    const payment = transaction.payment;
    const newTotalPaid = Number(payment.totalPaid) - amount;
    
    // Determine new status
    let newStatus = payment.status;
    if (newTotalPaid <= 0) {
      newStatus = 'FULLY_REFUNDED';
    } else if (newTotalPaid < Number(payment.totalExpected)) {
      newStatus = 'PARTIAL_REFUNDED'; // or PARTIAL depending on business rules, but PARTIAL_REFUNDED shows a refund occurred.
    }

    await tx.orm.public.Payment.where({ id: payment.id }).update({
      totalPaid: newTotalPaid,
      status: newStatus,
      updatedAt: Temporal.Now.instant()
    });

    await tx.orm.public.Reservation.where({ id: payment.reservationId }).update({
      paymentStatus: newStatus,
      updatedAt: Temporal.Now.instant()
    });

    return refund;
  });
}
