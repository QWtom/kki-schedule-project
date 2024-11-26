// lib/constants/schedule.ts
export const LESSON_TYPES = {
	LECTURE: 'LECTURE',
	PRACTICE: 'PRACTICE',
	LAB: 'LAB',
	OTHER: 'OTHER',
} as const;

export const LESSON_TYPE_LABELS = {
	[LESSON_TYPES.LECTURE]: 'Лекция',
	[LESSON_TYPES.PRACTICE]: 'Практика',
	[LESSON_TYPES.LAB]: 'Лабораторная',
	[LESSON_TYPES.OTHER]: 'Другое',
} as const;