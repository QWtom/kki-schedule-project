'use client'

import { Lesson } from '../model/types';
import {
	Card,
	CardContent,
	Typography,
	Chip,
	Box,
	styled
} from '@mui/material';
import {
	School as SchoolIcon,
	Room as RoomIcon,
	Person as PersonIcon
} from '@mui/icons-material';

interface ScheduleCardProps {
	lesson: Lesson;
}

const StyledCard = styled(Card)(({ theme }) => ({
	transition: 'all 0.2s',
	'&:hover': {
		transform: 'translateY(-2px)',
		boxShadow: theme.shadows[4],
	},
}));

const InfoRow = styled(Box)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing(1),
	marginBottom: theme.spacing(1),
}));

const getLessonTypeConfig = (type: string) => {
	const configs = {
		LECTURE: {
			color: 'primary',
			label: 'Лекция',
			icon: <SchoolIcon fontSize="small" />
		},
		PRACTICE: {
			color: 'success',
			label: 'Практика',
			icon: <SchoolIcon fontSize="small" />
		},
		LAB: {
			color: 'secondary',
			label: 'Лабораторная',
			icon: <SchoolIcon fontSize="small" />
		},
		OTHER: {
			color: 'default',
			label: 'Другое',
			icon: <SchoolIcon fontSize="small" />
		}
	};
	return configs[type as keyof typeof configs] || configs.OTHER;
};

export const ScheduleCard = ({ lesson }: ScheduleCardProps) => {
	const lessonTypeConfig = getLessonTypeConfig(lesson.type);

	return (
		<StyledCard variant="outlined">
			<CardContent>
				<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
					<Typography variant="h6" component="h3" gutterBottom>
						{lesson.subject}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{lesson.timeStart} - {lesson.timeEnd}
					</Typography>
				</Box>

				<InfoRow>
					<PersonIcon color="action" fontSize="small" />
					<Typography variant="body2" color="text.secondary">
						{lesson.teacher}
					</Typography>
				</InfoRow>

				<InfoRow>
					<RoomIcon color="action" fontSize="small" />
					<Typography variant="body2" color="text.secondary">
						{lesson.room}
					</Typography>
				</InfoRow>

				<Box mt={2}>
					<Chip
						icon={lessonTypeConfig.icon}
						label={lessonTypeConfig.label}
						color={lessonTypeConfig.color as any}
						size="small"
						variant="outlined"
					/>
				</Box>
			</CardContent>
		</StyledCard>
	);
};