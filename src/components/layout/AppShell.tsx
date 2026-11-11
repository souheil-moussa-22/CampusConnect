"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Icon } from "@/components/ui/Icons";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name || "Étudiant";
  const initials = name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "grid" as const },
    { href: "/help-requests", label: "Help requests", icon: "search" as const },
    { href: "/my-requests", label: "My requests", icon: "file" as const },
    { href: "/profile", label: "My profile", icon: "user" as const }
  ];
  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/dashboard" className="brand"><span className="brand-mark">C</span>CampusConnect</Link>
      <nav className="nav" aria-label="Main navigation">
        {links.map((link) => <Link className={`nav-link ${pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href)) ? "active" : ""}`} href={link.href} key={link.href}><Icon name={link.icon} />{link.label}</Link>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="profile-mini"><span className="avatar">{initials}</span><div><strong>{name}</strong><span>{session?.user?.email}</span></div></div>
        <button className="logout-button" onClick={() => signOut({ callbackUrl: "/login" })}><Icon name="logout" /> Log out</button>
      </div>
    </aside>
    <div className="main-content">
      <header className="topbar"><span className="topbar-title">Student community · Learn, share, grow</span><div className="profile-mini"><span className="avatar">{initials}</span><strong>{name}</strong></div></header>
      {children}
    </div>
  </div>;
}
