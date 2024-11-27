'use client'

import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/theme';
import { Inter } from 'next/font/google';
import { NotificationProvider } from '@/lib/context/NotificationContext';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
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