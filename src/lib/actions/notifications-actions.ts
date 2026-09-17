'use server'

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/services/notifications';

export async function markAsReadAction(id: string) { const user = await requireAuth(); await markNotificationAsRead(id, user.id); revalidatePath('/admin/notifications'); }
export async function markAllAsReadAction() { const user = await requireAuth(); await markAllNotificationsAsRead(user.id); revalidatePath('/admin/notifications'); }
