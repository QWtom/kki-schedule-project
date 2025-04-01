
import { v4 as uuidv4 } from 'uuid';
import { ParsedSchedule } from '@/lib/types/shedule';
import { parseTimeSlot } from '@/shared/lib/parseTimeSlot';
import { parseSubjectTeacher } from '@/shared/lib/parseSubjectTeacher';
import { detectLessonType } from '@/shared/lib/detectLessonType';
import { parseCourseInfo } from '@/shared/lib/parseCourseInfo';

export const parseGoogleSheetData = (data: Record<string, any[]>): ParsedSchedule => {

	const result: ParsedSchedule = {
		groups: [],
		schedule: {},
	};

	if (!data.data) return result;

	Object.keys(data.data).forEach((sheetName: any) => {
		const courseInfo = parseCourseInfo(sheetName);
		if (!courseInfo) {
			console.warn(`Invalid sheet name format: ${sheetName}, skipping...`);
			return;
		}

		const sheetData = data.data[sheetName];
		if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
			console.warn(`Sheet ${sheetName} has no data, skipping...`);
			return;
		}

		let groupsRowIndex = -1;
		for (let i = 0; i < Math.min(20, sheetData.length); i++) {
			const row = sheetData[i];
			if (row && row[1] && row[1].toString().trim().toLowerCase() === 'время') {
				groupsRowIndex = i;
				break;
			}
		}

		if (groupsRowIndex === -1) {
			console.warn(`No time row found in sheet ${sheetName}`);
			return;
		}

		const groupsRow = sheetData[groupsRowIndex];
		for (let i = 2; i < groupsRow.length; i += 2) {
			const groupName = groupsRow[i];
			if (groupName && typeof groupName === 'string' && groupName.trim()) {
				const groupId = uuidv4();
				result.groups.push({
					id: groupId,
					name: groupName.trim(),
					course: courseInfo.courseNumber,
					subgroup: courseInfo.subgroup
				});
				result.schedule[groupId] = {};
			}
		}

		let currentDay = '';
		for (let rowIndex = groupsRowIndex + 1; rowIndex < sheetData.length; rowIndex++) {
			const row = sheetData[rowIndex];
			if (!row || !row.length) {
				continue;
			}

			const firstCell = (row[0] || '').toString().trim().toUpperCase();
			if (['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'].includes(firstCell)) {
				currentDay = firstCell;
			}

			const timeCell = row[1]?.toString().trim();
			if (!timeCell) {
				continue;
			}

			const timeSlot = parseTimeSlot(timeCell);
			if (!timeSlot) {
				console.warn(`Invalid time slot at row ${rowIndex}:`, timeCell);
				continue;
			}

			const groupsForCurrentSheet = result.groups.filter(g =>
				g.course === courseInfo.courseNumber &&
				g.subgroup === courseInfo.subgroup
			);

			groupsForCurrentSheet.forEach((group, index) => {
				const subjectIndex = 2 + (index * 2);
				const roomIndex = subjectIndex + 1;

				const subjectCell = row[subjectIndex]?.toString().trim();
				const roomCell = row[roomIndex]?.toString().trim();

				if (subjectCell) {
					if (!result.schedule[group.id][currentDay]) {
						result.schedule[group.id][currentDay] = [];
					}

					const { subject, teacher } = parseSubjectTeacher(subjectCell);

					const lessonEntry = {
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
					};

					result.schedule[group.id][currentDay].push(lessonEntry);
				}
			});
		}
	});

	return result;
};