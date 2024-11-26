export interface Schedule {
	id: string;
	group: string;
	weekDay: WeekDay;
	lessons: Lesson[];
}

export interface Lesson {
	id: string;
	subject: string;
	teacher: string;
	room: string;
	timeStart: string;
	timeEnd: string;
	type: LessonType;
}

export enum WeekDay {
	MONDAY = 'MONDAY',
	TUESDAY = 'TUESDAY',
	WEDNESDAY = 'WEDNESDAY',
	THURSDAY = 'THURSDAY',
	FRIDAY = 'FRIDAY',
	SATURDAY = 'SATURDAY'
}

export enum LessonType {
	LECTURE = 'LECTURE',
	PRACTICE = 'PRACTICE',
	LAB = 'LAB',
	OTHER = 'OTHER'
}