import { CacheData } from '@/lib/types/cache';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { WeekSchedule } from '../types/shedule';

export const validateCache = (cache: CacheData): boolean => {
	if (!cache || !cache.metadata) return false;
	if (cache.metadata.version !== CACHE_CONSTANTS.VERSION) return false;

	const isExpired = Date.now() - cache.metadata.lastUpdated >
		CACHE_CONSTANTS.LIFETIME.SCHEDULE;

	if (isExpired) return false;

	if (cache.metadata.hash) {
		const currentHash = generateDataHash(cache.data);
		if (currentHash !== cache.metadata.hash) return false;
	}

	return true;
};

export const generateDataHash = (data: any): string => {
	return btoa(JSON.stringify(data)).slice(0, 10);
};

export const clearOldWeeks = (weeks: WeekSchedule[]): WeekSchedule[] => {
	const now = Date.now();
	return weeks
		.filter(week => now - week.uploadDate < CACHE_CONSTANTS.LIFETIME.SCHEDULE)
		.sort((a, b) => b.uploadDate - a.uploadDate)
		.slice(0, CACHE_CONSTANTS.MAX_STORED_WEEKS);
};