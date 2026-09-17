'use server'

import { requireAuth, requireRole } from '@/lib/auth/user';
import { getPeriodRange } from '@/lib/services/analytics/date-utils';
import { getReservationStats, getTopFormulas } from '@/lib/services/analytics/reservations';
import { getFinanceStats } from '@/lib/services/analytics/finance';
import { getCustomerStats } from '@/lib/services/analytics/clients';
import { getInventoryStats, getMissionStats } from '@/lib/services/analytics/logistics';

export async function getAnalyticsDashboardData(period: any = 'this_month', customStart?: any, customEnd?: any) { 
  const user = await requireAuth();
  await requireRole(['ADMIN', 'SUPERVISOR']);
  const range = period === 'custom' && customStart && customEnd 
    ? { startDate: new Date(customStart), endDate: new Date(customEnd) }
    : getPeriodRange(period);

  const [
    reservations,
    topFormulas,
    customers,
    finance,
    inventory,
    missions
  ] = await Promise.all([
    getReservationStats(range),
    getTopFormulas(range, 5),
    getCustomerStats(range),
    getFinanceStats(range),
    getInventoryStats(),
    getMissionStats(range)
  ]);

  return {
    role: user.role,
    reservations,
    topFormulas,
    customers,
    finance,
    logistics: {
      inventory,
      missions
    }
  };
}
