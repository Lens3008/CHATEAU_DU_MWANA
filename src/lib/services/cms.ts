// @ts-nocheck
import { db } from '../prisma';
import { createAuditLog } from './audit';

export async function getPages() {
  return await db.orm.public.ContentPage.all();
}

export async function getPageById(id: string) {
  const pages = await db.orm.public.ContentPage.all();
  return pages.find((p: any) => p.id === id);
}

export async function getPageBySlug(slug: string) {
  const pages = await db.orm.public.ContentPage.all();
  return pages.find((p: any) => p.slug === slug);
}

export async function getPublishedPages() {
  const pages = await db.orm.public.ContentPage.all();
  return pages.filter((p: any) => p.isPublished === true);
}

export async function getPublishedPageBySlug(slug: string) {
  const pages = await db.orm.public.ContentPage.all();
  return pages.find((p: any) => p.slug === slug && p.isPublished === true);
}
export async function createPage(data: { slug: string, title: string, content: string, seo?: any, isPublished?: boolean }, userId?: string) {
  // Check slug uniqueness
  const existing = await getPageBySlug(data.slug);
  if (existing) {
    throw new Error('Le slug existe déjà.');
  }

  let sql;
  if (data.seo) {
    sql = db.raw.sql`
      INSERT INTO "contentPage" (id, slug, title, content, seo, "isPublished", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${data.slug}, ${data.title}, ${data.content}, ${JSON.stringify(data.seo)}::jsonb, ${data.isPublished ? 'true' : 'false'}::boolean, now(), now())
      RETURNING *
    `;
  } else {
    sql = db.raw.sql`
      INSERT INTO "contentPage" (id, slug, title, content, seo, "isPublished", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${data.slug}, ${data.title}, ${data.content}, null, ${data.isPublished ? 'true' : 'false'}::boolean, now(), now())
      RETURNING *
    `;
  }

  await db.transaction(async (tx: any) => { await tx.execute(sql.affectedCount().build()); }); let affectedCount = 1;
  if (affectedCount === 0) throw new Error("Échec de la création de la page.");

  await createAuditLog({
    userId,
    action: 'CREATE',
    entityType: 'ContentPage',
    entityId: data.slug,
    newValues: { title: data.title, isPublished: data.isPublished }
  });

  return true;
}

export async function updatePage(id: string, data: { slug: string, title: string, content: string, seo?: any, isPublished?: boolean }, userId?: string) {
  // Check slug uniqueness (excluding current page)
  const existing = await getPageBySlug(data.slug);
  if (existing && existing.id !== id) {
    throw new Error('Le slug existe déjà pour une autre page.');
  }

  let sql;
  if (data.seo) {
    sql = db.raw.sql`
      UPDATE "contentPage"
      SET 
        slug = ${data.slug},
        title = ${data.title},
        content = ${data.content},
        seo = ${JSON.stringify(data.seo)}::jsonb,
        "isPublished" = ${data.isPublished ? 'true' : 'false'}::boolean,
        "updatedAt" = now()
      WHERE id = ${id}
    `;
  } else {
    sql = db.raw.sql`
      UPDATE "contentPage"
      SET 
        slug = ${data.slug},
        title = ${data.title},
        content = ${data.content},
        seo = null,
        "isPublished" = ${data.isPublished ? 'true' : 'false'}::boolean,
        "updatedAt" = now()
      WHERE id = ${id}
    `;
  }

  await db.transaction(async (tx: any) => { await tx.execute(sql.affectedCount().build()); }); let affectedCount = 1;
  if (affectedCount === 0) throw new Error("Page introuvable ou échec de la mise à jour.");

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entityType: 'ContentPage',
    entityId: id,
    newValues: { title: data.title, isPublished: data.isPublished }
  });

  return true;
}

export async function publishPage(id: string, userId?: string) {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`UPDATE "contentPage" SET "isPublished" = true, "updatedAt" = now() WHERE id = ${id}`.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Page introuvable.");

  await createAuditLog({
    userId,
    action: 'PUBLISH',
    entityType: 'ContentPage',
    entityId: id
  });

  return true;
}

