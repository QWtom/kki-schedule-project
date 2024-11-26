// components/schedule/GroupSelector.tsx
import { FormControl, InputLabel, Select, MenuItem, ListSubheader } from '@mui/material';
import { Group } from '@/lib/types/shedule';

interface GroupSelectorProps {
	groups: Group[];
	selectedGroup: string;
	onChange: (groupId: string) => void;
	disabled?: boolean;
}

export const GroupSelector = ({ groups, selectedGroup, onChange, disabled }: GroupSelectorProps) => {
	// Группируем группы по курсам
	const groupedByCourse = groups.reduce((acc, group) => {
		const course = group.course || 1;
		if (!acc[course]) {
			acc[course] = [];
		}
		acc[course].push(group);
		return acc;
	}, {} as Record<number, Group[]>);

	return (
		<FormControl fullWidth>
			<InputLabel>Группа</InputLabel>
			<Select
				value={selectedGroup}
				label="Группа"
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
			>
				<MenuItem value="">
					<em>Выберите группу</em>
				</MenuItem>
				{Object.entries(groupedByCourse)
					.sort(([a], [b]) => Number(a) - Number(b))
					.map(([course, courseGroups]) => [
						<ListSubheader key={`course-${course}`} sx={{ background: 'transparent', color: 'primary.light' }}>
							{course} курс
						</ListSubheader>,
						...courseGroups
							.sort((a, b) => a.name.localeCompare(b.name))
							.map(group => (
								<MenuItem key={group.id} value={group.id}>
									{group.name}
								</MenuItem>
							))
					]).flat()}
			</Select>
		</FormControl>
	);
};