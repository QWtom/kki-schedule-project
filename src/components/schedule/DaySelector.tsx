'use client'

import { ButtonGroup, Button, Stack, Typography, Box, alpha, useTheme, useMediaQuery } from '@mui/material';

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
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	return (
		<Box
			sx={{
				overflowX: 'auto',
				pb: 1,
				msOverflowStyle: 'none', // Для IE и Edge
				scrollbarWidth: 'thin', // Для Firefox
				'::-webkit-scrollbar': {
					height: 6,
					display: isMobile ? 'none' : 'block', // Скрываем скроллбар на мобильных
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
					gap: isMobile ? 1 : 0 // Добавляем отступы между кнопками на мобильных
				}}
			>
				{DAYS.map((day) => (
					<Button
						key={day.id}
						onClick={() => onDaySelect(day.id)}
						sx={{
							px: isMobile ? 2 : 3,
							minWidth: isMobile ? 'auto' : 120,
							backgroundColor: selectedDay === day.id ?
								alpha('#3B82F6', 0.1) : 'transparent',
							borderColor: selectedDay === day.id ?
								'#3B82F6' : alpha('#94A3B8', 0.2),
							'&:hover': {
								borderColor: '#3B82F6',
								backgroundColor: alpha('#3B82F6', 0.05),
							},
							...(isMobile && {
								borderRadius: '8px !important', // Принудительно задаем скругление для мобильных
								border: `1px solid ${selectedDay === day.id ? '#3B82F6' : alpha('#94A3B8', 0.2)}`,
								'&:not(:last-of-type)': {
									marginRight: 0
								}
							})
						}}
					>
						<Stack alignItems="center" spacing={0.5}>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ display: isMobile ? 'block' : 'none' }}
							>
								{day.shortName}
							</Typography>
							<Typography
								variant={isMobile ? "caption" : "body2"}
								color={selectedDay === day.id ? 'primary.main' : 'text.primary'}
								sx={{ display: isMobile ? 'none' : 'block' }}
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