
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { AppMode } from '../types/app';


interface AppModeContextType {
	mode: AppMode;
	setMode: (mode: AppMode) => void;
	isOnline: boolean;
	lastSyncTime: number | null;
}

const AppModeContext = createContext<AppModeContextType | null>(null);

export function AppModeProvider({ children }: { children: React.ReactNode }) {
	const [mode, setModeState] = useLocalStorage<AppMode>('app_mode', 'online');
	const [lastSyncTime, setLastSyncTime] = useLocalStorage<number | null>('last_sync_time', null);
	const [isOnline, setIsOnline] = useState(true);


	useEffect(() => {
		const updateOnlineStatus = () => {
			setIsOnline(navigator.onLine);
		};

		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);
		updateOnlineStatus();

		return () => {
			window.removeEventListener('online', updateOnlineStatus);
			window.removeEventListener('offline', updateOnlineStatus);
		};
	}, []);

	const setMode = (newMode: AppMode) => {
		setModeState(newMode);
	};

	return (
		<AppModeContext.Provider value={{
			mode,
			setMode,
			isOnline,
			lastSyncTime
		}}>
			{children}
		</AppModeContext.Provider>
	);
}

export const useAppMode = () => {
	const context = useContext(AppModeContext);
	if (!context) {
		throw new Error('useAppMode must be used within an AppModeProvider');
	}
	return context;
};