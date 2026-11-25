'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  LayoutDashboard,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';

type AppNavigationProps = {
  admin: boolean;
  name: string;
};

const primaryLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/requests', label: 'Find help', icon: Search },
  { href: '/requests/new', label: 'Create a request', icon: MessageSquareText },
  { href: '/sessions', label: 'Study sessions', icon: CalendarDays },
];

const communityLinks = [
  { href: '/matching', label: 'Peer matching', icon: Sparkles },
  { href: '/reviews', label: 'Reviews', icon: Star },
  { href: '/profile', label: 'My profile', icon: UserRound },
];

function NavigationLink({ href, label, icon: Icon }: (typeof primaryLinks)[number]) {
  const pathname = usePathname();
  const active = href === '/dashboard'
    ? pathname === href
    : href === '/requests'
      ? pathname.startsWith('/requests') && pathname !== '/requests/new'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className="nav-link">
      <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export function AppNavigation({ admin, name }: AppNavigationProps) {
  const pathname = usePathname();
  const links = [...primaryLinks, ...communityLinks, ...(admin ? [{ href: '/admin', label: 'Administration', icon: ShieldCheck }] : [])];
  const initial = name.trim().charAt(0).toUpperCase() || 'S';

  return (
    <>
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3 px-2" aria-label="CampusConnect overview">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Sparkles size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold tracking-tight text-slate-900">CampusConnect</span>
            <span className="block text-xs text-slate-500">Learn better, together</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="mt-9 flex-1">
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Workspace</p>
          <div className="space-y-1">
            {primaryLinks.map(link => <NavigationLink key={link.href} {...link} />)}
          </div>
          <p className="mb-2 mt-7 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Community</p>
          <div className="space-y-1">
            {communityLinks.map(link => <NavigationLink key={link.href} {...link} />)}
          </div>
          {admin && (
            <>
              <p className="mb-2 mt-7 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Manage</p>
              <NavigationLink href="/admin" label="Administration" icon={ShieldCheck} />
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 border-t border-slate-100 px-2 pt-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{initial}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-800">{name}</span>
            <span className="block text-xs text-slate-500">{admin ? 'Campus administrator' : 'Student member'}</span>
          </span>
        </div>
      </aside>

      <div className="border-b border-slate-200/80 bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="CampusConnect overview">
            <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
              <Sparkles size={17} aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900">CampusConnect</span>
          </Link>
          <span className="grid size-8 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{initial}</span>
        </div>
        <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard'
              ? pathname === href
              : href === '/requests'
                ? pathname.startsWith('/requests') && pathname !== '/requests/new'
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
