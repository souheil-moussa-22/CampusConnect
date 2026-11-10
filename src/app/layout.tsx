import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CampusConnect",
  description: "Student help and skills-sharing platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
