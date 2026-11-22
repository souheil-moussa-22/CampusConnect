import Link from 'next/link';
import { auth, signOut } from '@/lib/auth';
import { LayoutDashboard, Search, PlusCircle, CalendarDays, Bell, UserCircle, ShieldCheck, Star } from 'lucide-react';

export async function AppShell({children}:{children:React.ReactNode}) {
  const session = await auth();
  const admin = session?.user.role === 'ADMIN';
  return <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
    <aside className="border-r border-slate-200 bg-white px-5 py-6"><Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-indigo-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">C</span>CampusConnect</Link>
      <nav className="mt-8 space-y-1 text-sm font-medium">
        <Nav href="/dashboard" icon={<LayoutDashboard size={18}/>}>Dashboard</Nav><Nav href="/requests" icon={<Search size={18}/>}>Find help</Nav><Nav href="/requests/new" icon={<PlusCircle size={18}/>}>New request</Nav><Nav href="/sessions" icon={<CalendarDays size={18}/>}>Sessions</Nav><Nav href="/notifications" icon={<Bell size={18}/>}>Notifications</Nav><Nav href="/profile" icon={<UserCircle size={18}/>}>Profile</Nav><Nav href="/matching" icon={<Star size={18}/>}>Smart matching</Nav><Nav href="/reviews" icon={<Star size={18}/>}>Reviews</Nav>{admin&&<Nav href="/admin" icon={<ShieldCheck size={18}/>}>Administration</Nav>}
      </nav>
    </aside>
    <main className="min-w-0"><header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6"><p className="text-sm text-slate-500">Good to see you, <b className="text-slate-800">{session?.user.name}</b></p><form action={async()=>{'use server'; await signOut({redirectTo:'/login'})}}><button className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">Sign out</button></form></header><div className="mx-auto max-w-6xl p-6">{children}</div></main>
  </div>;
}
function Nav({href,icon,children}:{href:string;icon:React.ReactNode;children:React.ReactNode}) { return <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">{icon}{children}</Link>; }
