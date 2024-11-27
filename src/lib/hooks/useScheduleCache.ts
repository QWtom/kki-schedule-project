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
		console.log('Saving schedule with timestamp:', timestamp); // Для отладки

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

	// Используем useEffect для синхронизации кэша с активной неделей
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

		// Если есть активная неделя, используем её метаданные
		if (activeWeek?.uploadDate) {
			return {
				lastUpdated: activeWeek.uploadDate,
				version: CACHE_CONSTANTS.VERSION
			};
		}

		// Если нет активной недели, но есть кэш
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

		// Создаем объект новой недели
		const newWeek: WeekSchedule = {
			weekId,
			weekName,
			uploadDate: timestamp,
			schedule: scheduleData
		};

		// Обновляем коллекцию недель, сохраняя существующие недели
		setWeekCollection(current => {
			// Получаем текущую коллекцию или создаем новую, если она не существует
			const safeCollection = current || {
				activeWeekId: null,
				weeks: []
			};

			// Проверяем, существует ли уже неделя с таким ID
			const existingIndex = safeCollection.weeks.findIndex(w => w.weekId === weekId);

			let updatedWeeks: WeekSchedule[];
			if (existingIndex >= 0) {
				// Если неделя существует, обновляем её, сохраняя остальные
				updatedWeeks = safeCollection.weeks.map((week, index) =>
					index === existingIndex ? newWeek : week
				);
			} else {
				// Если это новая неделя, добавляем её к существующим
				updatedWeeks = [...safeCollection.weeks, newWeek];
			}

			// Сортируем недели по дате загрузки (новые сверху)
			const sortedWeeks = updatedWeeks.sort((a, b) => b.uploadDate - a.uploadDate);

			// Возвращаем обновленную коллекцию
			return {
				activeWeekId: weekId, // Устанавливаем новую неделю как активную
				weeks: sortedWeeks
			};
		});

		// Обновляем обычный кэш для синхронизации
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