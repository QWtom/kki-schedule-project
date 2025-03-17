// src/lib/hooks/useScheduleCache.ts
import { useLocalStorage } from './useLocalStorage';
import { ScheduleCache } from '@/lib/types/cache';
import { CACHE_CONSTANTS } from '@/lib/constants/cache';
import { generateDataHash, validateCache } from '@/lib/utils/cache';
import { ParsedSchedule, WeekSchedule } from '@/lib/types/shedule';
import { parseWeekInfo } from '@/lib/utils/weekParser';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNotification } from '../context/NotificationContext';

export function useScheduleCache() {
	const { showNotification } = useNotification();
	const operationInProgressRef = useRef(false);
	const notificationsShownRef = useRef<Set<string>>(new Set());
	const [isInitialized, setIsInitialized] = useState(false);
	const [isCacheValid, setIsCacheValid] = useState(false);

	const [cache, setCache] = useLocalStorage<ScheduleCache | null>(
		CACHE_CONSTANTS.KEYS.SCHEDULE,
		null
	);

	const [weekCollection, setWeekCollection] = useLocalStorage<{
		activeWeekId: string | null;
		weeks: WeekSchedule[];
	}>(
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
		if (operationInProgressRef.current) return Promise.resolve();

		try {
			operationInProgressRef.current = true;
			setCache(data);
			return Promise.resolve();
		} catch (error) {
			console.error('Error saving to cache:', error);
			return Promise.reject(error);
		} finally {
			operationInProgressRef.current = false;
		}
	}, [setCache]);

	const getActiveWeek = useCallback((): WeekSchedule | null => {
		if (!weekCollection?.activeWeekId) return null;
		return weekCollection.weeks.find(w => w.weekId === weekCollection.activeWeekId) || null;
	}, [weekCollection]);

	// Проверка кэша при инициализации
	useEffect(() => {
		// При монтировании компонента проверяем, валиден ли кэш
		const isValid = cache ? validateCache(cache) : false;
		setIsCacheValid(isValid);
		setIsInitialized(true);

		if (isValid) {
			console.log('Loaded valid schedule from cache');
		} else {
			console.log('Cache is invalid or missing');
		}
	}, [cache]);

	const saveWeekSchedule = useCallback(async (weekName: string, scheduleData: ParsedSchedule, weekDate?: string) => {
		if (operationInProgressRef.current) {
			showNotificationOnce('Операция уже выполняется', 'warning');
			return Promise.reject(new Error('Операция уже выполняется'));
		}

		try {
			operationInProgressRef.current = true;
			const timestamp = Date.now();

			// Создаем ID для недели
			const weekId = `week-${weekName.replace(/[^a-zа-я0-9]/gi, '-').toLowerCase()}`;
			const displayName = weekDate || weekName || 'Расписание';

			const newWeek: WeekSchedule = {
				weekId,
				weekName: displayName,
				uploadDate: timestamp,
				schedule: scheduleData
			};

			// Проверяем, есть ли данные с тем же ID
			let existingWeekUpdated = false;

			setWeekCollection(current => {
				const safeCollection = current || { activeWeekId: null, weeks: [] };
				let updatedWeeks = [...safeCollection.weeks];
				const existingIndex = updatedWeeks.findIndex(w => w.weekId === weekId);

				if (existingIndex >= 0) {
					updatedWeeks[existingIndex] = newWeek;
					existingWeekUpdated = true;
				} else {
					updatedWeeks.push(newWeek);
				}

				// Сортируем и ограничиваем количество сохраненных недель
				updatedWeeks = updatedWeeks
					.sort((a, b) => b.uploadDate - a.uploadDate)
					.slice(0, CACHE_CONSTANTS.MAX_STORED_WEEKS);

				return {
					activeWeekId: weekId,
					weeks: updatedWeeks
				};
			});

			// Обновляем основной кэш
			await safeSetCache({
				data: scheduleData,
				metadata: {
					lastUpdated: timestamp,
					version: CACHE_CONSTANTS.VERSION,
					source: 'api',
					scheduleInfo: displayName,
					hash: generateDataHash(scheduleData)
				}
			});

			setIsCacheValid(true);

			if (!existingWeekUpdated) {
				showNotificationOnce(`Добавлено расписание: ${displayName}`, 'success');
			}

			return Promise.resolve(newWeek);
		} catch (error) {
			console.error('Ошибка при сохранении расписания:', error);
			return Promise.reject(error);
		} finally {
			operationInProgressRef.current = false;
		}
	}, [setWeekCollection, safeSetCache, showNotificationOnce]);

	const clearAllData = useCallback(async () => {
		if (operationInProgressRef.current) return Promise.reject(new Error('Operation in progress'));

		try {
			operationInProgressRef.current = true;
			setCache(null);
			setWeekCollection({
				activeWeekId: null,
				weeks: []
			});
			notificationsShownRef.current.clear();
			setIsCacheValid(false);
			return Promise.resolve();
		} catch (error) {
			console.error('Error clearing data:', error);
			return Promise.reject(error);
		} finally {
			operationInProgressRef.current = false;
		}
	}, [setCache, setWeekCollection]);

	const setActiveWeek = useCallback(async (weekId: string) => {
		try {
			setWeekCollection((current) => ({
				activeWeekId: weekId,
				weeks: current?.weeks || []
			}));

			const week = weekCollection?.weeks.find(w => w.weekId === weekId);
			if (week) {
				await safeSetCache({
					data: week.schedule,
					metadata: {
						lastUpdated: week.uploadDate,
						version: CACHE_CONSTANTS.VERSION,
						source: 'api',
						scheduleInfo: week.weekName
					}
				});
				setIsCacheValid(true);
			}

			return Promise.resolve();
		} catch (error) {
			console.error('Error setting active week:', error);
			return Promise.reject(error);
		}
	}, [setWeekCollection, weekCollection, safeSetCache]);

	// Очищаем ресурсы при размонтировании
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
		hasValidCache: isCacheValid,
		hasWeeks: Boolean(weekCollection?.weeks?.length),
		setActiveWeek,
		isInitialized
	};
}