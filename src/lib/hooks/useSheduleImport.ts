import { useState, useEffect } from 'react';
import { parseExcelFile } from '@/lib/utils/excelParser';
import { useScheduleCache } from './useScheduleCache';
import { ParsedSchedule } from '@/lib/types/shedule';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { validateScheduleData } from '@/lib/utils/scheduleValidator';
import { useNotification } from '@/lib/context/NotificationContext';

export function useScheduleImport() {
	const { showNotification } = useNotification();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [parsedData, setParsedData] = useState<ParsedSchedule | null>(null);
	const { cachedSchedule, metadata, saveSchedule, clearCache } = useScheduleCache();

	useEffect(() => {
		if (!parsedData && cachedSchedule) {
			setParsedData(cachedSchedule);
			const lastUpdate = new Date(metadata?.lastUpdated || 0);
			const daysAgo = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

			showNotification(
				`Загружено расписание от ${lastUpdate.toLocaleDateString()}`,
				'info'
			);

			// Предупреждаем, если данные старше 5 дней
			if (daysAgo >= 5) {
				showNotification(
					'Рекомендуется обновить расписание в ближайшие дни',
					'warning'
				);
			}
		}
	}, [cachedSchedule, parsedData]);
	const handleFileImport = async (file: File): Promise<ParsedSchedule | null> => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await parseExcelFile(file);
			setParsedData(data);
			return data; // Теперь мы явно возвращаем данные
		} catch (error) {
			const errorMessage = error instanceof Error
				? error.message
				: 'Произошла ошибка при обработке файла';
			setError(errorMessage);
			console.error('File import error:', error);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const checkDataFreshness = () => {
		if (!metadata) {
			return { isFresh: false, lastUpdate: null };
		}

		const lastUpdate = new Date(metadata.lastUpdated);
		const isFresh = Date.now() - lastUpdate.getTime() < CACHE_CONSTANTS.LIFETIME.SCHEDULE;

		return { isFresh, lastUpdate };
	};

	return {
		isLoading,
		error,
		parsedData,
		handleFileImport,
		forceUpdate: async (file: File) => {
			clearCache();
			await handleFileImport(file);
		},
		checkDataFreshness,
		resetError: () => setError(null)
	};
}