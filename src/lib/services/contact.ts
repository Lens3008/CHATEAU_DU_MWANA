import { db } from '../prisma';
import { createAuditLog } from './audit';

export async function getContactMessages() {
  const all = await db.orm.public.ContactMessage.all();
  return all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getContactMessage(id: string) {
  const all = await db.orm.public.ContactMessage.all();
  return all.find((m: any) => m.id === id) || null;
}

export async function createContactMessage(data: { name: string; email: string; phone?: string; message: string; }) {
  const phoneVal = data.phone || '';
  const sql = db.raw.sql`
    INSERT INTO "contactMessage" (id, name, email, phone, message, status, "createdAt")
    VALUES (gen_random_uuid(), ${data.name}, ${data.email}, NULLIF(${phoneVal}, ''), ${data.message}, 'NEW'::"ContactMessageStatus", now())
    RETURNING id
  `;
  
  let insertedId: string | null = null;
  await db.transaction(async (tx: any) => {
    const res = await tx.execute(sql);
    if (res.rows.length > 0) insertedId = res.rows[0].id;
  });

  if (!insertedId) throw new Error("Erreur envoi message");
  return insertedId;
}

export async function updateContactMessageStatus(id: string, status: string, userId: string) {
  const sql = db.raw.sql`
    UPDATE "contactMessage"
    SET status = ${status}::"ContactMessageStatus"
    WHERE id = ${id}
  `;

  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });

  await createAuditLog({
    userId,
    action: 'UPDATE_STATUS',
    entityType: 'ContactMessage',
    entityId: id,
    newValues: { status }
  });

  return true;
}
