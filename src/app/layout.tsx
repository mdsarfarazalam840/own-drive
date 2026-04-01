import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Telegram Drive',
  description: 'Unlimited Cloud Storage on Telegram',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="aurora-bg" />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
