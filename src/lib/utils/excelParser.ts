import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { ParsedSchedule, DAYS_OF_WEEK } from '@/lib/types/shedule';
import { parseTimeSlot } from '@/shared/lib/parseTimeSlot';
import { parseSubjectTeacher } from '@/shared/lib/parseSubjectTeacher';
import { detectLessonType } from '@/shared/lib/detectLessonType';
import { parseCourseInfo } from '@/shared/lib/parseCourseInfo';

export const parseExcelFile = async (file: File): Promise<ParsedSchedule> => {
	const data: ParsedSchedule = {
		groups: [],
		schedule: {},
	};

	try {
		const buffer = await file.arrayBuffer();
		const workbook = XLSX.read(buffer, { type: 'array' });

		for (const sheetName of workbook.SheetNames) {
			console.log(`Processing sheet: ${sheetName}`);

			const courseInfo = parseCourseInfo(sheetName);
			if (!courseInfo) {
				console.warn(`Invalid sheet name format: ${sheetName}, skipping...`);
				continue;
			}

			const worksheet = workbook.Sheets[sheetName];
			const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
				header: 1,
				defval: '',
				blankrows: false,
				raw: false
			});

			let groupsRowIndex = -1;
			for (let i = 0; i < Math.min(20, jsonData.length); i++) {
				const row = jsonData[i];
				if (row && row[1] &&
					row[1].toString().trim().toLowerCase() === 'время') {
					console.log('Found time row at index:', i);
					groupsRowIndex = i;
					break;
				}
			}

			if (groupsRowIndex === -1) {
				console.warn('No time row found in sheet');
				continue;
			}

			const groupsRow = jsonData[groupsRowIndex];
			for (let i = 2; i < groupsRow.length; i += 2) {
				const groupName = groupsRow[i];
				if (groupName && typeof groupName === 'string' && groupName.trim()) {
					const groupId = uuidv4();
					console.log(`Found group: ${groupName.trim()}`);
					data.groups.push({
						id: groupId,
						name: groupName.trim(),
						course: courseInfo.courseNumber,
						subgroup: courseInfo.subgroup
					});
					data.schedule[groupId] = {};
				}
			}

			let currentDay = '';
			for (let rowIndex = groupsRowIndex + 1; rowIndex < jsonData.length; rowIndex++) {
				const row = jsonData[rowIndex];
				if (!row || !row.length) continue;

				const firstCell = (row[0] || '').toString().trim().toUpperCase();

				if (DAYS_OF_WEEK.some(d => d.name === firstCell)) {
					currentDay = firstCell;
					console.log(`Processing day: ${currentDay}`);
					continue;
				}

				const timeCell = row[1]?.toString().trim();
				console.log(`Processing time slot: ${timeCell}`);

				if (!timeCell) continue;

				const timeSlot = parseTimeSlot(timeCell);
				if (!timeSlot) {
					console.warn(`Invalid time slot: ${timeCell}`);
					continue;
				}

				const groupsForCurrentSheet = data.groups.filter(g =>
					g.course === courseInfo.courseNumber &&
					g.subgroup === courseInfo.subgroup
				);

				groupsForCurrentSheet.forEach((group, index) => {
					const subjectIndex = 2 + (index * 2);
					const roomIndex = subjectIndex + 1;

					const subjectCell = row[subjectIndex]?.toString().trim();
					const roomCell = row[roomIndex]?.toString().trim();

					if (subjectCell) {
						if (!data.schedule[group.id][currentDay]) {
							data.schedule[group.id][currentDay] = [];
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

						console.log(`Adding lesson: ${JSON.stringify(lessonEntry)}`);
						data.schedule[group.id][currentDay].push(lessonEntry);
					}
				});
			}
		}

		return data;

	} catch (error) {
		console.error('Error parsing Excel file:', error);
		throw error;
	}
};
