'use server'

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getMedias, uploadMedia, deleteMedia } from '@/lib/services/media';

export async function getMediasAction() { await requireRole(['ADMIN']); return getMedias(); }
export async function uploadMediaAction(file: any, metadata?: any) { const user = await requireAuth(); await requireRole(['ADMIN']); await uploadMedia(file, metadata, user.id); revalidatePath('/admin/cms/media'); }
export async function deleteMediaAction(id: string) { const user = await requireAuth(); await requireRole(['ADMIN']); await deleteMedia(id); revalidatePath('/admin/cms/media'); }
