import { useLocalStorage } from './useLocalStorage';
import { ScheduleCache } from '@/lib/types/cache';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { validateCache } from '@/lib/utils/cache';
import { ParsedSchedule, ScheduleCollection, WeekSchedule } from '@/lib/types/shedule';
import { parseWeekInfo } from '@/lib/utils/weekParser';
import { useCallback, useEffect } from 'react';

export function useScheduleCache() {
	const [cache, setCache] = useLocalStorage<ScheduleCache | null>(
		CACHE_CONSTANTS.KEYS.SCHEDULE,
		null
	);

	const [weekCollection, setWeekCollection] = useLocalStorage<ScheduleCollection>(
		'schedule-weeks',
		{
			activeWeekId: null,
			weeks: []
		}
	);


	const saveSchedule = (scheduleData: ParsedSchedule) => {
		const timestamp = Date.now();
		console.log('Saving schedule with timestamp:', timestamp);

		const cacheEntry: ScheduleCache = {
			data: scheduleData,
			metadata: {
				lastUpdated: timestamp,
				version: CACHE_CONSTANTS.VERSION
			}
		};
		setCache(cacheEntry);
	};

	const getActiveWeek = useCallback((): WeekSchedule | null => {
		if (!weekCollection?.activeWeekId) return null;
		return weekCollection.weeks.find(w => w.weekId === weekCollection.activeWeekId) || null;
	}, [weekCollection]);

	useEffect(() => {
		const activeWeek = getActiveWeek();
		if (activeWeek) {
			const cacheEntry: ScheduleCache = {
				data: activeWeek.schedule,
				metadata: {
					lastUpdated: activeWeek.uploadDate,
					version: CACHE_CONSTANTS.VERSION
				}
			};
			setCache(cacheEntry);
		}
	}, [weekCollection?.activeWeekId]);

	const getCachedSchedule = (): ParsedSchedule | null => {
		if (!cache || !validateCache(cache)) return null;
		return cache.data;
	};

	const getCacheMetadata = useCallback(() => {
		const activeWeek = getActiveWeek();

		if (activeWeek?.uploadDate) {
			return {
				lastUpdated: activeWeek.uploadDate,
				version: CACHE_CONSTANTS.VERSION
			};
		}

		if (cache?.metadata?.lastUpdated) {
			return cache.metadata;
		}

		return null;
	}, [getActiveWeek, cache]);

	useEffect(() => {
		const activeWeek = getActiveWeek();
		if (activeWeek) {
			const cacheEntry: ScheduleCache = {
				data: activeWeek.schedule,
				metadata: {
					lastUpdated: activeWeek.uploadDate,
					version: CACHE_CONSTANTS.VERSION
				}
			};
			setCache(cacheEntry);
		}
	}, [weekCollection?.activeWeekId, getActiveWeek]);

	const saveWeekSchedule = useCallback((fileName: string, scheduleData: ParsedSchedule) => {
		const timestamp = Date.now();
		const { weekId, weekName } = parseWeekInfo(fileName);

		const newWeek: WeekSchedule = {
			weekId,
			weekName,
			uploadDate: timestamp,
			schedule: scheduleData
		};

		setWeekCollection(current => {
			const safeCollection = current || {
				activeWeekId: null,
				weeks: []
			};

			const existingIndex = safeCollection.weeks.findIndex(w => w.weekId === weekId);

			let updatedWeeks: WeekSchedule[];
			if (existingIndex >= 0) {
				updatedWeeks = safeCollection.weeks.map((week, index) =>
					index === existingIndex ? newWeek : week
				);
			} else {
				updatedWeeks = [...safeCollection.weeks, newWeek];
			}

			const sortedWeeks = updatedWeeks.sort((a, b) => b.uploadDate - a.uploadDate);

			return {
				activeWeekId: weekId,
				weeks: sortedWeeks
			};
		});

		setCache({
			data: scheduleData,
			metadata: {
				lastUpdated: timestamp,
				version: CACHE_CONSTANTS.VERSION
			}
		});
	}, [setWeekCollection, setCache]);

	const clearAllData = () => {
		setCache(null);
		setWeekCollection({
			activeWeekId: null,
			weeks: []
		});
	};

	const setActiveWeek = (weekId: string) => {
		setWeekCollection(current => {
			const safeCollection: ScheduleCollection = current || {
				activeWeekId: null,
				weeks: []
			};

			return {
				activeWeekId: weekId,
				weeks: safeCollection.weeks
			};
		});
	};

	return {
		cachedSchedule: getCachedSchedule(),
		metadata: getCacheMetadata(),
		saveSchedule,
		activeWeek: getActiveWeek(),
		weeks: weekCollection?.weeks || [],
		saveWeekSchedule,
		clearCache: clearAllData,
		hasValidCache: !!getCachedSchedule(),
		hasWeeks: (weekCollection?.weeks.length || 0) > 0,
		setActiveWeek
	};
}