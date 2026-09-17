import { db } from '@/prisma/db';
import { DateRange } from './date-utils';

export type RevenueStats = {
  totalRevenue: number;
  totalCollected: number;
  totalPending: number;
  totalRefunded: number;
  refundsCount: number;
  partialRefundsCount: number;
  fullRefundsCount: number;
};

export async function getFinanceStats(range: DateRange): Promise<RevenueStats> {
  const { startDate, endDate } = range;

  const allReservations = await db.orm.public.Reservation.all();
  const allPayments = await db.orm.public.Payment.all();
  const allTransactions = await db.orm.public.PaymentTransaction.all();
  const allRefunds = await db.orm.public.Refund.all();

  const reservations = allReservations.filter((r: any) => {
    const d = new Date(r.createdAt.toString());
    return d >= startDate && d <= endDate && r.status !== 'CANCELLED';
  });

  // Calculate CA
  const totalRevenue = reservations.reduce((sum: number, res: any) => sum + Number(res.totalAmount), 0);

  // Encaissements (Transactions SUCCESS sur la période)
  const transactions = allTransactions.filter((t: any) => {
    const d = new Date(t.date.toString());
    return d >= startDate && d <= endDate && t.status === 'SUCCESS';
  });
  const totalCollected = transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  // Reste à payer (sur les réservations de la période, non annulées)
  let totalPending = 0;
  for (const res of reservations) {
    const payment = allPayments.find((p: any) => p.reservationId === res.id);
    if (payment && res.paymentStatus !== 'PAID' && res.paymentStatus !== 'FULLY_REFUNDED') {
      const pending = Number(payment.totalExpected) - Number(payment.totalPaid);
      if (pending > 0) {
        totalPending += pending;
      }
    }
  }

  // Remboursements réels sur la période
  const refunds = allRefunds.filter((r: any) => {
    const d = new Date(r.date.toString());
    return d >= startDate && d <= endDate;
  });

  const totalRefunded = refunds.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
  const refundsCount = refunds.length;
  
  let partialRefundsCount = 0;
  let fullRefundsCount = 0;

  for (const r of refunds) {
    const transaction = allTransactions.find((t: any) => t.id === (r as any).transactionId);
    if (transaction) {
      const payment = allPayments.find((p: any) => p.id === transaction.paymentId);
      if (payment) {
        if (payment.status === 'PARTIAL_REFUNDED') partialRefundsCount++;
        if (payment.status === 'FULLY_REFUNDED') fullRefundsCount++;
      }
    }
  }

  return {
    totalRevenue,
    totalCollected,
    totalPending,
    totalRefunded,
    refundsCount,
    partialRefundsCount,
    fullRefundsCount,
  };
}
