import { useLocalStorage } from './useLocalStorage';
import { ScheduleCache } from '@/lib/types/cache';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { clearOldWeeks, validateCache } from '@/lib/utils/cache';
import { ParsedSchedule, ScheduleCollection, WeekSchedule } from '@/lib/types/shedule';
import { parseWeekInfo } from '@/lib/utils/weekParser';
import { useCallback, useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';

interface ScheduleCollectionState {
	activeWeekId: string | null;
	weeks: WeekSchedule[];
}

export function useScheduleCache() {
	const { showNotification } = useNotification();
	const operationInProgressRef = useRef(false);
	const notificationsShownRef = useRef<Set<string>>(new Set());

	const [cache, setCache] = useLocalStorage<ScheduleCache | null>(
		CACHE_CONSTANTS.KEYS.SCHEDULE,
		null
	);

	const [weekCollection, setWeekCollection] = useLocalStorage<ScheduleCollection>(
		CACHE_CONSTANTS.KEYS.WEEKS,
		{
			activeWeekId: null,
			weeks: []
		}
	);

	const showNotificationOnce = useCallback((message: string, type: 'info' | 'warning' | 'success' | 'error') => {
		const key = `${message}-${type}`;
		if (!notificationsShownRef.current.has(key)) {
			showNotification(message, type);
			notificationsShownRef.current.add(key);
			setTimeout(() => {
				notificationsShownRef.current.delete(key);
			}, 5000);
		}
	}, [showNotification]);

	const safeSetCache = useCallback(async (data: ScheduleCache | null) => {
		if (operationInProgressRef.current) return;

		try {
			operationInProgressRef.current = true;
			await setCache(data);
		} catch (error) {
			console.error('Error saving to cache:', error);
			await clearAllData();
			showNotificationOnce('Произошла ошибка при сохранении данных', 'error');
		} finally {
			operationInProgressRef.current = false;
		}
	}, [setCache, showNotificationOnce]);

	const getActiveWeek = useCallback((): WeekSchedule | null => {
		if (!weekCollection?.activeWeekId) return null;
		return weekCollection.weeks.find(w => w.weekId === weekCollection.activeWeekId) || null;
	}, [weekCollection]);

	const cleanupOldData = useCallback(() => {
		if (operationInProgressRef.current) return;

		setWeekCollection((current: any) => {
			if (!current || current.weeks.length === 0) return current;

			const now = Date.now();
			const maxAge = CACHE_CONSTANTS.LIFETIME.SCHEDULE;
			const validWeeks = current.weeks.filter((week: any) =>
				now - week.uploadDate < maxAge
			).slice(0, CACHE_CONSTANTS.MAX_STORED_WEEKS);

			if (validWeeks.length === current.weeks.length) return current;

			return {
				activeWeekId: current.activeWeekId,
				weeks: validWeeks
			};
		});
	}, [setWeekCollection]);

	useEffect(() => {
		const activeWeek = getActiveWeek();
		if (activeWeek && (!cache || cache.metadata.lastUpdated !== activeWeek.uploadDate)) {
			safeSetCache({
				data: activeWeek.schedule,
				metadata: {
					lastUpdated: activeWeek.uploadDate,
					version: CACHE_CONSTANTS.VERSION
				}
			});
		}

		const cleanupInterval = setInterval(cleanupOldData, 24 * 60 * 60 * 1000);
		return () => clearInterval(cleanupInterval);
	}, [weekCollection?.activeWeekId, getActiveWeek, cache, safeSetCache, cleanupOldData]);

	const saveWeekSchedule = useCallback(async (fileName: string, scheduleData: ParsedSchedule) => {
		if (operationInProgressRef.current) {
			showNotificationOnce('Операция уже выполняется', 'warning');
			return;
		}

		try {
			operationInProgressRef.current = true;
			const timestamp = Date.now();
			const { weekId, weekName } = parseWeekInfo(fileName);

			const newWeek: WeekSchedule = {
				weekId,
				weekName,
				uploadDate: timestamp,
				schedule: scheduleData
			};

			await setWeekCollection(current => {
				const safeCollection = current || { activeWeekId: null, weeks: [] };
				let updatedWeeks = [...safeCollection.weeks];
				const existingIndex = updatedWeeks.findIndex(w => w.weekId === weekId);

				if (existingIndex >= 0) {
					updatedWeeks[existingIndex] = newWeek;
				} else {
					updatedWeeks.push(newWeek);
				}

				updatedWeeks = updatedWeeks
					.sort((a, b) => b.uploadDate - a.uploadDate)
					.slice(0, CACHE_CONSTANTS.MAX_STORED_WEEKS);

				return {
					activeWeekId: weekId,
					weeks: updatedWeeks
				};
			});

			await safeSetCache({
				data: scheduleData,
				metadata: {
					lastUpdated: timestamp,
					version: CACHE_CONSTANTS.VERSION
				}
			});
		} finally {
			operationInProgressRef.current = false;
		}
	}, [setWeekCollection, safeSetCache, showNotificationOnce]);

	const clearAllData = useCallback(async () => {
		if (operationInProgressRef.current) return;

		try {
			operationInProgressRef.current = true;
			await safeSetCache(null);
			await setWeekCollection({
				activeWeekId: null,
				weeks: []
			});
			notificationsShownRef.current.clear();
		} finally {
			operationInProgressRef.current = false;
		}
	}, [safeSetCache, setWeekCollection]);

	const setActiveWeek = useCallback((weekId: string) =>
		setWeekCollection((current: ScheduleCollectionState | null) => ({
			activeWeekId: weekId,
			weeks: current?.weeks || []
		}))
		, [setWeekCollection]);

	useEffect(() => {
		return () => {
			notificationsShownRef.current.clear();
			operationInProgressRef.current = false;
		};
	}, []);

	return {
		cachedSchedule: cache?.data || null,
		metadata: cache?.metadata || null,
		activeWeek: getActiveWeek(),
		weeks: weekCollection?.weeks || [],
		saveWeekSchedule,
		clearCache: clearAllData,
		// Добавим проверку на null для cache
		hasValidCache: cache ? validateCache(cache) : false,
		hasWeeks: Boolean(weekCollection?.weeks?.length),
		setActiveWeek
	};
}