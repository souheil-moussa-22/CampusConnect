import { auth } from '@/presentation/auth';
import { redirect } from 'next/navigation';
import { campusApplication } from '@/presentation/server/services';

export default async function Profile() {
  const session = await auth();
  if (!session) redirect('/login');
  const { user, skills } = await campusApplication.getProfile(session.user.id);
  const profile = user?.profile;

  return <div className="mx-auto max-w-2xl">
    <h1 className="text-2xl font-bold">Student profile</h1>
    <form action={async formData => {
      'use server';
      const current = await auth();
      if (!current) redirect('/login');
      await campusApplication.saveProfile({
        userId: current.user.id,
        name: String(formData.get('name')),
        specialty: String(formData.get('specialty')),
        level: String(formData.get('level')),
        biography: String(formData.get('biography')),
        skills: String(formData.get('skills')).split(',').map(skill => skill.trim()).filter(Boolean),
      });
      redirect('/profile');
    }} className="mt-6 space-y-4 rounded-xl border bg-white p-6">
      <label className="block text-sm font-medium">Name<input name="name" defaultValue={user?.name} required className="mt-2 w-full rounded-lg border px-3 py-2"/></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Specialty<input name="specialty" defaultValue={profile?.specialty || ''} className="mt-2 w-full rounded-lg border px-3 py-2"/></label>
        <label className="block text-sm font-medium">Level<select name="level" defaultValue={profile?.level || 'L1'} className="mt-2 w-full rounded-lg border px-3 py-2">{['L1','L2','L3','M1','M2'].map(level=><option key={level}>{level}</option>)}</select></label>
      </div>
      <label className="block text-sm font-medium">Biography<textarea name="biography" rows={4} defaultValue={profile?.biography || ''} className="mt-2 w-full rounded-lg border px-3 py-2"/></label>
      <label className="block text-sm font-medium">Skills (comma separated)<input name="skills" defaultValue={profile?.skills.map(skill => skill.name).join(', ') || ''} className="mt-2 w-full rounded-lg border px-3 py-2"/></label>
      <p className="text-xs text-slate-400">Available skills: {skills.map(skill => skill.name).join(', ')}</p>
      <button className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white">Save profile</button>
    </form>
  </div>;
}
