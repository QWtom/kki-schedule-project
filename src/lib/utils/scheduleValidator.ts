import { ParsedSchedule } from '@/lib/types/shedule';

export const validateScheduleData = (data: ParsedSchedule): boolean => {
	// Проверяем наличие групп
	if (!Array.isArray(data.groups) || data.groups.length === 0) {
		return false;
	}

	// Проверяем структуру расписания
	if (typeof data.schedule !== 'object' || data.schedule === null) {
		return false;
	}

	// Проверяем соответствие групп и расписания
	for (const group of data.groups) {
		if (!data.schedule[group.id]) {
			return false;
		}
	}

	return true;
};