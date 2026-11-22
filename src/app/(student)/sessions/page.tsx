import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function Sessions() {
  const session = await auth();
  if (!session) redirect('/login');
  const sessions = await prisma.studySession.findMany({
    where: { OR: [{ ownerId: session.user.id }, { helpingStudentId: session.user.id }] },
    include: { request: true, owner: true, helpingStudent: true },
    orderBy: { date: 'desc' }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">My sessions</h1>
      <div className="mt-6 space-y-4">
        {sessions.map(s => (
          <div key={s.id} className="rounded-xl border bg-white p-5">
            <div className="flex justify-between">
              <div>
                <h2 className="font-bold">{s.request.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {s.owner.name} &amp; {s.helpingStudent.name} · {s.date.toLocaleString()} · {s.duration} min
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{s.status}</span>
            </div>
            {s.status === 'SCHEDULED' && (
              <div className="mt-4 flex gap-2">
                <form action={async () => {
                  'use server';
                  const current = await auth();
                  if (!current || (current.user.id !== s.ownerId && current.user.id !== s.helpingStudentId) || s.status !== 'SCHEDULED') {
                    throw new Error('Unauthorized');
                  }
                  await prisma.$transaction(async tx => {
                    await tx.studySession.update({ where: { id: s.id }, data: { status: 'COMPLETED' } });
                    await tx.helpRequest.update({ where: { id: s.requestId }, data: { status: 'COMPLETED' } });
                    await tx.notification.createMany({
                      data: [
                        { recipientId: s.ownerId, type: 'SESSION_COMPLETED', message: `Session for ${s.request.title} was completed.` },
                        { recipientId: s.helpingStudentId, type: 'SESSION_COMPLETED', message: `Session for ${s.request.title} was completed.` }
                      ]
                    });
                  });
                  redirect('/sessions');
                }}>
                  <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Complete</button>
                </form>
                <form action={async () => {
                  'use server';
                  const current = await auth();
                  if (!current || (current.user.id !== s.ownerId && current.user.id !== s.helpingStudentId) || s.status !== 'SCHEDULED') {
                    throw new Error('Unauthorized');
                  }
                  await prisma.studySession.update({ where: { id: s.id }, data: { status: 'CANCELLED' } });
                  await prisma.notification.createMany({
                    data: [
                      { recipientId: s.ownerId, type: 'SESSION_CANCELLED', message: `Session for ${s.request.title} was cancelled.` },
                      { recipientId: s.helpingStudentId, type: 'SESSION_CANCELLED', message: `Session for ${s.request.title} was cancelled.` }
                    ]
                  });
                  redirect('/sessions');
                }}>
                  <button className="rounded-lg border px-3 py-2 text-sm">Cancel</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
      {!sessions.length && (
        <div className="mt-8 rounded-xl border border-dashed bg-white p-12 text-center text-slate-500">
          No study sessions yet.
        </div>
      )}
    </div>
  );
}
