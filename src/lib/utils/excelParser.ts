import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { ParsedSchedule, Lesson, DAYS_OF_WEEK, LessonType } from '@/lib/types/shedule';

const COURSE_MARKER = 'курс';

// Нормализация названий дней недели
const normalizeDayName = (day: string): string => {
	const normalized = day.trim().toUpperCase()
		.replace(/\s+/g, ' ')
		.replace('СУББОТА ', 'СУББОТА')
		.replace('ПЯТНИЦА ', 'ПЯТНИЦА');
	return normalized;
};

// Улучшенный парсинг времени
const parseTimeSlot = (timeString: string) => {
	// Очищаем строку от лишних пробелов
	const cleanTime = timeString
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\s*-\s*/g, '-');

	// Извлекаем время с помощью регулярного выражения
	const timeMatch = cleanTime.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);

	if (!timeMatch) {
		console.warn('Invalid time format:', timeString);
		return null;
	}

	const [_, start, end] = timeMatch;

	// Форматируем время
	const formatTime = (time: string) => {
		const [hours, minutes] = time.split(':');
		return `${hours.padStart(2, '0')}:${minutes}`;
	};

	return {
		start: formatTime(start),
		end: formatTime(end),
		formatted: `${formatTime(start)} - ${formatTime(end)}`
	};
};

// Парсинг предмета и преподавателя
const parseSubjectTeacher = (cellValue: string): { subject: string; teacher: string } => {
	if (!cellValue || typeof cellValue !== 'string') {
		return { subject: '', teacher: '' };
	}

	const parts = cellValue.split('/').map(part => part.trim());
	if (parts.length >= 2) {
		return {
			subject: parts[0],
			teacher: parts.slice(1).join('/').replace(/\s+/g, ' ')
		};
	}

	return { subject: cellValue.trim(), teacher: '' };
};

// Определение типа занятия
const detectLessonType = (subject: string): LessonType => {
	const lowerSubject = subject.toLowerCase();

	if (lowerSubject.includes('практика') || lowerSubject.includes('практ.')) return 'PRACTICE';
	if (lowerSubject.includes('лаб') || lowerSubject.includes('лабораторная')) return 'LAB';
	if (lowerSubject.includes('лекция') || lowerSubject.includes('лек.')) return 'LECTURE';

	// Определяем тип по названию предмета
	const practiceSubjects = [
		'физическая культура',
		'живопись',
		'материаловедение',
		'учебная практика',
		'исполнения изделий'
	];

	const labSubjects = [
		'информатика',
		'проектирование',
		'моделирование'
	];

	if (practiceSubjects.some(s => lowerSubject.includes(s))) return 'PRACTICE';
	if (labSubjects.some(s => lowerSubject.includes(s))) return 'LAB';

	return 'LECTURE';
};

