'use client'

import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Group } from '@/lib/types/shedule';

interface CourseSelectorProps {
	groups: Group[];
	selectedCourse: string | null;
	onCourseChange: (courseKey: string) => void;
	disabled?: boolean;
}

export const CourseSelector = ({
	groups,
	selectedCourse,
	onCourseChange,
	disabled
}: CourseSelectorProps) => {
	const courseGroups = groups.reduce((acc, group) => {
		const key = `${group.course}(${group.subgroup})`;
		if (!acc[key]) {
			acc[key] = {
				courseNumber: group.course,
				subgroup: group.subgroup,
				label: `${group.course} курс(${group.subgroup})`
			};
		}
		return acc;
	}, {} as Record<string, { courseNumber: number; subgroup: number; label: string; }>);

	const sortedCourses = Object.entries(courseGroups)
		.sort(([keyA, a], [keyB, b]) => {
			if (a.courseNumber === b.courseNumber) {
				return a.subgroup - b.subgroup;
			}
			return a.courseNumber - b.courseNumber;
		});

	return (
		<FormControl fullWidth>
			<InputLabel>Курс</InputLabel>
			<Select
				value={selectedCourse || ''}
				label="Курс"
				onChange={(e) => onCourseChange(e.target.value)}
				disabled={disabled}
			>
				<MenuItem value="">
					<em>Выберите курс</em>
				</MenuItem>
				{sortedCourses.map(([key, course]) => (
					<MenuItem key={key} value={key}>
						{course.label}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};