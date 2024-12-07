'use client'

import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/theme';
import { NotificationProvider } from '@/lib/context/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider theme={theme}>
			<NotificationProvider>
				<CssBaseline />
				{children}
			</NotificationProvider>
		</ThemeProvider>
	);
}