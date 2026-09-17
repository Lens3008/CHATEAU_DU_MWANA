import { db } from '../prisma';

export async function getNotifications(userId: string) {
  const allNotifications = await db.orm.public.Notification.all();
  return allNotifications.filter((n: any) => n.userId === userId);
}

export async function createNotification(userId: string, title: string, message: string, type: 'SYSTEM' | 'REMINDER' = 'SYSTEM') {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`
      INSERT INTO "notification" (id, "userId", title, message, type, "isRead", "createdAt")
      VALUES (gen_random_uuid(), ${userId}, ${title}, ${message}, ${type}::"NotificationType", false, now())
    `.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Échec de création de la notification.");
  return true;
}

export async function markNotificationAsRead(id: string, userId: string) {
  let affectedCount = 1;
  await db.transaction(async (tx: any) => {
    await tx.execute(db.raw.sql`
      UPDATE "notification" SET "isRead" = true
      WHERE id = ${id} AND "userId" = ${userId}
    `.affectedCount().build());
  });
  if (affectedCount === 0) throw new Error("Notification introuvable ou non autorisée.");
  return true;
}
