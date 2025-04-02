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
	IconButton,
	Chip
} from '@mui/material';
import {
	AccessTime as TimeIcon,
	Room as RoomIcon,
	Person as PersonIcon,
	ExpandMore as ExpandMoreIcon,
	Videocam as VideocamIcon
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

	// Проверяем, проходит ли урок в Сферуме
	const isSferum = typeof lesson.room === 'string' &&
		lesson.room.toLowerCase().includes('сферум');

	const cardStyles = {
		p: isMobile ? 2 : 3,
		background: isSferum
			? alpha('#3B82F6', 0.15) // Светло-синий фон для занятий в Сферуме
			: alpha('#1E293B', 0.6),
		backdropFilter: 'blur(20px)',
		transition: 'transform 0.2s, box-shadow 0.2s',
		position: 'relative',
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: `0 8px 24px ${alpha('#000', 0.2)}`,
		},
		border: isSferum ? `1px solid ${alpha('#3B82F6', 0.3)}` : 'none',
	};

	return (
		<Fade in timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
			<Paper elevation={0} sx={cardStyles}>
				<Stack spacing={isMobile ? 1.5 : 2}>
					<Box sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						flexWrap: 'wrap',
						gap: 1
					}}>
						<Box sx={{
							display: 'flex',
							alignItems: 'center',
							flex: 1,
							gap: 1
						}}>
							<Typography
								variant={isMobile ? "subtitle1" : "h6"}
								sx={{
									color: 'primary.light',
									flex: 1,
								}}
							>
								{lesson.subject}
							</Typography>

							{/* Чип "Онлайн" в заголовке */}
							{isSferum && (
								<Chip
									icon={<VideocamIcon fontSize="small" />}
									label="Онлайн"
									size="small"
									color="primary"
									sx={{
										height: 24,
										ml: 1,
										'& .MuiChip-label': {
											px: 1,
											fontSize: '0.7rem'
										}
									}}
								/>
							)}
						</Box>

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

					{/* Аудитория всегда видна */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<RoomIcon fontSize="small" sx={{ color: isSferum ? "primary" : "text.secondary" }} />
						<Typography variant="body2" color={isSferum ? "primary" : "text.secondary"} fontWeight={isSferum ? 500 : 400}>
							{lesson.room}
						</Typography>
					</Box>

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
						</Stack>
					</Collapse>
				</Stack>
			</Paper>
		</Fade>
	);
};