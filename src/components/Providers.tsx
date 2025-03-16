// src/components/Providers.tsx
'use client'

import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/theme';
import { NotificationProvider } from '@/lib/context/NotificationContext';
import { SyncManager } from '@/components/SyncManager';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider theme={theme}>
			<NotificationProvider>
				<CssBaseline />
				<SyncManager />
				{children}
			</NotificationProvider>
		</ThemeProvider>
	);
}