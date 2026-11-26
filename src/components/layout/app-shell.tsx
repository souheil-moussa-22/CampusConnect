import Link from 'next/link';
import { Bell, LogOut } from 'lucide-react';
import { auth, signOut } from '@/presentation/auth';
import { AppNavigation } from '@/components/layout/app-navigation';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const admin = session?.user.role === 'ADMIN';

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <AppNavigation admin={admin} name={session?.user.name || 'Student'} />
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-500">
              Welcome back, <span className="font-semibold text-slate-800">{session?.user.name}</span>
            </p>
            <p className="hidden text-xs text-slate-400 sm:block">Make today a little more collaborative.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              aria-label="View notifications"
              className="grid size-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-700"
            >
              <Bell size={19} aria-hidden="true" />
            </Link>
            <span className="hidden h-8 w-px bg-slate-200 sm:block" />
            <form action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}>
              <button className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                <LogOut size={17} aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </header>
        <main className="soft-enter mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          {children}
        </main>
      </div>
    </div>
  );
}
