import { useLocalStorage } from './useLocalStorage';
import { ScheduleCache } from '@/lib/types/cache';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { validateCache } from '@/lib/utils/cache';
import { ParsedSchedule, ScheduleCollection, WeekSchedule } from '@/lib/types/shedule';
import { parseWeekInfo } from '@/lib/utils/weekParser';

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
		const cacheEntry: ScheduleCache = {
			data: scheduleData,
			metadata: {
				lastUpdated: Date.now(),
				version: CACHE_CONSTANTS.VERSION
			}
		};
		setCache(cacheEntry);
	};

	const saveWeekSchedule = (fileName: string, scheduleData: ParsedSchedule) => {
		const { weekId, weekName } = parseWeekInfo(fileName);

		setWeekCollection((currentCollection) => {
			const safeCollection = currentCollection || {
				activeWeekId: null,
				weeks: []
			};

			const newWeek: WeekSchedule = {
				weekId,
				weekName,
				uploadDate: Date.now(),
				schedule: scheduleData
			};

			const existingIndex = safeCollection.weeks.findIndex(w => w.weekId === weekId);
			const updatedWeeks = existingIndex >= 0
				? safeCollection.weeks.map((week, index) =>
					index === existingIndex ? newWeek : week
				)
				: [...safeCollection.weeks, newWeek];

			return {
				activeWeekId: weekId,
				weeks: updatedWeeks.sort((a, b) => b.uploadDate - a.uploadDate)
			};
		});
	};

	const getActiveWeek = (): WeekSchedule | null => {
		if (!weekCollection?.activeWeekId) return null;
		return weekCollection.weeks.find(w => w.weekId === weekCollection.activeWeekId) || null;
	};

	const getCachedSchedule = (): ParsedSchedule | null => {
		if (!cache || !validateCache(cache)) return null;
		return cache.data;
	};

	const getCacheMetadata = () => {
		return cache?.metadata || null;
	};

	const clearAllData = () => {
		setCache(null);
		setWeekCollection({
			activeWeekId: null,
			weeks: []
		});
	};

	const setActiveWeek = (weekId: string) => {
		setWeekCollection(current => {
			// Если current null, создаем базовую структуру
			const safeCollection: ScheduleCollection = current || {
				activeWeekId: null,
				weeks: []
			};

			// Возвращаем новый объект с обязательными полями
			return {
				activeWeekId: weekId,
				weeks: safeCollection.weeks // Сохраняем существующие недели
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