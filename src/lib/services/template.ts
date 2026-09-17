import { db } from '../prisma';

export async function getTemplates() {
  return await db.orm.public.DocumentTemplate.all();
}

export async function getTemplateById(id: string) {
  const templates = await db.orm.public.DocumentTemplate.all();
  return templates.find((t: any) => t.id === id);
}

export async function createTemplate(name: string, type: 'INVOICE' | 'CONTRACT' | 'QUOTE', content: string) {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`
      INSERT INTO "documentTemplate" (id, name, type, content, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${type}::"TemplateType", ${content}, now(), now())
    `.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Échec de création du template.");
  return true;
}

export async function updateTemplate(id: string, name: string, content: string) {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`
      UPDATE "documentTemplate"
      SET name = ${name}, content = ${content}, "updatedAt" = now()
      WHERE id = ${id}
    `.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Template introuvable.");
  return true;
}

export async function deleteTemplate(id: string) {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`DELETE FROM "documentTemplate" WHERE id = ${id}`.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Template introuvable.");
  return true;
}
