import { useState, useEffect } from 'react';
import { parseExcelFile } from '@/lib/utils/excelParser';
import { useScheduleCache } from './useScheduleCache';
import { ParsedSchedule } from '@/lib/types/shedule';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { validateScheduleData } from '@/lib/utils/scheduleValidator';

export function useScheduleImport() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [parsedData, setParsedData] = useState<ParsedSchedule | null>(null);
	const { cachedSchedule, metadata, saveSchedule, clearCache } = useScheduleCache();

	useEffect(() => {
		if (!parsedData && cachedSchedule) {
			console.log('Loading schedule from cache...');
			setParsedData(cachedSchedule);
		}
	}, [cachedSchedule, parsedData]);

	const handleFileImport = async (file: File) => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await parseExcelFile(file);

			if (!validateScheduleData(data)) {
				throw new Error('Некорректный формат данных расписания');
			}

			setParsedData(data);
			saveSchedule(data);
		} catch (error) {
			const errorMessage = error instanceof Error
				? error.message
				: 'Произошла ошибка при обработке файла';
			setError(errorMessage);
			console.error('File import error:', error);
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