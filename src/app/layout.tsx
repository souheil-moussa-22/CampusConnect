import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'CampusConnect', description: 'Student collaboration and study matching' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
