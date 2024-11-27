'use client'

import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface GroupSelectorProps {
	groups: Array<{
		id: string;
		name: string;
		course: number;
		subgroup: number;
	}>;
	selectedGroup: string;
	onChange: (groupId: string) => void;
	disabled?: boolean;
}

export const GroupSelector = ({
	groups,
	selectedGroup,
	onChange,
	disabled
}: GroupSelectorProps) => {
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
				{groups.map((group) => (
					<MenuItem key={group.id} value={group.id}>
						{group.name}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};