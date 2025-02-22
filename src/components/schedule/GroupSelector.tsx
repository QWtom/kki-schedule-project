
import React, { useState, useEffect } from 'react';
import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Typography,
	Box,
	IconButton,
	SelectChangeEvent
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useFavorites } from '@/lib/hooks/useFavorites';

interface GroupSelectorProps {
	groups: any[];
	selectedGroup: string;
	onChange: (groupId: string) => void;
	disabled?: boolean;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
	groups,
	selectedGroup,
	onChange,
	disabled = false
}) => {
	// Add client-side rendering flag
	const [isMounted, setIsMounted] = useState(false);
	const { isFavorite, addFavoriteGroup, removeFavoriteGroup } = useFavorites();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleChange = (event: SelectChangeEvent) => {
		onChange(event.target.value);
	};

	const toggleFavorite = (groupId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (isFavorite(groupId)) {
			removeFavoriteGroup(groupId);
		} else {
			addFavoriteGroup(groupId);
		}
	};

	return (
		<FormControl fullWidth disabled={disabled}>
			<InputLabel id="group-select-label">Выберите группу</InputLabel>
			<Select
				labelId="group-select-label"
				id="group-select"
				value={selectedGroup}
				label="Выберите группу"
				onChange={handleChange}
			>
				{groups.length === 0 ? (
					<MenuItem value="" disabled>
						<Typography color="text.secondary">
							{disabled ? 'Сначала выберите курс' : 'Нет доступных групп'}
						</Typography>
					</MenuItem>
				) : (
					groups.map((group) => (
						<MenuItem key={group.id} value={group.id}>
							<Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
								<Typography>{group.name}</Typography>
								{isMounted && (
									<IconButton
										size="small"
										onClick={(e) => toggleFavorite(group.id, e)}
										sx={{ ml: 1 }}
									>
										{isFavorite(group.id) ? (
											<Star fontSize="small" color="warning" />
										) : (
											<StarBorder fontSize="small" />
										)}
									</IconButton>
								)}
							</Box>
						</MenuItem>
					))
				)}
			</Select>
		</FormControl>
	);
};