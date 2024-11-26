'use client'

import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Group } from '@/lib/types/shedule';

interface CourseSelectorProps {
	groups: Group[];
	selectedCourse: number | null;
	onCourseChange: (course: number) => void;
	disabled?: boolean;
}

export const CourseSelector = ({ groups, selectedCourse, onCourseChange, disabled }: CourseSelectorProps) => {
	// Получаем уникальные курсы
	const courses = Array.from(new Set(groups.map(g => g.course))).sort((a, b) => a - b);

	return (
		<FormControl fullWidth>
			<InputLabel>Курс</InputLabel>
			<Select
				value={selectedCourse || ''}
				label="Курс"
				onChange={(e) => onCourseChange(Number(e.target.value))}
				disabled={disabled || courses.length === 0}
			>
				<MenuItem value="">
					<em>Выберите курс</em>
				</MenuItem>
				{courses.map((course) => (
					<MenuItem key={course} value={course}>
						{course} курс
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};