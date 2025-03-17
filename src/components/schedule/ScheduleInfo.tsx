// src/components/schedule/ScheduleInfo.tsx
'use client';

import { useState, useEffect } from 'react';
import {
	Paper,
	Box,
	Typography,
	Chip,
	alpha,
	Tooltip,
	CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdateIcon from '@mui/icons-material/Update';
import EventIcon from '@mui/icons-material/Event';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ScheduleInfoProps {
	loadedDataInfo: string | null;
	lastUpdate: Date | null;
	isLoading: boolean;
	needsUpdate: boolean;
	onUpdate: () => void;
}

export const ScheduleInfo = ({
	loadedDataInfo,
	lastUpdate,
	isLoading,
	needsUpdate,
	onUpdate
}: ScheduleInfoProps) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Форматируем время последнего обновления
	const formatLastUpdate = (date: Date | null) => {
		if (!date || !mounted) return 'Нет данных';

		try {
			return formatDistanceToNow(date, {
				addSuffix: true,
				locale: ru
			});
		} catch (error) {
			console.error('Ошибка форматирования даты:', error);
			return 'Ошибка даты';
		}
	};

	if (!mounted) return null;

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				mb: 3,
				background: alpha('#1E293B', 0.6),
				backdropFilter: 'blur(20px)',
				borderRadius: 2,
				border: '1px solid rgba(59, 130, 246, 0.2)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				flexWrap: 'wrap',
				gap: 2
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				<EventIcon color="primary" />
				<Box>
					<Typography variant="body1">
						{loadedDataInfo ?
							`Загружено расписание: ${loadedDataInfo}` :
							'Расписание успешно загружено'}
					</Typography>
					{lastUpdate && (
						<Typography variant="caption" color="text.secondary">
							Последнее обновление: {formatLastUpdate(lastUpdate)}
						</Typography>
					)}
				</Box>
			</Box>

			{/* Индикатор состояния данных */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				{isLoading ? (
					<Chip
						icon={<CircularProgress size={16} />}
						label="Синхронизация..."
						color="info"
						size="small"
					/>
				) : needsUpdate ? (
					<Tooltip title="Обновить данные">
						<Chip
							icon={<UpdateIcon fontSize="small" />}
							label="Обновить"
							color="primary"
							size="small"
							clickable
							onClick={onUpdate}
						/>
					</Tooltip>
				) : (
					<Chip
						icon={<CheckCircleIcon fontSize="small" />}
						label="Актуально"
						color="success"
						size="small"
						variant="outlined"
					/>
				)}
			</Box>
		</Paper>
	);
};