'use client'

import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/theme';
import { Inter } from 'next/font/google';
import { Space_Grotesk } from 'next/font/google';
import { Onest } from 'next/font/google';
import { NotificationProvider } from '@/lib/context/NotificationContext';

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
        <ThemeProvider theme={theme}>
          <NotificationProvider>
            <CssBaseline />
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}