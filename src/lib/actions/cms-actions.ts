'use server'

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getPageById, createPage, updatePage, deletePage, getPages } from '@/lib/services/cms';

export async function getPageByIdAction(id: string) { await requireRole(['ADMIN']); return getPageById(id); }
export async function getPagesAction() { await requireRole(['ADMIN']); return getPages(); }
export async function createPageAction(data: any): Promise<any> { const user = await requireAuth(); await requireRole(['ADMIN']); await createPage(data, user.id); revalidatePath('/admin/cms'); }
export async function updatePageAction(id: string, data: any): Promise<any> { const user = await requireAuth(); await requireRole(['ADMIN']); await updatePage(id, data, user.id); revalidatePath('/admin/cms'); }
export async function deletePageAction(id: string) { const user = await requireAuth(); await requireRole(['ADMIN']); await deletePage(id); revalidatePath('/admin/cms'); }
