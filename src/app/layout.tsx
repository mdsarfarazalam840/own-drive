import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Space Drive — Unlimited Telegram Cloud',
  description: 'Your files, securely stored in Telegram with unlimited space. Upload, stream, and manage your media from anywhere.',
  keywords: ['telegram', 'cloud storage', 'file manager', 'unlimited storage'],
  openGraph: {
    title: 'Space Drive — Unlimited Telegram Cloud',
    description: 'Secure unlimited cloud storage powered by Telegram.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Animated deep-space background */}
        <div className="space-grid-bg" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />

        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
