import React, { createContext, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface NotificationContextType {
	showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [type, setType] = useState<NotificationType>('info');

	const showNotification = (newMessage: string, newType: NotificationType = 'info') => {
		setMessage(newMessage);
		setType(newType);
		setOpen(true);
	};

	const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') return;
		setOpen(false);
	};

	return (
		<NotificationContext.Provider value={{ showNotification }}>
			{children}
			<Snackbar
				open={open}
				autoHideDuration={6000}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Alert onClose={handleClose} severity={type} elevation={6} variant="filled">
					{message}
				</Alert>
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