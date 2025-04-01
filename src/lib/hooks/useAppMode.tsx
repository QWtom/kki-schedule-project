
import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AppMode, AppSettings, DEFAULT_APP_SETTINGS } from '@/lib/types/app';
import { useNotification } from '@/lib/context/NotificationContext';

export function useAppMode() {
	const [isLoaded, setIsLoaded] = useState(false);
	const { showNotification } = useNotification();

	const [settings, setSettings] = useLocalStorage<AppSettings>(
		'app_settings',
		DEFAULT_APP_SETTINGS
	);

	const toggleAppMode = () => {
		const newMode: AppMode = settings.mode === 'online' ? 'offline' : 'online';
		setSettings({
			...settings,
			mode: newMode
		});

		showNotification(`Режим приложения изменен на ${newMode === 'online' ? 'онлайн' : 'оффлайн'}`, 'info');
	};

	const toggleAutoSync = () => {
		setSettings({
			...settings,
			autoSyncEnabled: !settings.autoSyncEnabled
		});

		showNotification(
			`Автоматическая синхронизация ${settings.autoSyncEnabled ? 'выключена' : 'включена'}`,
			'info'
		);
	};

	const updateLastSyncTime = () => {
		setSettings({
			...settings,
			lastSyncTime: Date.now()
		});
	};

	useEffect(() => {
		setIsLoaded(true);
	}, []);

	return {
		isOnlineMode: settings.mode === 'online',
		isOfflineMode: settings.mode === 'offline',
		isAutoSyncEnabled: settings.autoSyncEnabled,
		lastSyncTime: settings.lastSyncTime,
		toggleAppMode,
		toggleAutoSync,
		updateLastSyncTime,
		isLoaded
	};
}