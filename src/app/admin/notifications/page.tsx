import { requireRole, requireAuth } from '@/lib/auth/user';
import { db } from '@/lib/prisma';
import { Bell, Check, X, CheckCheck } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Notifications | Château du Mwana Admin',
};

async function markAsReadAction(formData: FormData) {
  'use server';
  const user = await requireAuth();
  const notificationId = formData.get('notificationId') as string;
  if (!notificationId) return;

  // User can only mark THEIR OWN notifications as read
  await db.transaction(async (tx: any) => {
    await tx.execute(
      db.raw.sql`UPDATE "Notification" SET "read" = true WHERE id = ${notificationId} AND "userId" = ${user.id}`.affectedCount().build()
    );
  });
  revalidatePath('/admin/notifications');
}

async function deleteNotificationAction(formData: FormData) {
  'use server';
  const user = await requireAuth();
  const notificationId = formData.get('notificationId') as string;
  if (!notificationId) return;

  // User can only delete THEIR OWN notifications
  await db.transaction(async (tx: any) => {
    await tx.execute(
      db.raw.sql`DELETE FROM "Notification" WHERE id = ${notificationId} AND "userId" = ${user.id}`.affectedCount().build()
    );
  });
  revalidatePath('/admin/notifications');
}

async function markAllAsReadAction() {
  'use server';
  const user = await requireAuth();
  await db.transaction(async (tx: any) => {
    await tx.execute(
      db.raw.sql`UPDATE "Notification" SET "read" = true WHERE "userId" = ${user.id} AND "read" = false`.affectedCount().build()
    );
  });
  revalidatePath('/admin/notifications');
}

export default async function NotificationsPage() {
  await requireRole(['ADMIN', 'SUPERVISOR', 'SECRETARY', 'LOGISTICIAN']);
  const user = await requireAuth();

  // Isolation: only fetch THIS user's notifications
  const allNotifications = await db.orm.public.Notification.all();
  const userNotifications = allNotifications
    .filter((n: any) => n.userId === user.id)
    .sort((a: any, b: any) => {
      const da = new Date(a.createdAt?.toString?.() || a.createdAt);
      const db2 = new Date(b.createdAt?.toString?.() || b.createdAt);
      return db2.getTime() - da.getTime();
    });

  const unreadCount = userNotifications.filter((n: any) => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">
            Centre de notifications et alertes système
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllAsReadAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          </form>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        {userNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune notification</h3>
            <p className="text-slate-500">
              Vous n&apos;avez aucune notification pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userNotifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-indigo-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{notification.title || 'Notification'}</h4>
                    <p className="text-sm text-slate-600 mt-1">{notification.message || 'Message'}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {notification.createdAt ? new Date(notification.createdAt.toString()).toLocaleString('fr-FR') : ''}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    {!notification.read && (
                      <form action={markAsReadAction}>
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <button
                          type="submit"
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Marquer comme lu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                    <form action={deleteNotificationAction}>
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <button
                        type="submit"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
