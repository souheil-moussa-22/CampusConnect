import { redirect } from 'next/navigation'; import { auth } from '@/presentation/auth'; import { AppShell } from '@/components/layout/app-shell';
export default async function StudentLayout({children}:{children:React.ReactNode}){const session=await auth();if(!session) redirect('/login');return <AppShell>{children}</AppShell>}
