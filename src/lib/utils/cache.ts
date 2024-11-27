import { CacheData } from '@/lib/types/cache';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';

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