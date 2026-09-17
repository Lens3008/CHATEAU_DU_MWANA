import { db } from '../prisma';
import { createAuditLog } from './audit';

export async function getTemplates() {
  return await db.orm.public.DocumentTemplate.all();
}

export async function getTemplate(id: string) {
  const all = await db.orm.public.DocumentTemplate.all();
  return all.find((t: any) => t.id === id) || null;
}

export async function createTemplate(data: { type: string; content: string; isActive: boolean; }, userId: string) {
  const sql = db.raw.sql`
    INSERT INTO "documentTemplate" (id, type, content, "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${data.type}::"DocumentTemplateType", ${data.content}, ${data.isActive ? 'true' : 'false'}::boolean, now(), now())
    RETURNING *
  `;
  
  let insertedId: string | null = null;
  await db.transaction(async (tx: any) => {
    const res = await tx.execute(sql);
    if (res.rows.length > 0) insertedId = res.rows[0].id;
  });

  if (!insertedId) throw new Error("Erreur création template");

  await createAuditLog({
    userId,
    action: 'CREATE',
    entityType: 'DocumentTemplate',
    entityId: insertedId,
    newValues: data
  });

  return insertedId;
}

export async function updateTemplate(id: string, data: { type: string; content: string; isActive: boolean; }, userId: string) {
  const sql = db.raw.sql`
    UPDATE "documentTemplate"
    SET type = ${data.type}::"DocumentTemplateType", content = ${data.content}, "isActive" = ${data.isActive ? 'true' : 'false'}::boolean, "updatedAt" = now()
    WHERE id = ${id}
  `;

  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entityType: 'DocumentTemplate',
    entityId: id,
    newValues: data
  });

  return true;
}

export async function deleteTemplate(id: string, userId: string) {
  const sql = db.raw.sql`DELETE FROM "documentTemplate" WHERE id = ${id}`;

  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entityType: 'DocumentTemplate',
    entityId: id
  });

  return true;
}
