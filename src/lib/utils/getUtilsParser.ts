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

// const sortLessonsByTime = (lessons: Lesson[]): Lesson[] => {
// 	return [...lessons].sort((a, b) => {
// 		const timeA = a.timeSlot.start.replace(':', '');
// 		const timeB = b.timeSlot.start.replace(':', '');
// 		return Number(timeA) - Number(timeB);
// 	});
// };

// const getWeekSchedule = (
// 	parsedSchedule: ParsedSchedule,
// 	groupId: string
// ): Record<string, Lesson[]> => {
// 	const weekSchedule: Record<string, Lesson[]> = {};

// 	DAYS_OF_WEEK.forEach(day => {
// 		weekSchedule[day.id] = sortLessonsByTime(
// 			parsedSchedule.schedule[groupId]?.[day.name] || []
// 		);
// 	});

// 	return weekSchedule;
// };

// const hasLessonsOnDay = (
// 	parsedSchedule: ParsedSchedule,
// 	groupId: string,
// 	dayId: string
// ): boolean => {
// 	const lessons = getGroupDaySchedule(parsedSchedule, groupId, dayId);
// 	return lessons.length > 0;
// };

export { getGroupDaySchedule, getCurrentDayId }