import { CacheData } from '@/lib/types/cache';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { WeekSchedule } from '../types/shedule';

export const validateCache = (cache: CacheData): boolean => {
	if (!cache || !cache.metadata || !cache.data) return false;

	if (cache.metadata.version !== CACHE_CONSTANTS.VERSION) {
		console.log('Cache version mismatch', {
			current: cache.metadata.version,
			required: CACHE_CONSTANTS.VERSION
		});
		return false;
	}

	const now = Date.now();
	const cacheAge = now - cache.metadata.lastUpdated;

	if (cacheAge > CACHE_CONSTANTS.LIFETIME.SCHEDULE) {
		console.log('Cache expired', {
			age: Math.round(cacheAge / (60 * 60 * 1000)) + ' часов',
			maxAge: Math.round(CACHE_CONSTANTS.LIFETIME.SCHEDULE / (60 * 60 * 1000)) + ' часов'
		});
		return false;
	}

	return true;
};


export const isCacheStale = (cache: CacheData): boolean => {
	if (!cache || !cache.metadata) return true;

	const now = Date.now();
	const cacheAge = now - cache.metadata.lastUpdated;

	return cacheAge > CACHE_CONSTANTS.LIFETIME.STALE;
};

export const generateDataHash = (data: any): string => {
	if (typeof window === 'undefined') return '';

	try {
		return btoa(JSON.stringify(data)).slice(0, 16);
	} catch (e) {
		console.error('Error generating hash:', e);
		return '';
	}
};

export const clearOldWeeks = (weeks: WeekSchedule[]): WeekSchedule[] => {
	const now = Date.now();
	return weeks
		.filter(week => now - week.uploadDate < CACHE_CONSTANTS.LIFETIME.SCHEDULE)
		.sort((a, b) => b.uploadDate - a.uploadDate)
		.slice(0, CACHE_CONSTANTS.MAX_STORED_WEEKS);
};