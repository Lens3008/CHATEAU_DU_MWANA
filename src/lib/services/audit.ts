import { db } from '../prisma';

export async function createAuditLog(data: {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  context?: string;
}) {
  const newValsStr = data.newValues ? JSON.stringify(data.newValues) : '';
  const oldValsStr = data.oldValues ? JSON.stringify(data.oldValues) : '';

  const sql = db.raw.sql`
    INSERT INTO "auditLog" (id, "userId", action, "entityType", "entityId", "oldValues", "newValues", "ipAddress", context, date)
    VALUES (
      gen_random_uuid(), 
      NULLIF(${data.userId || ''}, ''), 
      ${data.action}, 
      ${data.entityType}, 
      ${data.entityId}, 
      NULLIF(${oldValsStr}, '')::jsonb, 
      NULLIF(${newValsStr}, '')::jsonb, 
      NULLIF(${data.ipAddress || ''}, ''), 
      NULLIF(${data.context || ''}, ''), 
      now()
    )
  `;
  
  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });
}
