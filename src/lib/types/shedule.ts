import { CacheMetadata } from "./cache";

// lib/types/schedule.ts
export type LessonType = 'LECTURE' | 'PRACTICE' | 'LAB' | 'OTHER';

export interface TimeSlot {
	start: string;
	end: string;
}

export interface Lesson {
	id: string;
	subject: string;
	teacher: string;
	room: string;
	time: string;
	timeSlot: TimeSlot;
	type: LessonType;
}

export interface Group {
	id: string;
	name: string;
	course: number;
}

export interface ParsedSchedule {
	groups: Group[];
	schedule: {
		[groupId: string]: {
			[dayId: string]: Lesson[];
		};
	};
}

export const DAYS_OF_WEEK = [
	{ id: '1', name: 'ПОНЕДЕЛЬНИК' },
	{ id: '2', name: 'ВТОРНИК' },
	{ id: '3', name: 'СРЕДА' },
	{ id: '4', name: 'ЧЕТВЕРГ' },
	{ id: '5', name: 'ПЯТНИЦА' },
	{ id: '6', name: 'СУББОТА' },
];

export interface Course {
	number: number;
	subgroup: number;
	name: string;
}

export interface Group {
	id: string;
	name: string;
	course: number;
	subgroup: number;
}

export interface WeekSchedule {
	weekId: string;
	weekName: string;
	uploadDate: number;
	schedule: ParsedSchedule;
}

export interface ScheduleCollection {
	activeWeekId: string | null;
	weeks: WeekSchedule[];
}