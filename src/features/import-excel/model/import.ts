import * as XLSX from 'xlsx';
import { ExcelData, ScheduleItem } from './types';

export const parseExcelFile = async (file: File): Promise<ExcelData> => {
	const buffer = await file.arrayBuffer();
	const workbook = XLSX.read(buffer, { type: 'array' });

	// Логика парсинга Excel
	return {
		groups: [],
		schedule: []
	};
};