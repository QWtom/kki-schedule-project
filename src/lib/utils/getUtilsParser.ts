import { DAYS_OF_WEEK, Lesson, ParsedSchedule } from "@/lib/types/shedule";

const getGroupDaySchedule = (
	parsedSchedule: ParsedSchedule,
	groupId: string,
	dayId: string
): Lesson[] => {
	const dayMap: Record<string, string> = {
		'1': 'ПОНЕДЕЛЬНИК',
		'2': 'ВТОРНИК',
		'3': 'СРЕДА',
		'4': 'ЧЕТВЕРГ',
		'5': 'ПЯТНИЦА',
		'6': 'СУББОТА'
	};

	const dayName = dayMap[dayId];
	if (!dayName) return [];

	return parsedSchedule.schedule[groupId]?.[dayName] || [];
};


const getCurrentDayId = (): string => {
	const today = new Date().getDay();
	return String(today === 0 ? 6 : today);
};

export { getGroupDaySchedule, getCurrentDayId }