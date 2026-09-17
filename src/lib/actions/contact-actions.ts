// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { updateContactMessageStatus } from '@/lib/services/contact';

export async function updateContactMessageStatusAction(id: string, status: string) { const user = await requireAuth(); await requireRole(['ADMIN', 'SECRETARY']); await updateContactMessageStatus(id, status); revalidatePath('/admin/contact'); }
