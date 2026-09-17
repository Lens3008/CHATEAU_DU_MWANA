import { db } from '../prisma';
import { createAuditLog } from './audit';

export async function getSettings() {
  return await db.orm.public.SiteSettings.all();
}

export async function getSetting(key: string) {
  const settings = await db.orm.public.SiteSettings.all();
  return settings.find((s: any) => s.key === key);
}

export async function updateSetting(key: string, value: string, description?: string, userId?: string) {
  let sql;
  if (description) {
    sql = db.raw.sql`
      INSERT INTO "siteSettings" (id, key, value, description, "updatedAt")
      VALUES (gen_random_uuid(), ${key}, ${value}, ${description}, now())
      ON CONFLICT (key) DO UPDATE SET value = ${value}, description = ${description}, "updatedAt" = now()
    `;
  } else {
    sql = db.raw.sql`
      INSERT INTO "siteSettings" (id, key, value, description, "updatedAt")
      VALUES (gen_random_uuid(), ${key}, ${value}, null, now())
      ON CONFLICT (key) DO UPDATE SET value = ${value}, "updatedAt" = now()
    `;
  }

  await db.transaction(async (tx: any) => { await tx.execute(sql.affectedCount().build()); }); 

  await createAuditLog({
    userId,
    action: 'UPDATE_SETTING',
    entityType: 'SiteSettings',
    entityId: key,
    newValues: { value }
  });

  return true;
}
