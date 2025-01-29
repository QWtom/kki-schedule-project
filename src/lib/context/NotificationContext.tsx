'use client';

import React, { createContext, useContext, useState, useCallback, ReactElement } from 'react';
import { Alert, Snackbar } from '@mui/material';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface NotificationMessage {
	id: number;
	message: string;
	type: NotificationType;
}

interface NotificationContextType {
	showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
	const [queue, setQueue] = useState<NotificationMessage[]>([]);
	const [open, setOpen] = useState(false);
	const [currentMessage, setCurrentMessage] = useState<NotificationMessage | null>(null);

	const processQueue = useCallback(() => {
		if (queue.length > 0 && !open) {
			const message = queue[0];
			if (message) {
				setCurrentMessage(message);
				setOpen(true);
				setQueue(prev => prev.slice(1));
			}
		}
	}, [queue, open]);

	const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
		const newMessage: NotificationMessage = {
			id: Date.now(),
			message,
			type
		};

		setQueue(prev => [...prev, newMessage]);
	}, []);

	const handleClose = useCallback((event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') return;
		setOpen(false);
	}, []);

	React.useEffect(() => {
		if (!open) {
			const timer = setTimeout(processQueue, 300);
			return () => clearTimeout(timer);
		}
	}, [open, processQueue]);

	return (
		<NotificationContext.Provider value={{ showNotification }}>
			{children}
			<Snackbar
				key={currentMessage?.id}
				open={open}
				autoHideDuration={6000}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				TransitionProps={{ onExited: () => setCurrentMessage(null) }}
			>
				{(() => {
					if (!currentMessage) {
						return <div />;
					}
					return (
						<Alert
							onClose={handleClose}
							severity={currentMessage.type}
							elevation={6}
							variant="filled"
						>
							{currentMessage.message}
						</Alert>
					);
				})()}
			</Snackbar>
		</NotificationContext.Provider>
	);
}

export const useNotification = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotification must be used within a NotificationProvider');
	}
	return context;
};