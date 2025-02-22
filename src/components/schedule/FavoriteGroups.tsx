'use client';

import React from 'react';
import {
	Box,
	Typography,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	IconButton,
	Paper,
	alpha,
	Divider,
	Chip
} from '@mui/material';
import { Star, Delete } from '@mui/icons-material';
import { useFavorites } from '@/lib/hooks/useFavorites';
import ClientOnly from '../ClientOnly';

interface FavoriteGroupsProps {
	groups: any[];
	onSelectGroup: (groupId: string) => void;
	selectedGroup: string;
}

export function FavoriteGroups({ groups, onSelectGroup, selectedGroup }: FavoriteGroupsProps) {
	const { favoriteGroups, removeFavoriteGroup, isLoaded } = useFavorites();

	return (
		<ClientOnly>
			{isLoaded && favoriteGroups && RenderFavoriteGroups()}
		</ClientOnly>
	);

	function RenderFavoriteGroups() {
		const favoriteGroupsData = groups.filter(group =>
			favoriteGroups.includes(group.id)
		);

		if (favoriteGroupsData.length === 0) {
			return (
				<Box sx={{ mb: 2 }}>
					<Typography variant="subtitle1" fontWeight={600} gutterBottom>
						Избранные группы
					</Typography>
					<Paper
						elevation={0}
						sx={{
							p: 3,
							background: alpha('#1E293B', 0.3),
							textAlign: 'center',
							borderRadius: 2
						}}
					>
						<Typography variant="body2" color="text.secondary">
							У вас пока нет избранных групп
						</Typography>
						<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
							Добавьте группы, нажав на звездочку рядом с названием группы
						</Typography>
					</Paper>
				</Box>
			);
		}

		return (
			<Box sx={{ mb: 2 }}>
				<Typography variant="subtitle1" fontWeight={600} gutterBottom>
					Избранные группы
				</Typography>
				<Paper
					elevation={0}
					sx={{
						background: alpha('#1E293B', 0.3),
						borderRadius: 2,
						overflow: 'hidden'
					}}
				>
					<List disablePadding>
						{favoriteGroupsData.map((group, index) => (
							<React.Fragment key={group.id}>
								{index > 0 && <Divider sx={{ backgroundColor: alpha('#fff', 0.1) }} />}
								<ListItem
									disablePadding
									secondaryAction={
										<IconButton
											edge="end"
											onClick={() => removeFavoriteGroup(group.id)}
											size="small"
										>
											<Delete fontSize="small" />
										</IconButton>
									}
								>
									<ListItemButton
										selected={selectedGroup === group.id}
										onClick={() => onSelectGroup(group.id)}
									>
										<ListItemText
											primary={
												<Box sx={{ display: 'flex', alignItems: 'center' }}>
													<Star
														fontSize="small"
														color="warning"
														sx={{ mr: 1 }}
													/>
													<Typography variant="body2">
														{group.name}
													</Typography>
													<Chip
														label={`${group.course} курс`}
														size="small"
														sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
													/>
												</Box>
											}
										/>
									</ListItemButton>
								</ListItem>
							</React.Fragment>
						))}
					</List>
				</Paper>
			</Box>
		);
	}
}

export default FavoriteGroups;