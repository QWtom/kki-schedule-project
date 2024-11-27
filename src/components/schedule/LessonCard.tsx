'use client'

import { Lesson } from '@/lib/types/shedule';
import {
	Paper,
	Stack,
	Box,
	Typography,
	Divider,
	alpha,
	Fade,
	useTheme,
	useMediaQuery,
	Collapse,
	IconButton
} from '@mui/material';
import {
	AccessTime as TimeIcon,
	Room as RoomIcon,
	Person as PersonIcon,
	ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useState } from 'react';

interface LessonCardProps {
	lesson: Lesson;
	index: number;
}

export const LessonCard = ({ lesson, index }: LessonCardProps) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [expanded, setExpanded] = useState(!isMobile);

	// Общие стили для карточки
	const cardStyles = {
		p: isMobile ? 2 : 3,
		background: alpha('#1E293B', 0.6),
		backdropFilter: 'blur(20px)',
		transition: 'transform 0.2s, box-shadow 0.2s',
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: `0 8px 24px ${alpha('#000', 0.2)}`,
		},
	};

	return (
		<Fade in timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
			<Paper elevation={0} sx={cardStyles}>
				<Stack spacing={isMobile ? 1.5 : 2}>
					{/* Верхняя часть карточки */}
					<Box sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: isMobile ? 'center' : 'flex-start',
						flexWrap: isMobile ? 'wrap' : 'nowrap',
						gap: 1
					}}>
						<Typography
							variant={isMobile ? "subtitle1" : "h6"}
							sx={{
								color: 'primary.light',
								flex: 1,
								minWidth: isMobile ? '100%' : 'auto'
							}}
						>
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

					{/* Разделитель */}
					<Divider sx={{ borderColor: alpha('#94A3B8', 0.1) }} />

					{/* Мобильная версия с возможностью сворачивания */}
					{isMobile && (
						<Box
							onClick={() => setExpanded(!expanded)}
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								cursor: 'pointer'
							}}
						>
							<Typography variant="body2" color="text.secondary">
								{expanded ? 'Скрыть детали' : 'Показать детали'}
							</Typography>
							<IconButton
								size="small"
								sx={{
									transform: expanded ? 'rotate(180deg)' : 'none',
									transition: 'transform 0.2s'
								}}
							>
								<ExpandMoreIcon />
							</IconButton>
						</Box>
					)}

					{/* Детали занятия */}
					<Collapse in={expanded}>
						<Stack spacing={1.5}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ wordBreak: 'break-word' }}
								>
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
					</Collapse>
				</Stack>
			</Paper>
		</Fade>
	);
};