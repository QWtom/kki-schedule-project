// components/schedule/LessonCard/index.tsx
'use client'

import { Lesson } from '@/lib/types/shedule';
import { Paper, Stack, Box, Typography, Divider, alpha, Fade } from '@mui/material';
import { AccessTime as TimeIcon, Room as RoomIcon, Person as PersonIcon } from '@mui/icons-material';

interface LessonCardProps {
	lesson: Lesson;
	index: number;
}

export const LessonCard = ({ lesson, index }: LessonCardProps) => {
	return (
		<Fade in timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
			<Paper
				elevation={0}
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
	);
};