export const parseExcelFile = async (file: File): Promise<ParsedSchedule> => {
	console.log('Starting parse file:', file.name);

	const data: ParsedSchedule = {
		groups: [],
		schedule: {},
	};

	try {
		const buffer = await file.arrayBuffer();
		const workbook = XLSX.read(buffer, { type: 'array' });
		const worksheet = workbook.Sheets[workbook.SheetNames[0]];
		const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
			header: 1,
			defval: '',
			blankrows: false
		});

		console.log('Raw data length:', jsonData.length);

		// Поиск курса с улучшенной обработкой
		let courseRowIndex = -1;
		let courseNumber = 1;

		for (let i = 0; i < jsonData.length; i++) {
			const row = jsonData[i];
			if (!row || !row[0]) continue;

			const firstCell = row[0].toString().trim();
			console.log('Checking row:', i, 'First cell:', firstCell);

			if (firstCell.includes('курс')) {
				courseRowIndex = i;
				// Извлекаем номер курса из строки (например, "1 курс" -> 1)
				const match = firstCell.match(/(\d+)\s*курс/);
				if (match) {
					courseNumber = parseInt(match[1]);
				}
				console.log('Found course:', courseNumber, 'at row:', courseRowIndex);
				break;
			}
		}

		if (courseRowIndex === -1) {
			throw new Error('Не удалось найти информацию о курсе');
		}

		// Ищем строку с группами (пропускаем строку с датами)
		const groupsRowIndex = courseRowIndex + 2; // +2 чтобы пропустить дату
		const groupsRow = jsonData[groupsRowIndex];
		console.log('Groups row:', groupsRow);

		// Парсим группы
		for (let i = 2; i < groupsRow.length; i += 2) {
			const groupName = groupsRow[i];
			if (groupName && typeof groupName === 'string' && groupName.trim()) {
				const groupId = uuidv4();
				data.groups.push({
					id: groupId,
					name: groupName.trim(),
					course: courseNumber
				});
				data.schedule[groupId] = {};
				console.log('Added group:', { name: groupName.trim(), course: courseNumber, columnIndex: i });
			}
		}

		// Парсинг расписания
		let currentDay = '';
		for (let rowIndex = groupsRowIndex + 1; rowIndex < jsonData.length; rowIndex++) {
			const row = jsonData[rowIndex];
			if (!row || !row.length) continue;

			const firstCell = (row[0] || '').toString().trim().toUpperCase();
			if (DAYS_OF_WEEK.some(d => d.name === firstCell)) {
				currentDay = firstCell;
				console.log('Processing day:', currentDay);
				continue;
			}

			// Проверяем время
			const timeCell = row[1]?.toString().trim();
			if (!timeCell || !timeCell.includes('-')) continue;

			const timeSlot = parseTimeSlot(timeCell);
			if (!timeSlot) continue;

			// Обрабатываем предметы для каждой группы
			data.groups.forEach((group, index) => {
				const subjectIndex = 2 + (index * 2);
				const roomIndex = subjectIndex + 1;

				const subjectCell = row[subjectIndex]?.toString().trim();
				const roomCell = row[roomIndex]?.toString().trim();

				if (subjectCell) {
					if (!data.schedule[group.id][currentDay]) {
						data.schedule[group.id][currentDay] = [];
					}

					const { subject, teacher } = parseSubjectTeacher(subjectCell);

					data.schedule[group.id][currentDay].push({
						id: uuidv4(),
						subject,
						teacher,
						room: roomCell || '',
						time: timeSlot.formatted,
						timeSlot: {
							start: timeSlot.start,
							end: timeSlot.end
						},
						type: detectLessonType(subject)
					});

					console.log(`Added lesson for ${group.name}:`, { subject, teacher, room: roomCell });
				}
			});
		}

		console.log('Final parsed data:', data);
		return data;

	} catch (error) {
		console.error('Error parsing Excel file:', error);
		throw error;
	}
};


export const getGroupDaySchedule = (
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

// Также добавим вспомогательные функции для работы с расписанием
export const getCurrentDayId = (): string => {
	const today = new Date().getDay();
	// Преобразуем день недели в наш формат (1-6)
	// В JavaScript воскресенье = 0, поэтому нужно преобразование
	return String(today === 0 ? 6 : today);
};

export const sortLessonsByTime = (lessons: Lesson[]): Lesson[] => {
	return [...lessons].sort((a, b) => {
		const timeA = a.timeSlot.start.replace(':', '');
		const timeB = b.timeSlot.start.replace(':', '');
		return Number(timeA) - Number(timeB);
	});
};

// Функция для фильтрации расписания по неделе
export const getWeekSchedule = (
	parsedSchedule: ParsedSchedule,
	groupId: string
): Record<string, Lesson[]> => {
	const weekSchedule: Record<string, Lesson[]> = {};

	DAYS_OF_WEEK.forEach(day => {
		weekSchedule[day.id] = sortLessonsByTime(
			parsedSchedule.schedule[groupId]?.[day.name] || []
		);
	});

	return weekSchedule;
};

// Функция для проверки наличия занятий в определенный день
export const hasLessonsOnDay = (
	parsedSchedule: ParsedSchedule,
	groupId: string,
	dayId: string
): boolean => {
	const lessons = getGroupDaySchedule(parsedSchedule, groupId, dayId);
	return lessons.length > 0;
};