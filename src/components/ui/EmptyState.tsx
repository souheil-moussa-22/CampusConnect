import Link from "next/link";
export function EmptyState({ title, description, action }: { title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="empty-state"><div className="empty-icon">✦</div><h3>{title}</h3><p>{description}</p>{action && <Link className="button" href={action.href}>{action.label}</Link>}</div>;
}
