import type { Metadata } from 'next';
import { roboto } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Design System',
  description: 'A comprehensive design system built with Next.js, TypeScript, and Tailwind CSS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
