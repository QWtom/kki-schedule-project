import * as XLSX from 'xlsx';
import { ExcelData } from './types';

export const parseExcelFile = async (file: File): Promise<ExcelData> => {
	const buffer = await file.arrayBuffer();
	const workbook = XLSX.read(buffer, { type: 'array' });

	return {
		groups: [],
		schedule: []
	};
};