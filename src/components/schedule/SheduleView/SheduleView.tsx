'use client'

import { useState } from 'react';
import {
	Box,
	Button,
	Stack,
	Typography,
	Paper,
	alpha,
	ButtonGroup,
	Fade,
	Divider
} from '@mui/material';
import {
	Today as TodayIcon,
	AccessTime as TimeIcon,
	Room as RoomIcon,
	Person as PersonIcon
} from '@mui/icons-material';

// Типы
interface ScheduleViewProps {
	group: string;
	schedule: ScheduleDay[];
}

interface ScheduleDay {
	id: string;
	name: string;
	shortName: string;
	lessons: Lesson[];
}

interface Lesson {
	id: string;
	time: string;
	subject: string;
	teacher: string;
	room: string;
	type: 'LECTURE' | 'PRACTICE' | 'LAB' | 'OTHER';
}

// Константы
const DAYS: ScheduleDay[] = [
	{ id: '1', name: 'Понедельник', shortName: 'ПН', lessons: [] },
	{ id: '2', name: 'Вторник', shortName: 'ВТ', lessons: [] },
	{ id: '3', name: 'Среда', shortName: 'СР', lessons: [] },
	{ id: '4', name: 'Четверг', shortName: 'ЧТ', lessons: [] },
	{ id: '5', name: 'Пятница', shortName: 'ПТ', lessons: [] },
	{ id: '6', name: 'Суббота', shortName: 'СБ', lessons: [] },
];

export const ScheduleView = ({ group, schedule }: ScheduleViewProps) => {
	const [selectedDay, setSelectedDay] = useState(DAYS[0].id);

	const currentDaySchedule = schedule.find(day => day.id === selectedDay) ?? DAYS[0];

	return (
		<Stack spacing={3}>
			{/* Days Navigation */}
			<Box
				sx={{
					overflowX: 'auto',
					pb: 1,
					'::-webkit-scrollbar': {
						height: 6,
					},
					'::-webkit-scrollbar-track': {
						background: alpha('#1E293B', 0.3),
						borderRadius: 3,
					},
					'::-webkit-scrollbar-thumb': {
						background: alpha('#3B82F6', 0.5),
						borderRadius: 3,
						'&:hover': {
							background: alpha('#3B82F6', 0.7),
						},
					},
				}}
			>
				<ButtonGroup
					variant="outlined"
					sx={{
						minWidth: 'fit-content',
					}}
				>
					{DAYS.map((day) => (
						<Button
							key={day.id}
							onClick={() => setSelectedDay(day.id)}
							sx={{
								px: 3,
								backgroundColor: selectedDay === day.id ?
									alpha('#3B82F6', 0.1) : 'transparent',
								borderColor: selectedDay === day.id ?
									'#3B82F6' : alpha('#94A3B8', 0.2),
								'&:hover': {
									borderColor: '#3B82F6',
									backgroundColor: alpha('#3B82F6', 0.05),
								},
							}}
						>
							<Stack alignItems="center" spacing={0.5}>
								<Typography variant="caption" color="text.secondary">
									{day.shortName}
								</Typography>
								<Typography
									variant="body2"
									color={selectedDay === day.id ? 'primary.main' : 'text.primary'}
								>
									{day.name}
								</Typography>
							</Stack>
						</Button>
					))}
				</ButtonGroup>
			</Box>

			{/* Schedule Grid */}
			<Stack spacing={2}>
				{currentDaySchedule.lessons.length > 0 ? (
					currentDaySchedule.lessons.map((lesson, index) => (
						<Fade in timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
							<Paper
								key={lesson.id}
								sx={{
									p: 3,
									background: alpha('#1E293B', 0.6),
									backdropFilter: 'blur(20px)',
									transition: 'transform 0.2s, box-shadow 0.2s',
									'&:hover': {
										transform: 'translateY(-2px)',
										boxShadow: `0 8px 24px ${alpha('#000', 0.2)}`,
									},
								}}
							>
								<Stack spacing={2}>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
										<Typography variant="h6" sx={{ color: 'primary.light' }}>
											{lesson.subject}
										</Typography>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 1,
												color: 'text.secondary',
											}}
										>
											<TimeIcon fontSize="small" />
											<Typography variant="body2">
												{lesson.time}
											</Typography>
										</Box>
									</Box>

									<Divider sx={{ borderColor: alpha('#94A3B8', 0.1) }} />

									<Stack spacing={1.5}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
											<Typography variant="body2" color="text.secondary">
												{lesson.teacher}
											</Typography>
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<RoomIcon fontSize="small" sx={{ color: 'text.secondary' }} />
											<Typography variant="body2" color="text.secondary">
												{lesson.room}
											</Typography>
										</Box>
									</Stack>
								</Stack>
							</Paper>
						</Fade>
					))
				) : (
					<Box
						sx={{
							textAlign: 'center',
							py: 8,
							background: alpha('#1E293B', 0.3),
							borderRadius: 4,
							border: '2px dashed rgba(148, 163, 184, 0.1)',
						}}
					>
						<TodayIcon
							sx={{
								fontSize: 48,
								color: 'text.secondary',
								mb: 2,
							}}
						/>
						<Typography
							variant="h6"
							color="text.secondary"
							gutterBottom
						>
							Нет занятий
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							В этот день занятия не запланированы
						</Typography>
					</Box>
				)}
			</Stack>
		</Stack>
	);
};