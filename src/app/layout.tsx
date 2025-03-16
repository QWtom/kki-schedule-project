'use client'

import { useState, useEffect } from 'react';
import { Providers } from '@/components/Providers';
import { Nunito } from 'next/font/google';
import { CssBaseline, CircularProgress, Box } from '@mui/material';

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="ru">
      <body className={nunito.className}>
        <Providers>
          <CssBaseline />
          {isClient ? (
            children
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
              <CircularProgress />
            </Box>
          )}
        </Providers>
      </body>
    </html>
  );
}