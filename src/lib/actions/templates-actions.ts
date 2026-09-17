'use server'

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { createTemplate, updateTemplate, deleteTemplate } from '@/lib/services/templates';

export async function createTemplateAction(data: any) { const user = await requireAuth(); await requireRole(['ADMIN']); await createTemplate(data, user.id); revalidatePath('/admin/cms/templates'); }
export async function updateTemplateAction(id: string, data: any) { const user = await requireAuth(); await requireRole(['ADMIN']); await updateTemplate(id, data, user.id); revalidatePath('/admin/cms/templates'); }
export async function deleteTemplateAction(id: string) { const user = await requireAuth(); await requireRole(['ADMIN']); await deleteTemplate(id, user.id); revalidatePath('/admin/cms/templates'); }
