const fs = require('fs');
const path = require('path');

const dir = 'src/lib/actions';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function writeAction(name, content) {
    fs.writeFileSync(path.join(dir, name + '.ts'), "'use server'\n" + content);
}

writeAction('templates-actions', `
import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { createTemplate, updateTemplate, deleteTemplate } from '@/lib/services/templates';

export async function createTemplateAction(data: any) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await createTemplate(data, user.id); revalidatePath('/admin/cms/templates'); }
export async function updateTemplateAction(id: string, data: any) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await updateTemplate(id, data, user.id); revalidatePath('/admin/cms/templates'); }
export async function deleteTemplateAction(id: string) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await deleteTemplate(id, user.id); revalidatePath('/admin/cms/templates'); }
`);

writeAction('contact-actions', `
import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { updateContactMessageStatus } from '@/lib/services/contact';

export async function updateContactMessageStatusAction(id: string, status: string) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await updateContactMessageStatus(id, status); revalidatePath('/admin/contact'); }
`);

writeAction('notifications-actions', `
import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/services/notifications';

export async function markAsReadAction(id: string) { const user = await requireAuth(); await markNotificationAsRead(id, user.id); revalidatePath('/admin/notifications'); }
export async function markAllAsReadAction() { const user = await requireAuth(); await markAllNotificationsAsRead(user.id); revalidatePath('/admin/notifications'); }
`);

writeAction('imports-actions', `
import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { createImportJob } from '@/lib/services/imports';

export async function submitImportAction(data: any) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await createImportJob(data, user.id); revalidatePath('/admin/imports'); }
`);

writeAction('gallery-actions', `
import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { createGallery, updateGallery, addMediaToGallery, removeMediaFromGallery } from '@/lib/services/gallery';

export async function createGalleryAction(data: any) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await createGallery(data, user.id); revalidatePath('/admin/cms/gallery'); }
export async function updateGalleryAction(id: string, data: any) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await updateGallery(id, data, user.id); revalidatePath('/admin/cms/gallery'); }
export async function addMediaAction(id: string, mediaId: string) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await addMediaToGallery(id, mediaId); revalidatePath('/admin/cms/gallery'); }
export async function removeMediaAction(id: string, mediaId: string) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await removeMediaFromGallery(id, mediaId); revalidatePath('/admin/cms/gallery'); }
`);

writeAction('cms-actions', `
import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getPageById, createPage, updatePage, deletePage, getPages } from '@/lib/services/cms';

export async function getPageByIdAction(id: string) { return getPageById(id); }
export async function getPagesAction() { return getPages(); }
export async function createPageAction(data: any) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await createPage(data, user.id); revalidatePath('/admin/cms'); }
export async function updatePageAction(id: string, data: any) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await updatePage(id, data, user.id); revalidatePath('/admin/cms'); }
export async function deletePageAction(id: string) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await deletePage(id); revalidatePath('/admin/cms'); }
`);

writeAction('media-actions', `
import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getMedias, uploadMedia, deleteMedia } from '@/lib/services/media';

export async function getMediasAction() { return getMedias(); }
export async function uploadMediaAction(file: any, metadata: any) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await uploadMedia(file, metadata, user.id); revalidatePath('/admin/cms/media'); }
export async function deleteMediaAction(id: string) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await deleteMedia(id); revalidatePath('/admin/cms/media'); }
`);

writeAction('settings-actions', `
import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { getSettings, updateSetting } from '@/lib/services/settings';

export async function getSettingsAction() { return getSettings(); }
export async function updateSettingAction(key: string, value: any, category: string) { const user = await requireAuth(); await requireRole(user, ['ADMIN']); await updateSetting(key, value, category, user.id); revalidatePath('/admin/cms/settings'); }
`);

writeAction('analytics', `
import { requireAuth, requireRole } from '@/lib/auth/user';

export async function getAnalyticsDashboardData() { 
    return {}; 
}
`);

writeAction('crm-actions', `
import { requireAuth, requireRole } from '@/lib/auth/user';

export async function getCustomer360Action(id: string) { return {}; }
export async function getCRMDashboardStatsAction() { return {}; }
export async function getCustomersAction() { return []; }
`);

writeAction('loyalty-actions', `
import { requireAuth, requireRole } from '@/lib/auth/user';

export async function getCustomerLoyaltySummaryAction(id: string) { return {}; }
`);

writeAction('reservation-actions', `
import { requireAuth, requireRole } from '@/lib/auth/user';

export async function createReservationAction(data: any) { return {}; }
`);

console.log('Action files recreated successfully.');
