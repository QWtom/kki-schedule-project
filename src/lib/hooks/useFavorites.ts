
import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface FavoritesState {
	favoriteGroups: string[];
	defaultCourse: string | null;
}

const DEFAULT_FAVORITES: FavoritesState = {
	favoriteGroups: [],
	defaultCourse: null
};

export function useFavorites() {
	// Use the hook correctly with both required parameters
	const [favorites, setFavorites] = useLocalStorage<FavoritesState>('favorites', DEFAULT_FAVORITES);

	// Add browser detection to avoid SSR issues
	const [isBrowser, setIsBrowser] = useState(false);

	useEffect(() => {
		setIsBrowser(true);
	}, []);

	// Helper to safely access favorites, fallback to defaults if null or if we're on the server
	const getFavorites = (): FavoritesState => {
		return (isBrowser && favorites) || DEFAULT_FAVORITES;
	};

	const addFavoriteGroup = (groupId: string) => {
		if (!isBrowser) return; // Don't run on server

		const current = getFavorites();
		if (!current.favoriteGroups.includes(groupId)) {
			setFavorites({
				...current,
				favoriteGroups: [...current.favoriteGroups, groupId]
			});
		}
	};

	const removeFavoriteGroup = (groupId: string) => {
		if (!isBrowser) return; // Don't run on server

		const current = getFavorites();
		setFavorites({
			...current,
			favoriteGroups: current.favoriteGroups.filter(id => id !== groupId)
		});
	};

	const setDefaultCourse = (courseKey: string | null) => {
		if (!isBrowser) return; // Don't run on server

		const current = getFavorites();
		setFavorites({
			...current,
			defaultCourse: courseKey
		});
	};

	const isFavorite = (groupId: string) => {
		const current = getFavorites();
		return current.favoriteGroups.includes(groupId);
	};

	return {
		// Safely provide favorites data with fallbacks
		favoriteGroups: getFavorites().favoriteGroups,
		defaultCourse: getFavorites().defaultCourse,
		addFavoriteGroup,
		removeFavoriteGroup,
		setDefaultCourse,
		isFavorite
	};
}