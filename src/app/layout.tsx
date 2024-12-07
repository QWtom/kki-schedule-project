'use client'

import { Providers } from '@/components/Providers';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-nunito',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={nunito.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}