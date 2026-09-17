'use server'

import { requireRole } from '@/lib/auth/user';
import { getCustomer360, getCRMDashboardStats, getCustomers } from '@/lib/services/crm';

export async function getCustomer360Action(id: string): Promise<any> {
  await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY']);
  return await getCustomer360(id);
}

export async function getCRMDashboardStatsAction(): Promise<any> {
  await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY']);
  return await getCRMDashboardStats();
}

export async function getCustomersAction() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY']);
  return await getCustomers();
}
