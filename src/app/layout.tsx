import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DFIR MCP',
  description: 'DFIR MCP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko'>
      <body className='bg-slate-950 text-slate-100 antialiased'>
        {children}
      </body>
    </html>
  );
}
