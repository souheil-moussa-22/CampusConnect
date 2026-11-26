import { auth } from '@/presentation/auth';
import { redirect } from 'next/navigation';
import { campusApplication } from '@/presentation/server/services';

export default async function Admin() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/dashboard');
  const { users, requestCount, reports } = await campusApplication.getAdminData();

  return <div>
    <h1 className="text-2xl font-bold">Administration</h1>
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      <Stat label="Users" value={users.length}/>
      <Stat label="Publications" value={requestCount}/>
      <Stat label="Pending reports" value={reports.filter(report => report.status === 'PENDING').length}/>
    </div>
    <section className="mt-6 rounded-xl border bg-white p-5">
      <h2 className="font-bold">Users</h2>
      <div className="mt-4 divide-y">{users.map(user => <div key={user.id} className="flex items-center justify-between py-3">
        <div><b>{user.name}</b><p className="text-xs text-slate-500">{user.email} · {user.role}</p></div>
        <form action={async () => {
          'use server';
          const current = await auth();
          if (!current || current.user.role !== 'ADMIN') throw new Error('Unauthorized');
          await campusApplication.toggleAccountStatus(user.id);
          redirect('/admin');
        }}>
          <button className="rounded-lg border px-3 py-2 text-xs">{user.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}</button>
        </form>
      </div>)}</div>
    </section>
    <section className="mt-6 rounded-xl border bg-white p-5">
      <h2 className="font-bold">Reports</h2>
      {reports.length ? reports.map(report => <div key={report.id} className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-4">
        <div><b>{report.request?.title || 'Publication'}</b><p className="text-sm text-slate-500">{report.reason} · reported by {report.reporter.name} · {report.status}</p></div>
        {report.status === 'PENDING' && <form action={async () => {
          'use server';
          const current = await auth();
          if (!current || current.user.role !== 'ADMIN') throw new Error('Unauthorized');
          await campusApplication.resolveReport(report.id, current.user.id);
          redirect('/admin');
        }}>
          <button className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">Hide &amp; resolve</button>
        </form>}
      </div>) : <p className="mt-4 text-sm text-slate-500">No reports.</p>}
    </section>
  </div>;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;
}
