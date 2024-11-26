// lib/hooks/useScheduleImport.ts
import { useState } from 'react';
import { ParsedSchedule } from '@/lib/types/shedule';
import { parseExcelFile } from '../utils/excelParser';

export const useScheduleImport = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [parsedData, setParsedData] = useState<ParsedSchedule | null>(null);

	const handleFileImport = async (file: File) => {
		try {
			setIsLoading(true);
			setError(null);
			console.log('Starting file import');
			const data = await parseExcelFile(file);
			console.log('Parsed data:', data);
			setParsedData(data);
		} catch (err) {
			console.error('Import error:', err);
			setError(err instanceof Error ? err.message : 'Ошибка импорта файла');
			setParsedData(null);
		} finally {
			setIsLoading(false);
		}
	};

	const resetError = () => setError(null);

	return {
		isLoading,
		error,
		parsedData,
		handleFileImport,
		resetError,
	};
};