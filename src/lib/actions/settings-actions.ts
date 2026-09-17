'use server'

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getSettings, updateSetting } from '@/lib/services/settings';

export async function getSettingsAction() { await requireRole(['ADMIN']); return getSettings(); }
export async function updateSettingAction(key: string, value: any, category: string) { const user = await requireAuth(); await requireRole(['ADMIN']); await updateSetting(key, value, category, user.id); revalidatePath('/admin/cms/settings'); }
