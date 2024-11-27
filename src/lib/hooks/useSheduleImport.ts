import { useState, useEffect, useCallback } from 'react';
import { parseExcelFile } from '@/lib/utils/excelParser';
import { useScheduleCache } from './useScheduleCache';
import { ParsedSchedule } from '@/lib/types/shedule';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { useNotification } from '@/lib/context/NotificationContext';

export function useScheduleImport() {
	const { showNotification } = useNotification();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [parsedData, setParsedData] = useState<ParsedSchedule | null>(null);
	const { cachedSchedule, metadata, clearCache, saveWeekSchedule } = useScheduleCache();

	useEffect(() => {
		console.log('Current metadata state:', metadata);
		console.log('Current cachedSchedule state:', !!cachedSchedule);

		if (!parsedData && cachedSchedule && metadata) {
			setParsedData(cachedSchedule);
			const lastUpdate = new Date(metadata.lastUpdated);

			// Проверяем валидность даты перед форматированием
			if (!isNaN(lastUpdate.getTime())) {
				showNotification(
					`Загружено расписание от ${lastUpdate.toLocaleDateString('ru-RU')}`,
					'info'
				);

				const daysAgo = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
				if (daysAgo >= 5) {
					showNotification(
						'Рекомендуется обновить расписание в ближайшие дни',
						'warning'
					);
				}
			} else {
				console.error('Invalid lastUpdated timestamp:', metadata.lastUpdated);
			}
		}
	}, [cachedSchedule, parsedData, metadata]);
	const handleFileImport = async (file: File): Promise<ParsedSchedule | null> => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await parseExcelFile(file);
			setParsedData(data);

			// Сразу сохраняем данные в weekSchedule
			if (data) {
				saveWeekSchedule(file.name, data);

				// Показываем уведомление об успешной загрузке
				showNotification(
					`Расписание успешно загружено ${new Date().toLocaleDateString('ru-RU')}`,
					'success'
				);
			}

			return data;
		} catch (error) {
			const errorMessage = error instanceof Error
				? error.message
				: 'Произошла ошибка при обработке файла';
			setError(errorMessage);
			showNotification(errorMessage, 'error');
			console.error('File import error:', error);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const checkDataFreshness = useCallback(() => {
		if (!metadata?.lastUpdated) {
			return { isFresh: false, lastUpdate: null };
		}

		const lastUpdate = new Date(metadata.lastUpdated);
		const isFresh = Date.now() - lastUpdate.getTime() < CACHE_CONSTANTS.LIFETIME.SCHEDULE;

		// Показываем предупреждение только если данные устарели
		if (!isFresh) {
			showNotification(
				'Рекомендуется обновить расписание',
				'warning'
			);
		}

		return { isFresh, lastUpdate };
	}, [metadata, showNotification]);

	useEffect(() => {
		if (metadata?.lastUpdated) {
			checkDataFreshness();
		}
	}, [metadata, checkDataFreshness]);

	return {
		isLoading,
		error,
		parsedData,
		handleFileImport,
		checkDataFreshness,
		resetError: () => setError(null)
	};
}