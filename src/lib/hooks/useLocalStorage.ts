import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
	key: string,
	initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
	const getStoredValue = (): T => {
		if (typeof window === 'undefined') return initialValue;

		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(`Error reading from localStorage (key: ${key}):`, error);
			return initialValue;
		}
	};

	const [storedValue, setStoredValue] = useState<T>(getStoredValue);

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			const valueToStore = value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);

			if (typeof window !== 'undefined') {
				localStorage.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			console.error(`Error saving to localStorage (key: ${key}):`, error);
		}
	};

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue !== null) {
				setStoredValue(JSON.parse(e.newValue));
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, [key]);

	return [storedValue, setValue];
}