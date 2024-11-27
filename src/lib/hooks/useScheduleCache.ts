import { useLocalStorage } from './useLocalStorage';
import { ScheduleCache } from '@/lib/types/cache';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { validateCache } from '@/lib/utils/cache';
import { ParsedSchedule } from '@/lib/types/shedule';

export function useScheduleCache() {
	const [cache, setCache] = useLocalStorage<ScheduleCache | null>(
		CACHE_CONSTANTS.KEYS.SCHEDULE,
		null
	);

	const saveSchedule = (scheduleData: ParsedSchedule) => {
		const cacheEntry: ScheduleCache = {
			data: scheduleData,
			metadata: {
				lastUpdated: Date.now(),
				version: CACHE_CONSTANTS.VERSION
			}
		};
		setCache(cacheEntry);
	};

	const getCachedSchedule = (): ParsedSchedule | null => {
		if (!cache || !validateCache(cache)) return null;
		return cache.data;
	};

	// Получение метаданных кэша
	const getCacheMetadata = () => {
		if (!cache) return null;
		return cache.metadata;
	};

	return {
		cachedSchedule: getCachedSchedule(),
		metadata: getCacheMetadata(),
		saveSchedule,
		clearCache: () => setCache(null),
		hasValidCache: !!getCachedSchedule()
	};
}