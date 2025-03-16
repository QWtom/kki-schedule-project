// src/lib/hooks/useGoogleSheets.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { getGoogleSheet } from '@/app/api/googlesheets/googleapi';
import { useNotification } from '@/lib/context/NotificationContext';
import { useAppMode } from './useAppMode';
import { useScheduleCache } from './useScheduleCache';
import { parseGoogleSheetData } from '@/lib/utils/parseGoogleSheetData';

export function useGoogleSheets() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastSync, setLastSync] = useState<Date | null>(null);
	const { showNotification } = useNotification();
	const { isOnlineMode, isAutoSyncEnabled, updateLastSyncTime, lastSyncTime } = useAppMode();
	const { saveWeekSchedule } = useScheduleCache();
	const activeRequestRef = useRef<Promise<any> | null>(null);

	// Функция для получения данных с Google Sheets
	const fetchGoogleSheetData = useCallback(async (silent = false) => {
		if (!isOnlineMode) return null;

		if (activeRequestRef.current) {
			return activeRequestRef.current;
		}

		setIsLoading(true);
		setError(null);


		try {
			activeRequestRef.current = getGoogleSheet();
			// Получаем данные с Google Sheets
			const data = await getGoogleSheet();


			if (!data) {
				throw new Error('Не удалось получить данные расписания');
			}

			// Парсим данные
			const parsedData = parseGoogleSheetData(data);

			// Сохраняем данные в кэш
			await saveWeekSchedule('Google-API-Schedule', parsedData);

			// Обновляем время последней синхронизации
			updateLastSyncTime();
			setLastSync(new Date());

			if (!silent) {
				showNotification('Данные успешно обновлены с сервера', 'success');
			}

			return parsedData;
		} catch (error) {
			const errorMessage = error instanceof Error
				? error.message
				: 'Ошибка при загрузке данных с сервера';

			setError(errorMessage);

			if (!silent) {
				showNotification(errorMessage, 'error');
			}

			console.error('Error fetching Google Sheets data:', error);
			return null;
		} finally {
			setIsLoading(false);
		}
	}, [isOnlineMode, saveWeekSchedule, showNotification, updateLastSyncTime]);

	// Автоматическая синхронизация
	useEffect(() => {
		if (!isOnlineMode || !isAutoSyncEnabled) return;

		// Проверяем, нужна ли синхронизация
		const shouldSync = !lastSyncTime || (Date.now() - lastSyncTime > 16 * 60 * 60 * 1000);

		// Используем setTimeout вместо немедленного вызова
		let syncTimeout: NodeJS.Timeout | null = null;

		if (shouldSync && !activeRequestRef.current) {
			syncTimeout = setTimeout(() => {
				fetchGoogleSheetData(true);
			}, 2000); // Задержка 2 секунды после загрузки
		}

		// Интервал для автосинхронизации
		const interval = setInterval(() => {
			if (!activeRequestRef.current) {
				fetchGoogleSheetData(true);
			}
		}, 16 * 60 * 60 * 1000);

		return () => {
			if (syncTimeout) clearTimeout(syncTimeout);
			clearInterval(interval);
		};
	}, [isOnlineMode, isAutoSyncEnabled, lastSyncTime, fetchGoogleSheetData]);

	return {
		isLoading,
		error,
		lastSync,
		fetchGoogleSheetData,
		resetError: () => setError(null)
	};
}