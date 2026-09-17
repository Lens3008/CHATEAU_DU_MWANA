import { Metadata } from 'next';
import { getAnalyticsDashboardData } from '@/lib/actions/analytics';
import DashboardClient from './components/DashboardClient';
import { PeriodFilter } from '@/lib/services/analytics/date-utils';
import { requireRole } from '@/lib/auth/user';

export const metadata: Metadata = {
  title: 'Pilotage & Analytics | Château du Mwana',
  description: 'Tableau de bord analytique et financier',
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { period?: string; start?: string; end?: string };
}) {
  // Security: Only ADMIN and SUPERVISOR can access analytics
  // SECRETARY, LOGISTICIAN and CLIENT are denied access
  await requireRole(['ADMIN', 'SUPERVISOR']);
  
  const period = (searchParams.period as PeriodFilter) || 'this_month';
  let customStart = undefined;
  let customEnd = undefined;

  if (period === 'custom' && searchParams.start && searchParams.end) {
    customStart = new Date(searchParams.start);
    customEnd = new Date(searchParams.end);
  }

  const initialData = await getAnalyticsDashboardData(period, customStart, customEnd);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <DashboardClient initialData={initialData} initialPeriod={period} />
    </div>
  );
}
