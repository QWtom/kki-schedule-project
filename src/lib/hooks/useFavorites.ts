import { useState, useEffect } from 'react';

interface FavoritesState {
	favoriteGroups: string[];
	defaultCourse: string | null;
}

const DEFAULT_FAVORITES: FavoritesState = {
	favoriteGroups: [],
	defaultCourse: null
};


let globalFavorites: FavoritesState = DEFAULT_FAVORITES;
let listeners: (() => void)[] = [];

const notifyListeners = () => {
	listeners.forEach(listener => listener());
};

const loadFavorites = (): FavoritesState => {
	if (typeof window === 'undefined') return DEFAULT_FAVORITES;

	try {
		const stored = localStorage.getItem('favorites');
		return stored ? JSON.parse(stored) : DEFAULT_FAVORITES;
	} catch (e) {
		console.error('Error loading favorites:', e);
		return DEFAULT_FAVORITES;
	}
};

const saveFavorites = (favorites: FavoritesState) => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem('favorites', JSON.stringify(favorites));
	} catch (e) {
		console.error('Error saving favorites:', e);
	}
};

if (typeof window !== 'undefined') {
	globalFavorites = loadFavorites();
}

export function useFavorites() {
	const [, setUpdateCounter] = useState(0);

	useEffect(() => {
		const handleChange = () => {
			setUpdateCounter(c => c + 1);
		};

		listeners.push(handleChange);

		if (typeof window !== 'undefined' && globalFavorites === DEFAULT_FAVORITES) {
			globalFavorites = loadFavorites();
			handleChange();
		}

		return () => {
			listeners = listeners.filter(l => l !== handleChange);
		};
	}, []);

	const addFavoriteGroup = (groupId: string) => {
		if (typeof window === 'undefined') return;
		if (globalFavorites.favoriteGroups.includes(groupId)) return;

		globalFavorites = {
			...globalFavorites,
			favoriteGroups: [...globalFavorites.favoriteGroups, groupId]
		};

		saveFavorites(globalFavorites);
		notifyListeners();
	};

	const removeFavoriteGroup = (groupId: string) => {
		if (typeof window === 'undefined') return;

		globalFavorites = {
			...globalFavorites,
			favoriteGroups: globalFavorites.favoriteGroups.filter(id => id !== groupId)
		};

		saveFavorites(globalFavorites);
		notifyListeners();
	};

	const setDefaultCourse = (courseKey: string | null) => {
		if (typeof window === 'undefined') return;

		globalFavorites = {
			...globalFavorites,
			defaultCourse: courseKey
		};

		saveFavorites(globalFavorites);
		notifyListeners();
	};

	const isFavorite = (groupId: string) => {
		return globalFavorites.favoriteGroups.includes(groupId);
	};

	return {
		favoriteGroups: globalFavorites.favoriteGroups,
		defaultCourse: globalFavorites.defaultCourse,
		addFavoriteGroup,
		removeFavoriteGroup,
		setDefaultCourse,
		isFavorite
	};
}