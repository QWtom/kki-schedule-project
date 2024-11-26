import { LessonType } from "@/lib/types/shedule";

export const detectLessonType = (subject: string): LessonType => {
	const lowerSubject = subject.toLowerCase();

	if (lowerSubject.includes('практика') || lowerSubject.includes('практ.')) return 'PRACTICE';
	if (lowerSubject.includes('лаб') || lowerSubject.includes('лабораторная')) return 'LAB';
	if (lowerSubject.includes('лекция') || lowerSubject.includes('лек.')) return 'LECTURE';

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