import { db } from '../prisma';
import { createAuditLog } from './audit';

export async function getGalleries() {
  const galleries = await db.orm.public.Gallery.all();
  const items = await db.orm.public.GalleryItem.all();
  
  return galleries.map((g: any) => ({
    ...g,
    items: items.filter((i: any) => i.galleryId === g.id)
  }));
}

export async function getGallery(id: string) {
  const all = await db.orm.public.Gallery.all();
  const gallery = all.find((g: any) => g.id === id);
  if (!gallery) return null;

  const items = await db.orm.public.GalleryItem.all();
  const medias = await db.orm.public.Media.all();

  const galleryItems = items
    .filter((i: any) => i.galleryId === id)
    .map((i: any) => ({
      ...i,
      media: medias.find((m: any) => m.id === i.mediaId)
    }))
    .sort((a: any, b: any) => a.order - b.order);

  return {
    ...gallery,
    items: galleryItems
  };
}

export async function createGallery(data: { name: string; description?: string; }, userId: string) {
  const desc = data.description || '';
  const sql = db.raw.sql`
    INSERT INTO "gallery" (id, name, description, "createdAt")
    VALUES (gen_random_uuid(), ${data.name}, NULLIF(${desc}, ''), now())
    RETURNING *
  `;
  
  let insertedId: string | null = null;
  await db.transaction(async (tx: any) => {
    const res = await tx.execute(sql);
    if (res.rows.length > 0) insertedId = res.rows[0].id;
  });

  if (!insertedId) throw new Error("Erreur création galerie");

  await createAuditLog({
    userId,
    action: 'CREATE',
    entityType: 'Gallery',
    entityId: insertedId,
    newValues: data
  });

  return insertedId;
}

export async function updateGallery(id: string, data: { name: string; description?: string; }, userId: string) {
  const desc = data.description || '';
  const sql = db.raw.sql`
    UPDATE "gallery"
    SET name = ${data.name}, description = NULLIF(${desc}, '')
    WHERE id = ${id}
  `;

  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entityType: 'Gallery',
    entityId: id,
    newValues: data
  });

  return true;
}

export async function deleteGallery(id: string, userId: string) {
  const sql = db.raw.sql`DELETE FROM "gallery" WHERE id = ${id}`;

  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entityType: 'Gallery',
    entityId: id
  });

  return true;
}

export async function addMediaToGallery(galleryId: string, mediaId: string, order: number, userId: string) {
  const sql = db.raw.sql`
    INSERT INTO "galleryItem" (id, "galleryId", "mediaId", "order")
    VALUES (gen_random_uuid(), ${galleryId}, ${mediaId}, ${order})
  `;
  
  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });

  await createAuditLog({
    userId,
    action: 'ADD_MEDIA',
    entityType: 'Gallery',
    entityId: galleryId,
    newValues: { mediaId, order }
  });

  return true;
}

export async function removeMediaFromGallery(galleryItemId: string, galleryId: string, userId: string) {
  const sql = db.raw.sql`DELETE FROM "galleryItem" WHERE id = ${galleryItemId}`;
  
  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });

  await createAuditLog({
    userId,
    action: 'REMOVE_MEDIA',
    entityType: 'Gallery',
    entityId: galleryId,
    oldValues: { galleryItemId }
  });

  return true;
}
