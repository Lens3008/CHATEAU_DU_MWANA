import { db } from '../prisma';
import { supabaseAdmin } from '../supabase/admin';
import { createAuditLog } from './audit';

const BUCKET_NAME = 'medias';

export async function ensureBucket() {
  const { data, error } = await supabaseAdmin.storage.getBucket(BUCKET_NAME);
  if (error || !data) {
    await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
      fileSizeLimit: 10485760, // 10MB
    });
  }
}

export async function uploadMedia(file: File, altText?: string, userId?: string) {
  await ensureBucket();

  const extension = file.name.split('.').pop();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
  const timestamp = Date.now();
  const storagePath = `${timestamp}_${safeName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Erreur upload Storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  let type = 'DOCUMENT';
  if (file.type.startsWith('image/')) type = 'IMAGE';
  if (file.type.startsWith('video/')) type = 'VIDEO';

  try {
    await db.transaction(async (tx: any) => {
      await tx.execute(db.raw.sql`
        INSERT INTO "media" (id, "storagePath", url, "mimeType", type, size, "altText", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${storagePath}, ${publicUrlData.publicUrl}, ${file.type}, ${type}::"MediaType", ${file.size}, NULLIF(${altText || ''}, ''), now(), now())
      `.affectedCount().build());
    });
  } catch (dbError) {
    // Compensation : suppression du fichier dans Storage en cas d'échec DB
    await supabaseAdmin.storage.from(BUCKET_NAME).remove([storagePath]);
    throw new Error("Erreur insertion BDD, fichier supprimé du Storage.");
  }

  return true;
}

export async function deleteMedia(id: string, userId?: string) {
  const items = await db.orm.public.GalleryItem.all();
  const linkedItems = items.filter((i: any) => i.mediaId === id);
  if (linkedItems.length > 0) {
    throw new Error("Ce média est utilisé dans une ou plusieurs galeries.");
  }

  const medias = await db.orm.public.Media.all();
  const media = medias.find((m: any) => m.id === id);
  
  if (!media) throw new Error("Média introuvable.");

  if (media.storagePath) {
    await supabaseAdmin.storage.from(BUCKET_NAME).remove([media.storagePath]);
  }

  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`DELETE FROM "media" WHERE id = ${id}`.affectedCount().build());
  });
  
  return true;
}

export async function getMedias() {
  return await db.orm.public.Media.all();
}
