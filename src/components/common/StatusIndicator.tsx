import { Tooltip, Box, Typography, CircularProgress } from '@mui/material';
import { CheckCircle, Warning, CloudUpload } from '@mui/icons-material';

interface StatusIndicatorProps {
	status: 'fresh' | 'stale' | 'loading' | 'upload';
	lastUpdate?: Date | null;
}

export const StatusIndicator = ({ status, lastUpdate }: StatusIndicatorProps) => {
	const getStatusConfig = () => {
		switch (status) {
			case 'fresh':
				return {
					icon: <CheckCircle color="success" />,
					message: 'Расписание актуально',
					color: 'success.main'
				};
			case 'stale':
				return {
					icon: <Warning color="warning" />,
					message: 'Рекомендуется обновить расписание',
					color: 'warning.main'
				};
			case 'loading':
				return {
					icon: <CircularProgress size={20} />,
					message: 'Загрузка расписания...',
					color: 'info.main'
				};
			case 'upload':
				return {
					icon: <CloudUpload color="info" />,
					message: 'Загрузите файл расписания',
					color: 'info.main'
				};
		}
	};

	const formattedDate = lastUpdate ? new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(lastUpdate) : null;

	const config = getStatusConfig();

	return (
		<Tooltip
			title={
				<Box>
					<Typography variant="body2">{config.message}</Typography>
					{formattedDate && (
						<Typography variant="caption">
							Последнее обновление: {formattedDate}
						</Typography>
					)}
				</Box>
			}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					cursor: 'help',
					transition: 'opacity 0.2s',
					'&:hover': { opacity: 0.8 }
				}}
			>
				{config.icon}
				<Typography
					variant="body2"
					color={config.color}
					sx={{
						display: { xs: 'none', sm: 'block' }
					}}
				>
					{config.message}
				</Typography>
			</Box>
		</Tooltip>
	);
};