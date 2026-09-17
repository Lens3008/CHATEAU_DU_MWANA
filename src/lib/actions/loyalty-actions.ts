'use server'

import { requireRole } from '@/lib/auth/user';
import { getCustomerLoyaltySummary } from '@/lib/services/loyalty';

export async function getCustomerLoyaltySummaryAction(id: string) {
  await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY']);
  return await getCustomerLoyaltySummary(id);
}
