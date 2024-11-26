export interface ExcelData {
	groups: string[];
	schedule: ScheduleItem[];
}

export interface ScheduleItem {
	group: string;
	day: string;
	time: string;
	subject: string;
	room: string;
	teacher: string;
}