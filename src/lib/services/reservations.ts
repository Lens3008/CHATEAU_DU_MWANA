import { db } from '@/prisma/db';
import { DateRange } from './date-utils';

export type ReservationStats = {
  totalReservations: number;
  draftCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  averageCart: number;
  cancellationRate: number;
};

export type TopFormula = {
  id: string;
  name: string;
  reservationsCount: number;
  participantsCount: number;
  revenue: number;
};

export async function getReservationStats(range: DateRange): Promise<ReservationStats> {
  const { startDate, endDate } = range;

  const allReservations = await db.orm.public.Reservation.all();
  const reservations = allReservations.filter((r: any) => {
    const d = new Date(r.createdAt.toString());
    return d >= startDate && d <= endDate;
  });

  const totalReservations = reservations.length;
  const draftCount = reservations.filter((r: any) => r.status === 'DRAFT').length;
  const confirmedCount = reservations.filter((r: any) => r.status === 'CONFIRMED').length;
  const completedCount = reservations.filter((r: any) => r.status === 'COMPLETED').length;
  const cancelledCount = reservations.filter((r: any) => r.status === 'CANCELLED').length;

  const validReservations = reservations.filter((r: any) => r.status !== 'CANCELLED');
  const validCount = validReservations.length;
  
  const totalRevenue = validReservations.reduce((sum: number, r: any) => sum + Number(r.totalAmount), 0);
  const averageCart = validCount > 0 ? totalRevenue / validCount : 0;
  
  const cancellationRate = totalReservations > 0 ? (cancelledCount / totalReservations) * 100 : 0;

  return {
    totalReservations,
    draftCount,
    confirmedCount,
    completedCount,
    cancelledCount,
    averageCart,
    cancellationRate,
  };
}

export async function getTopFormulas(range: DateRange, limit: number = 5): Promise<TopFormula[]> {
  const { startDate, endDate } = range;

  const allReservations = await db.orm.public.Reservation.all();
  const allItems = await db.orm.public.ReservationItem.all();
  const allFormulas = await db.orm.public.Formula.all();

  const validReservations = allReservations.filter((r: any) => {
    const d = new Date(r.createdAt.toString());
    return d >= startDate && d <= endDate && r.status !== 'CANCELLED';
  });
  
  const validReservationIds = new Set(validReservations.map((r: any) => r.id));

  const items = allItems.filter((i: any) => validReservationIds.has(i.reservationId));

  const map = new Map<string, TopFormula>();

  for (const item of items) {
    const formula = allFormulas.find((f: any) => f.id === item.formulaId);
    if (!formula) continue;

    const reservation = validReservations.find((r: any) => r.id === item.reservationId);
    
    const formulaId = formula.id;
    if (!map.has(formulaId)) {
      map.set(formulaId, {
        id: formulaId,
        name: formula.name,
        reservationsCount: 0,
        participantsCount: 0,
        revenue: 0,
      });
    }

    const current = map.get(formulaId)!;
    current.reservationsCount += 1;
    current.revenue += Number(item.totalPrice);
    if (reservation && reservation.participants) {
      current.participantsCount += reservation.participants;
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);

  return sorted.slice(0, limit);
}
