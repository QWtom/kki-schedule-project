'use client'

import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/theme';
import { NotificationProvider } from '@/lib/context/NotificationContext';
import { SyncManager } from '@/components/SyncManager';

export function Providers({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div style={{ visibility: 'hidden' }}>{children}</div>;
	}

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