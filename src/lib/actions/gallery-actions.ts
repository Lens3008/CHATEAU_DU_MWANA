'use server'

import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { createGallery, updateGallery, addMediaToGallery, removeMediaFromGallery } from '@/lib/services/gallery';

export async function createGalleryAction(data: any) { const user = await requireAuth(); await requireRole(['ADMIN']); await createGallery(data, user.id); revalidatePath('/admin/cms/gallery'); }
export async function updateGalleryAction(id: string, data: any) { const user = await requireAuth(); await requireRole(['ADMIN']); await updateGallery(id, data, user.id); revalidatePath('/admin/cms/gallery'); }
export async function addMediaAction(id: string, mediaId: string) { const user = await requireAuth(); await requireRole(['ADMIN']); await addMediaToGallery(id, mediaId, 0, user.id); revalidatePath('/admin/cms/gallery'); }
export async function removeMediaAction(id: string, mediaId: string) { const user = await requireAuth(); await requireRole(['ADMIN']); await removeMediaFromGallery(mediaId, id, user.id); revalidatePath('/admin/cms/gallery'); }
