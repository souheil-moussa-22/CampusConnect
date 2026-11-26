import { auth } from '@/presentation/auth';
import { redirect } from 'next/navigation';
import { campusApplication } from '@/presentation/server/services';

export default async function Notifications() {
  const session = await auth();
  if (!session) redirect('/login');
  const notifications = await campusApplication.getNotifications(session.user.id);

  return <div>
    <div className="flex justify-between">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <form action={async () => {
        'use server';
        const current = await auth();
        if (!current) redirect('/login');
        await campusApplication.markAllNotificationsRead(current.user.id);
        redirect('/notifications');
      }}>
        <button className="rounded-lg border px-3 py-2 text-sm">Mark all read</button>
      </form>
    </div>
    <div className="mt-6 space-y-3">
      {notifications.map(notification => <form key={notification.id} action={async () => {
        'use server';
        const current = await auth();
        if (!current) redirect('/login');
        await campusApplication.markNotificationRead(notification.id, current.user.id);
        redirect('/notifications');
      }}>
        <button className={`w-full rounded-xl border p-4 text-left ${notification.read ? 'bg-white' : 'border-indigo-200 bg-indigo-50'}`}>
          <p className="text-sm">{notification.message}</p>
          <p className="mt-1 text-xs text-slate-400">{notification.createdAt.toLocaleString()} · {notification.read ? 'Read' : 'Unread'}</p>
        </button>
      </form>)}
    </div>
    {!notifications.length && <p className="mt-8 rounded-xl border border-dashed bg-white p-12 text-center text-slate-500">No notifications.</p>}
  </div>;
}
