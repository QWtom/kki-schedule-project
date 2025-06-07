'use client';

import { useState, useEffect } from 'react';

interface FavoritesState {
	favoriteGroups: string[];
	defaultCourse: string | null;
}

const DEFAULT_FAVORITES: FavoritesState = {
	favoriteGroups: [],
	defaultCourse: null
};

const FAVORITES_EVENT_NAME = 'favoritesChanged';
let favoritesEventEmitter: EventTarget;

if (typeof window !== 'undefined') {
	favoritesEventEmitter = new EventTarget();
}

const loadFavoritesFromStorage = (): FavoritesState => {
	if (typeof window === 'undefined') return DEFAULT_FAVORITES;

	try {
		const stored = localStorage.getItem('global_favorites');
		return stored ? JSON.parse(stored) : DEFAULT_FAVORITES;
	} catch (e) {
		console.error('Error loading favorites:', e);
		return DEFAULT_FAVORITES;
	}
};

const saveFavoritesToStorage = (favorites: FavoritesState) => {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem('global_favorites', JSON.stringify(favorites));

		const event = new CustomEvent(FAVORITES_EVENT_NAME, { detail: favorites });
		favoritesEventEmitter.dispatchEvent(event);
	} catch (e) {
		console.error('Error saving favorites:', e);
	}
};

export function useFavorites() {
	const [favorites, setFavorites] = useState<FavoritesState>(DEFAULT_FAVORITES);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setFavorites(loadFavoritesFromStorage());
		setIsLoaded(true);

		const handleFavoritesChange = (event: Event) => {
			const customEvent = event as CustomEvent<FavoritesState>;
			setFavorites(customEvent.detail);
		};

		if (typeof window !== 'undefined') {
			favoritesEventEmitter.addEventListener(
				FAVORITES_EVENT_NAME,
				handleFavoritesChange
			);
		}

		return () => {
			if (typeof window !== 'undefined') {
				favoritesEventEmitter.removeEventListener(
					FAVORITES_EVENT_NAME,
					handleFavoritesChange
				);
			}
		};
	}, []);

	const addFavoriteGroup = (groupId: string) => {
		if (typeof window === 'undefined') return;
		if (favorites.favoriteGroups.includes(groupId)) return;

		const newFavorites = {
			...favorites,
			favoriteGroups: [...favorites.favoriteGroups, groupId]
		};

		setFavorites(newFavorites);
		saveFavoritesToStorage(newFavorites);
	};

	const removeFavoriteGroup = (groupId: string) => {
		if (typeof window === 'undefined') return;

		const newFavorites = {
			...favorites,
			favoriteGroups: favorites.favoriteGroups.filter(id => id !== groupId)
		};

		setFavorites(newFavorites);
		saveFavoritesToStorage(newFavorites);
	};

	const setDefaultCourse = (courseKey: string | null) => {
		if (typeof window === 'undefined') return;

		const newFavorites = {
			...favorites,
			defaultCourse: courseKey
		};

		setFavorites(newFavorites);
		saveFavoritesToStorage(newFavorites);
	};

	const isFavorite = (groupId: string) => {
		return favorites.favoriteGroups.includes(groupId);
	};

	return {
		favoriteGroups: favorites.favoriteGroups,
		defaultCourse: favorites.defaultCourse,
		addFavoriteGroup,
		removeFavoriteGroup,
		setDefaultCourse,
		isFavorite,
		isLoaded
	};
}