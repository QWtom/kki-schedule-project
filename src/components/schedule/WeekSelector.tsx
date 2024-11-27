'use client'

import { useEffect, useMemo, useState } from 'react';
import {
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Box,
	Typography,
	Chip,
	SelectChangeEvent,
	alpha,
	Tooltip,
	ListSubheader
} from '@mui/material';
import { WeekSchedule } from '@/lib/types/shedule';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

type WeekStatus = 'fresh' | 'normal' | 'stale';

interface WeekSelectorProps {
	weeks: WeekSchedule[];
	activeWeekId: string | null;
	onWeekChange: (weekId: string) => void;
	disabled?: boolean;
}

interface WeekWithStatus extends WeekSchedule {
	status: WeekStatus;
}
export const WeekSelector = ({
	weeks,
	activeWeekId,
	onWeekChange,
	disabled = false
}: WeekSelectorProps) => {
	const [mounted, setMounted] = useState(false);
	const weeksWithStatus = useMemo<WeekWithStatus[]>(() => {
		return weeks.map(week => {
			const ageInDays = (Date.now() - week.uploadDate) / (1000 * 60 * 60 * 24);
			const status: WeekStatus =
				ageInDays <= 2 ? 'fresh' :
					ageInDays <= 5 ? 'normal' :
						'stale';

			return { ...week, status };
		});
	}, [weeks]);

	const groupedWeeks = useMemo(() => {
		return weeksWithStatus.reduce((acc, week) => {
			const date = new Date(week.uploadDate);
			const month = date.toLocaleString('ru-RU', { month: 'long' });
			if (!acc[month]) acc[month] = [];
			acc[month].push(week);
			return acc;
		}, {} as Record<string, WeekWithStatus[]>);
	}, [weeksWithStatus]);

	const getStatusChip = (status: WeekStatus) => {
		const statusConfig = {
			fresh: {
				label: 'Новое',
				color: 'success' as const,
				tooltip: 'Расписание актуально. Последнее обновление было менее двух дней назад.'
			},
			normal: {
				label: 'Актуально',
				color: 'primary' as const,
				tooltip: 'Расписание относительно свежее. Прошло от 2 до 5 дней с момента последнего обновления.'
			},
			stale: {
				label: 'Устаревает',
				color: 'warning' as const,
				tooltip: 'Расписание может быть неактуальным, так как прошло более 5 дней с момента последнего обновления.'
			}
		};

		const config = statusConfig[status];
		return (
			<Tooltip
				title={config.tooltip}
				arrow
				placement="top"
				enterDelay={200}
				leaveDelay={200}
			>
				<Chip
					label={config.label}
					color={config.color}
					size="small"
					sx={{
						ml: 1,
						transition: 'transform 0.2s',
						'&:hover': {
							transform: 'scale(1.05)'
						}
					}}
				/>
			</Tooltip>
		);
	};
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const handleChange = (event: SelectChangeEvent<string>) => {
		onWeekChange(event.target.value);
	};

	const formatUploadDate = (timestamp: number) => {
		return formatDistanceToNow(timestamp, {
			addSuffix: true,
			locale: ru
		});
	};

	const isCurrentWeek = (weekName: string) => {
		const currentDate = new Date();
		const currentWeek = Math.ceil(currentDate.getDate() / 7);
		return weekName.includes(`${currentWeek} неделя`);
	};


	return (
		<FormControl fullWidth disabled={disabled}>
			<InputLabel>Неделя расписания</InputLabel>
			<Select
				value={activeWeekId || ''}
				label="Неделя расписания"
				onChange={handleChange}
				MenuProps={{
					PaperProps: {
						sx: {
							maxHeight: 300,
							background: alpha('#1E293B', 0.95),
							backdropFilter: 'blur(10px)'
						}
					}
				}}
			>
				{weeksWithStatus.length === 0 ? (
					<MenuItem disabled>
						<Typography color="text.secondary">
							Нет доступных расписаний
						</Typography>
					</MenuItem>
				) : (
					Object.entries(groupedWeeks).map(([month, monthWeeks]) => [
						<ListSubheader
							key={month}
							sx={{
								background: alpha('#1E293B', 0.8),
								color: 'text.secondary',
								lineHeight: '32px'
							}}
						>
							{month}
						</ListSubheader>,
						monthWeeks.map(({ weekId, weekName, uploadDate, status }) => (
							<MenuItem
								key={weekId}
								value={weekId}
								sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'flex-start',
									py: 1,
									...(isCurrentWeek(weekName) && {
										background: alpha('#3B82F6', 0.1),
										'&:hover': {
											background: alpha('#3B82F6', 0.15),
										}
									})
								}}
							>
								<Box sx={{
									display: 'flex',
									alignItems: 'center',
									width: '100%'
								}}>
									<Typography>
										{weekName}
										{isCurrentWeek(weekName) && (
											<Typography
												component="span"
												color="primary.main"
												sx={{ ml: 1, fontSize: '0.75em' }}
											>
												(текущая)
											</Typography>
										)}
									</Typography>
									{getStatusChip(status)}
								</Box>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ mt: 0.5 }}
								>
									Загружено {formatUploadDate(uploadDate)}
								</Typography>
							</MenuItem>
						))
					])
				)}
			</Select>
		</FormControl>
	);
};