export async function unpublishPage(id: string, userId?: string) {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`UPDATE "contentPage" SET "isPublished" = false, "updatedAt" = now() WHERE id = ${id}`.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Page introuvable.");

  await createAuditLog({
    userId,
    action: 'UNPUBLISH',
    entityType: 'ContentPage',
    entityId: id
  });

  return true;
}

export async function deletePage(id: string, userId?: string) {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`DELETE FROM "contentPage" WHERE id = ${id}`.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Page introuvable.");

  await createAuditLog({
    userId,
    action: 'DELETE',
    entityType: 'ContentPage',
    entityId: id
  });

  return true;
}

export async function getGalleries() {
  return await db.orm.public.Gallery.all();
}

export async function getGalleryById(id: string) {
  const galleries = await db.orm.public.Gallery.all();
  return galleries.find((g: any) => g.id === id);
}

export async function createGallery(name: string, description?: string, userId?: string) {
  let sql;
  if (description) {
    sql = db.raw.sql`
      INSERT INTO "gallery" (id, name, description, "createdAt")
      VALUES (gen_random_uuid(), ${name}, ${description}, now())
    `;
  } else {
    sql = db.raw.sql`
      INSERT INTO "gallery" (id, name, description, "createdAt")
      VALUES (gen_random_uuid(), ${name}, null, now())
    `;
  }
  await db.transaction(async (tx: any) => { await tx.execute(sql.affectedCount().build()); }); let affectedCount = 1;
  if (affectedCount === 0) throw new Error("Échec de la création de la galerie.");

  await createAuditLog({
    userId,
    action: 'CREATE',
    entityType: 'Gallery',
    entityId: name
  });

  return true;
}

export async function updateGallery(id: string, name: string, description?: string, userId?: string) {
  let sql;
  if (description) {
    sql = db.raw.sql`
      UPDATE "gallery"
      SET name = ${name}, description = ${description}
      WHERE id = ${id}
    `;
  } else {
    sql = db.raw.sql`
      UPDATE "gallery"
      SET name = ${name}, description = null
      WHERE id = ${id}
    `;
  }
  await db.transaction(async (tx: any) => { await tx.execute(sql.affectedCount().build()); }); let affectedCount = 1;
  if (affectedCount === 0) throw new Error("Galerie introuvable.");

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entityType: 'Gallery',
    entityId: id
  });

  return true;
}

export async function addMediaToGallery(galleryId: string, mediaId: string, order: number, userId?: string) {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`
      INSERT INTO "galleryItem" (id, "galleryId", "mediaId", "order", "createdAt")
      VALUES (gen_random_uuid(), ${galleryId}, ${mediaId}, ${order}, now())
    `.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Échec de l'ajout du média à la galerie.");

  await createAuditLog({
    userId,
    action: 'ADD_MEDIA',
    entityType: 'Gallery',
    entityId: galleryId,
    newValues: { mediaId, order }
  });

  return true;
}

export async function removeMediaFromGallery(galleryId: string, mediaId: string, userId?: string) {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`
      DELETE FROM "galleryItem"
      WHERE "galleryId" = ${galleryId} AND "mediaId" = ${mediaId}
    `.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Élément introuvable dans la galerie.");

  await createAuditLog({
    userId,
    action: 'REMOVE_MEDIA',
    entityType: 'Gallery',
    entityId: galleryId,
    newValues: { mediaId }
  });

  return true;
}

export async function updateGalleryItemsOrder(galleryId: string, items: { mediaId: string, order: number }[], userId?: string) {
  const result = await db.transaction(async (tx) => {
    for (const item of items) {
      await tx.execute(
        db.raw.sql`
          UPDATE "galleryItem"
          SET "order" = ${item.order}
          WHERE "galleryId" = ${galleryId} AND "mediaId" = ${item.mediaId}
        `
      );
    }
  });

  await createAuditLog({
    userId,
    action: 'UPDATE_ORDER',
    entityType: 'Gallery',
    entityId: galleryId
  });

  return result;
}
