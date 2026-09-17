import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears, startOfQuarter, endOfQuarter } from 'date-fns';

export type PeriodFilter = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'last_year' | 'custom';

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export function getPeriodRange(period: PeriodFilter, customStart?: Date, customEnd?: Date): DateRange {
  const now = new Date();

  switch (period) {
    case 'today':
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
    case '7d':
      return { startDate: startOfDay(subDays(now, 6)), endDate: endOfDay(now) };
    case '30d':
      return { startDate: startOfDay(subDays(now, 29)), endDate: endOfDay(now) };
    case 'this_month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    case 'last_month':
      const lastMonth = subMonths(now, 1);
      return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
    case 'this_quarter':
      return { startDate: startOfQuarter(now), endDate: endOfQuarter(now) };
    case 'this_year':
      return { startDate: startOfYear(now), endDate: endOfYear(now) };
    case 'last_year':
      const lastYear = subYears(now, 1);
      return { startDate: startOfYear(lastYear), endDate: endOfYear(lastYear) };
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom period requires both start and end dates');
      }
      return { startDate: startOfDay(customStart), endDate: endOfDay(customEnd) };
    default:
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
  }
}

export function getPreviousPeriodRange(period: PeriodFilter, currentRange: DateRange): DateRange | null {
  if (period === 'custom') return null; // Simple assumption, we can calculate delta if needed
  
  const { startDate, endDate } = currentRange;
  const durationMs = endDate.getTime() - startDate.getTime();

  return {
    startDate: new Date(startDate.getTime() - durationMs),
    endDate: new Date(endDate.getTime() - durationMs)
  };
}
