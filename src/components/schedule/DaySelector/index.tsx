// components/schedule/DaySelector/index.tsx
'use client'

import { ButtonGroup, Button, Stack, Typography, Box, alpha } from '@mui/material';

interface Day {
	id: string;
	name: string;
	shortName: string;
}

const DAYS: Day[] = [
	{ id: '1', name: 'Понедельник', shortName: 'ПН' },
	{ id: '2', name: 'Вторник', shortName: 'ВТ' },
	{ id: '3', name: 'Среда', shortName: 'СР' },
	{ id: '4', name: 'Четверг', shortName: 'ЧТ' },
	{ id: '5', name: 'Пятница', shortName: 'ПТ' },
	{ id: '6', name: 'Суббота', shortName: 'СБ' },
];

interface DaySelectorProps {
	selectedDay: string;
	onDaySelect: (dayId: string) => void;
}

export const DaySelector = ({ selectedDay, onDaySelect }: DaySelectorProps) => {
	return (
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
				sx={{ minWidth: 'fit-content' }}
			>
				{DAYS.map((day) => (
					<Button
						key={day.id}
						onClick={() => onDaySelect(day.id)}
						sx={{
							px: 3,
							minWidth: 120,
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
	);
};