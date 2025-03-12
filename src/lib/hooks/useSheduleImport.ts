import { useState, useEffect, useCallback, useRef } from 'react';
import { parseExcelFile } from '@/lib/utils/excelParser';
import { useScheduleCache } from './useScheduleCache';
import { ParsedSchedule } from '@/lib/types/shedule';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { useNotification } from '@/lib/context/NotificationContext';
import { validateScheduleExcel } from '@/lib/utils/validateScheduleExcel';

type DataFreshnessInfo = {
	isFresh: boolean;
	lastUpdate: Date | null;
	daysAgo: number | null;
};

export function useScheduleImport() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [parsedData, setParsedData] = useState<ParsedSchedule | null>(null);
	const { showNotification } = useNotification();
	const { cachedSchedule, metadata, saveWeekSchedule } = useScheduleCache();

	const notificationsShownRef = useRef<Set<string>>(new Set());
	const importInProgressRef = useRef(false);

	const showNotificationOnce = useCallback(
		(message: string, type: 'info' | 'warning' | 'success' | 'error') => {
			const key = `${message}-${type}`;
			if (!notificationsShownRef.current.has(key)) {
				showNotification(message, type);
				notificationsShownRef.current.add(key);

				setTimeout(() => {
					notificationsShownRef.current.delete(key);
				}, 5000);
			}
		},
		[showNotification]
	);

	const checkDataFreshness = useCallback((): DataFreshnessInfo => {
		if (!metadata?.lastUpdated) {
			return { isFresh: false, lastUpdate: null, daysAgo: null };
		}

		const lastUpdate = new Date(metadata.lastUpdated);
		if (isNaN(lastUpdate.getTime())) {
			console.error('Invalid lastUpdated timestamp:', metadata.lastUpdated);
			return { isFresh: false, lastUpdate: null, daysAgo: null };
		}

		const timeDiff = Date.now() - lastUpdate.getTime();
		const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
		const isFresh = timeDiff < CACHE_CONSTANTS.LIFETIME.SCHEDULE;

		if (!isLoading && !isFresh) {
			showNotificationOnce('Рекомендуется обновить расписание', 'warning');
		}

		return { isFresh, lastUpdate, daysAgo };
	}, [metadata, isLoading, showNotificationOnce]);

	useEffect(() => {
		if (!parsedData && cachedSchedule && metadata) {
			setParsedData(cachedSchedule);
			const { lastUpdate } = checkDataFreshness();

			if (lastUpdate) {
				showNotificationOnce(
					`Загружено расписание от ${lastUpdate.toLocaleDateString('ru-RU')}`,
					'info'
				);
			}
		}
	}, [cachedSchedule, parsedData, metadata, checkDataFreshness, showNotificationOnce]);


	const handleFileImport = useCallback(
		async (file: File): Promise<ParsedSchedule | null> => {
			if (importInProgressRef.current) {
				showNotificationOnce('Импорт уже выполняется', 'warning');
				return null;
			}

			importInProgressRef.current = true;
			setIsLoading(true);
			setError(null);

			try {

				const validation = await validateScheduleExcel(file);
				if (!validation.isValid) {
					throw new Error(validation.error || 'Неверный формат файла расписания');
				}

				const data = await parseExcelFile(file);
				if (!data) {
					throw new Error('Не удалось обработать файл расписания');
				}

				setParsedData(data);
				saveWeekSchedule(file.name, data);

				showNotificationOnce(
					`Расписание успешно загружено ${new Date().toLocaleDateString('ru-RU')}`,
					'success'
				);

				return data;
			} catch (error) {
				const errorMessage = error instanceof Error
					? error.message
					: 'Произошла ошибка при обработке файла';

				setError(errorMessage);
				showNotificationOnce(errorMessage, 'error');
				console.error('File import error:', error);
				return null;
			} finally {
				setIsLoading(false);
				importInProgressRef.current = false;
			}
		},
		[saveWeekSchedule, showNotificationOnce]
	);

	useEffect(() => {
		return () => {
			notificationsShownRef.current.clear();
			importInProgressRef.current = false;
		};
	}, []);

	return {
		isLoading,
		error,
		parsedData,
		handleFileImport,
		checkDataFreshness,
		resetError: () => setError(null)
	};
}