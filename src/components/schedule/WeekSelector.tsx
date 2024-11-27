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
	alpha
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

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const handleChange = (event: SelectChangeEvent<string>) => {
		onWeekChange(event.target.value);
	};

	const getStatusChip = (status: WeekStatus) => {
		const statusConfig = {
			fresh: { label: 'Новое', color: 'success' as const },
			normal: { label: 'Актуально', color: 'primary' as const },
			stale: { label: 'Устаревает', color: 'warning' as const }
		};

		const config = statusConfig[status];
		return (
			<Chip
				label={config.label}
				color={config.color}
				size="small"
				sx={{ ml: 1 }}
			/>
		);
	};

	const formatUploadDate = (timestamp: number) => {
		return formatDistanceToNow(timestamp, {
			addSuffix: true,
			locale: ru
		});
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
				{weeksWithStatus.map(({ weekId, weekName, uploadDate, status }) => (
					<MenuItem
						key={weekId}
						value={weekId}
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							py: 1
						}}
					>
						<Box sx={{
							display: 'flex',
							alignItems: 'center',
							width: '100%'
						}}>
							<Typography>{weekName}</Typography>
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
				))}
			</Select>
		</FormControl>
	);
};