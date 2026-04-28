import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinTracker — Monzo Dashboard',
  description: 'Personal finance tracker with spending insights and savings recommendations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
