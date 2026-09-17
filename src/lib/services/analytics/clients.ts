import { db } from '@/prisma/db';
import { DateRange } from './date-utils';

export type CustomerStats = {
  totalCustomersWhoBooked: number;
  newCustomers: number;
  returningCustomers: number;
  totalParticipants: number;
};

export async function getCustomerStats(range: DateRange): Promise<CustomerStats> {
  const { startDate, endDate } = range;

  const allReservations = await db.orm.public.Reservation.all();

  const reservationsInPeriod = allReservations.filter((r: any) => {
    const d = new Date(r.createdAt.toString());
    return d >= startDate && d <= endDate && r.status !== 'CANCELLED';
  });

  const customerIdsInPeriod = [...new Set(reservationsInPeriod.map((r: any) => r.customerId))];
  const totalCustomersWhoBooked = customerIdsInPeriod.length;

  let newCustomers = 0;
  let returningCustomers = 0;
  let totalParticipants = 0;

  reservationsInPeriod.forEach((r: any) => {
    if (r.participants) totalParticipants += r.participants;
  });

  if (customerIdsInPeriod.length > 0) {
    for (const customerId of customerIdsInPeriod) {
      // Find historical reservations for this customer
      const historicalCount = allReservations.filter((r: any) => r.customerId === customerId && r.status !== 'CANCELLED').length;
      if (historicalCount > 1) {
        returningCustomers++;
      } else {
        newCustomers++;
      }
    }
  }

  return {
    totalCustomersWhoBooked,
    newCustomers,
    returningCustomers,
    totalParticipants,
  };
}
