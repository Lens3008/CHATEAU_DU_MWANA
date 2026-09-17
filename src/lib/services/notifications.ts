import { db } from '../prisma';

export async function getUserNotifications(userId: string) {
  const all = await db.orm.public.Notification.all();
  return all
    .filter((n: any) => n.userId === userId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationAsRead(id: string, userId: string) {
  const sql = db.raw.sql`
    UPDATE "notification"
    SET read = true
    WHERE id = ${id} AND "userId" = ${userId}
  `;

  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });

  return true;
}

export async function markAllNotificationsAsRead(userId: string) {
  const sql = db.raw.sql`
    UPDATE "notification"
    SET read = true
    WHERE "userId" = ${userId} AND read = false
  `;

  await db.transaction(async (tx: any) => {
    await tx.execute(sql.affectedCount().build());
  });

  return true;
}
