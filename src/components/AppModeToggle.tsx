'use client';

import React, { useEffect, useState } from 'react';
import { Box, FormControlLabel, Switch, Typography, Tooltip, alpha, Paper } from '@mui/material';
import { CloudOutlined, CloudOff } from '@mui/icons-material';
import { useAppMode } from '@/lib/hooks/useAppMode';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export const AppModeToggle = () => {
	const {
		isOnlineMode,
		isOfflineMode,
		isAutoSyncEnabled,
		lastSyncTime,
		toggleAppMode,
		toggleAutoSync,
		isLoaded
	} = useAppMode();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !isLoaded) return null;

	const formatLastSync = () => {
		if (!lastSyncTime) return 'Нет данных о синхронизации';
		return formatDistanceToNow(lastSyncTime, { addSuffix: true, locale: ru });
	};

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				background: alpha('#1E293B', 0.6),
				backdropFilter: 'blur(20px)'
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					{isOnlineMode ? (
						<CloudOutlined color="primary" />
					) : (
						<CloudOff color="action" />
					)}
					<Typography variant="subtitle2">
						{isOnlineMode ? 'Онлайн режим' : 'Оффлайн режим'}
					</Typography>
				</Box>

				<Tooltip title={
					isOnlineMode
						? "Переключить на оффлайн режим (использование загруженных данных)"
						: "Переключить на онлайн режим (данные с сервера)"
				}>
					<FormControlLabel
						control={
							<Switch
								checked={isOnlineMode}
								onChange={toggleAppMode}
								color="primary"
							/>
						}
						label=""
					/>
				</Tooltip>
			</Box>

			{isOfflineMode && (
				<Box sx={{ mt: 1 }}>
					<Typography variant="caption" color="text.secondary">
						{formatLastSync()}
					</Typography>

					<Box sx={{ mt: 1 }}>
						<Tooltip title={
							isAutoSyncEnabled
								? "Выключить автоматическую синхронизацию"
								: "Включить автоматическую синхронизацию каждые 16 часов"
						}>
							<FormControlLabel
								control={
									<Switch
										checked={isAutoSyncEnabled}
										onChange={toggleAutoSync}
										size="small"
										color="primary"
									/>
								}
								label={
									<Typography variant="caption">
										Автосинхронизация
									</Typography>
								}
							/>
						</Tooltip>
					</Box>
				</Box>
			)}
		</Paper>
	);
};