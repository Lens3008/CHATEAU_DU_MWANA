import { revalidatePath } from 'next/cache';
import { requireAuth, requireRole } from '@/lib/auth/user';
import { processImport } from '@/lib/services/imports';

export async function submitImportAction(data: FormData) {
  const user = await requireAuth();
  await requireRole(['ADMIN']);
  
  const entityType = data.get('entityType') as string;
  const file = data.get('file') as File;
  
  if (!entityType || !file) {
    throw new Error("Missing required fields");
  }

  const csvContent = await file.text();
  
  await processImport(entityType, csvContent, user.id);
  revalidatePath('/admin/imports');
}
