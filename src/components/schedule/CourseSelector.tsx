'use client';
import React, { useEffect, useState } from 'react';
import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Typography,
	Box,
	IconButton,
	SelectChangeEvent,
	Tooltip
} from '@mui/material';
import { Check, CheckCircleOutline } from '@mui/icons-material';
import { useFavorites } from '@/lib/hooks/useFavorites';

interface CourseSelectorProps {
	groups: any[];
	selectedCourse: string | null;
	onCourseChange: (courseKey: string) => void;
	disabled?: boolean;
}

export function CourseSelector({
	groups,
	selectedCourse,
	onCourseChange,
	disabled = false
}: CourseSelectorProps) {
	const [mounted, setMounted] = useState(false);
	const { defaultCourse, setDefaultCourse } = useFavorites();

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted && !selectedCourse && defaultCourse && !disabled) {
			onCourseChange(defaultCourse);
		}
	}, [mounted, selectedCourse, defaultCourse, disabled, onCourseChange]);

	const uniqueCourses = React.useMemo(() => {
		const courses = new Set<string>();

		groups.forEach(group => {
			const courseKey = `${group.course}(${group.subgroup})`;
			courses.add(courseKey);
		});

		return Array.from(courses).sort((a, b) => {
			const [aCourse, aSubgroup] = a.replace(')', '').split('(');
			const [bCourse, bSubgroup] = b.replace(')', '').split('(');

			const aCourseNum = parseInt(aCourse);
			const bCourseNum = parseInt(bCourse);

			if (aCourseNum !== bCourseNum) {
				return aCourseNum - bCourseNum;
			}

			return parseInt(aSubgroup) - parseInt(bSubgroup);
		});
	}, [groups]);

	const handleChange = (event: SelectChangeEvent) => {
		onCourseChange(event.target.value);
	};

	const setAsDefault = (courseKey: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setDefaultCourse(courseKey);
	};

	return (
		<FormControl fullWidth disabled={disabled}>
			<InputLabel id="course-select-label">Выберите курс</InputLabel>
			<Select
				labelId="course-select-label"
				id="course-select"
				value={selectedCourse || ''}
				label="Выберите курс"
				onChange={handleChange}
			>
				{uniqueCourses.length === 0 ? (
					<MenuItem value="" disabled>
						<Typography color="text.secondary">
							Нет доступных курсов
						</Typography>
					</MenuItem>
				) : (
					uniqueCourses.map((courseKey) => {
						const isDefault = courseKey === defaultCourse;
						const [course, subgroup] = courseKey.replace(')', '').split('(');

						return (
							<MenuItem key={courseKey} value={courseKey}>
								<Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
									<Typography>
										{course} курс (Подгруппа {subgroup})
										{mounted && isDefault && (
											<Typography
												component="span"
												variant="caption"
												color="primary.main"
												sx={{ ml: 1 }}
											>
												(По умолчанию)
											</Typography>
										)}
									</Typography>
									{mounted && (
										<Tooltip title={isDefault ? "Установлен по умолчанию" : "Установить по умолчанию"}>
											<IconButton
												size="small"
												onClick={(e) => setAsDefault(courseKey, e)}
												sx={{ ml: 1 }}
												color={isDefault ? "primary" : "default"}
											>
												{isDefault ? (
													<CheckCircleOutline fontSize="small" />
												) : (
													<Check fontSize="small" />
												)}
											</IconButton>
										</Tooltip>
									)}
								</Box>
							</MenuItem>
						);
					})
				)}
			</Select>
		</FormControl>
	);
}

export default CourseSelector;