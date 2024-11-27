import * as XLSX from 'xlsx';

interface ValidationResult {
	isValid: boolean;
	error?: string;
}

const validateSheetStructure = (worksheet: any): ValidationResult => {
	const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
		header: 1,
		defval: '',
		blankrows: false
	});

	if (!jsonData || jsonData.length === 0) {
		return {
			isValid: false,
			error: 'Файл пуст или имеет неверный формат'
		};
	}

	let timeHeaderFound = false;
	for (let i = 0; i < Math.min(10, jsonData.length); i++) {
		if (jsonData[i].some((cell: any) => cell === 'Время')) {
			timeHeaderFound = true;
			break;
		}
	}

	if (!timeHeaderFound) {
		return {
			isValid: false,
			error: 'Не найден заголовок "Время" - возможно, это не файл расписания'
		};
	}

	const daysOfWeek = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'];
	let foundDays = 0;

	jsonData.forEach(row => {
		const firstCell = (row[0] || '').toString().trim().toUpperCase();
		if (daysOfWeek.includes(firstCell)) {
			foundDays++;
		}
	});

	if (foundDays === 0) {
		return {
			isValid: false,
			error: 'В файле не найдены дни недели'
		};
	}

	return { isValid: true };
};

export const validateScheduleExcel = async (file: File): Promise<ValidationResult> => {
	try {
		const fileName = file.name.toLowerCase();
		if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
			return {
				isValid: false,
				error: 'Поддерживаются только файлы Excel (.xlsx, .xls)'
			};
		}

		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			return {
				isValid: false,
				error: 'Размер файла превышает 5MB'
			};
		}

		const buffer = await file.arrayBuffer();
		const workbook = XLSX.read(buffer, { type: 'array' });

		if (workbook.SheetNames.length === 0) {
			return {
				isValid: false,
				error: 'Файл не содержит листов'
			};
		}

		for (const sheetName of workbook.SheetNames) {
			const worksheet = workbook.Sheets[sheetName];
			const sheetValidation = validateSheetStructure(worksheet);

			if (!sheetValidation.isValid) {
				return {
					isValid: false,
					error: `Ошибка в листе "${sheetName}": ${sheetValidation.error}`
				};
			}
		}

		return { isValid: true };
	} catch (error) {
		return {
			isValid: false,
			error: 'Ошибка при чтении файла. Убедитесь, что файл не поврежден'
		};
	}
};