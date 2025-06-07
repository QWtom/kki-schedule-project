
import { useState, useCallback, useEffect, useRef } from 'react';
import { getGoogleSheet } from '@/app/api/googlesheets/googleapi';
import { useNotification } from '@/lib/context/NotificationContext';
import { useAppMode } from './useAppMode';
import { useScheduleCache } from './useScheduleCache';
import { parseGoogleSheetData } from '@/lib/utils/parseGoogleSheetData';
import { ParsedSchedule } from '@/lib/types/shedule';

const CACHE_VALIDITY_PERIOD = 24 * 60 * 60 * 1000;
const CACHE_UPDATE_THRESHOLD = 8 * 60 * 60 * 1000;

export function useGoogleSheets() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastSync, setLastSync] = useState<Date | null>(null);
	const [parsedDataState, setParsedDataState] = useState<ParsedSchedule | null>(null);
	const [loadedDataInfo, setLoadedDataInfo] = useState<string | null>(null);

	const { showNotification } = useNotification();
	const { isOnlineMode, updateLastSyncTime } = useAppMode();
	const {
		saveWeekSchedule,
		setActiveWeek,
		cachedSchedule,
		metadata,
		hasValidCache
	} = useScheduleCache();


	const initialFetchHandledRef = useRef(false);
	const appJustStartedRef = useRef(true);
	const activeRequestRef = useRef<Promise<any> | null>(null);


	useEffect(() => {

		if (hasValidCache && cachedSchedule && !parsedDataState) {
			console.log('Инициализация данных из кэша расписаний');
			setParsedDataState(cachedSchedule);

			if (metadata?.scheduleInfo) {
				setLoadedDataInfo(metadata.scheduleInfo);
			}

			if (metadata?.lastUpdated) {
				setLastSync(new Date(metadata.lastUpdated));
			}


			initialFetchHandledRef.current = true;
		}
	}, [hasValidCache, cachedSchedule, metadata, parsedDataState]);


	const isCacheStale = useCallback(() => {
		if (!metadata || !metadata.lastUpdated) return true;

		const now = Date.now();
		const cacheAge = now - metadata.lastUpdated;
		return cacheAge > CACHE_UPDATE_THRESHOLD;
	}, [metadata]);


	const isCacheValid = useCallback(() => {
		if (!metadata || !metadata.lastUpdated) return false;

		const now = Date.now();
		const cacheAge = now - metadata.lastUpdated;
		return cacheAge <= CACHE_VALIDITY_PERIOD;
	}, [metadata]);


	const checkApiCache = useCallback(() => {
		try {
			const cacheData = localStorage.getItem('api-response-cache');
			const cacheTimestamp = localStorage.getItem('api-cache-timestamp');

			if (!cacheData || !cacheTimestamp) return null;

			const cacheAge = Date.now() - parseInt(cacheTimestamp);


			if (cacheAge > CACHE_VALIDITY_PERIOD) return null;

			return {
				data: JSON.parse(cacheData),
				age: cacheAge,
				timestamp: parseInt(cacheTimestamp)
			};
		} catch (e) {
			console.error('Ошибка при проверке кэша API:', e);
			return null;
		}
	}, []);


	const getWeekInfo = useCallback((data: any): string | any => {
		try {
			if (!data || !data.data) return null;


			const firstSheet = Object.keys(data.data)[0];
			if (!firstSheet) return null;

			const sheetData = data.data[firstSheet];


			for (let i = 3; i < 7 && i < sheetData.length; i++) {
				const row = sheetData[i];
				if (row && row[0]) {
					const cellValue = String(row[0]).trim();
					if (cellValue.match(/\d{1,2}[-\s]+\d{1,2}\s+[а-яА-Я]+/i) ||
						cellValue.includes('ФЕВРАЛЯ') ||
						cellValue.includes('МАРТА') ||
						cellValue.includes('АПРЕЛЯ') ||
						cellValue.includes('МАЯ') ||
						cellValue.includes('ЯНВАРЯ')) {
						return cellValue;
					}
				}
			}
			return null;
		} catch (e) {
			console.error('Ошибка при извлечении информации о неделе:', e);
			return null;
		}
	}, []);


	const saveAndUpdateData = useCallback(async (data: any, silent: boolean) => {

		const weekInfo = getWeekInfo(data);
		setLoadedDataInfo(weekInfo);


		const parsedData = parseGoogleSheetData(data);


		setParsedDataState(parsedData);


		const weekId = `Week-${weekInfo || Date.now()}`;

		try {

			await saveWeekSchedule(weekId, parsedData, weekInfo);


			await setActiveWeek(weekId);


			localStorage.setItem('api-response-cache', JSON.stringify(data));
			localStorage.setItem('api-cache-timestamp', Date.now().toString());


			updateLastSyncTime();
			setLastSync(new Date());

			if (!silent) {
				showNotification(`Расписание на ${weekInfo || 'текущую неделю'} успешно загружено`, 'success');
			}

			return parsedData;
		} catch (error) {
			console.error('Ошибка при сохранении данных:', error);


			return parsedData;
		}
	}, [getWeekInfo, saveWeekSchedule, setActiveWeek, updateLastSyncTime, showNotification]);


	const fetchGoogleSheetData = useCallback(async (silent = false) => {

		if (!isOnlineMode) {
			return parsedDataState;
		}


		if (activeRequestRef.current) {
			return activeRequestRef.current;
		}


		if (isLoading) {
			return parsedDataState;
		}

		setIsLoading(true);
		setError(null);

		try {


			const requestPromise = getGoogleSheet();
			activeRequestRef.current = requestPromise;


			const data = await requestPromise;

			if (!data) {
				throw new Error('Не удалось получить данные расписания');
			}



			return await saveAndUpdateData(data, silent);
		} catch (error) {
			console.error('Ошибка при получении данных:', error);


			const apiCache = checkApiCache();
			if (apiCache) {

				try {

					return await saveAndUpdateData(apiCache.data, silent);
				} catch (cacheError) {
					console.error('Ошибка при использовании API-кэша:', cacheError);
				}
			}


			if (isCacheValid() && cachedSchedule) {
				console.log('Используем кэшированные данные после ошибки запроса');

				if (!silent) {
					const errorMessage = error instanceof Error ? error.message : 'Ошибка сети';
					showNotification(`Не удалось обновить данные: ${errorMessage}. Используются кэшированные данные.`, 'warning');
				}

				setError(null);
				return cachedSchedule;
			} else {

				const errorMessage = error instanceof Error ? error.message : 'Ошибка при загрузке данных';
				setError(errorMessage);

				if (!silent) {
					showNotification(`Ошибка: ${errorMessage}`, 'error');
				}

				return null;
			}
		} finally {
			setIsLoading(false);
			activeRequestRef.current = null;
		}
	}, [
		isOnlineMode,
		isLoading,
		parsedDataState,
		saveAndUpdateData,
		checkApiCache,
		isCacheValid,
		cachedSchedule,
		showNotification
	]);


	useEffect(() => {
		if (!parsedDataState && !initialFetchHandledRef.current && !isLoading) {
			console.log('Проверка API-кэша при инициализации');

			const apiCache = checkApiCache();
			if (apiCache) {
				console.log(`Найден API-кэш (возраст: ${Math.round(apiCache.age / (60 * 1000))} минут)`);


				initialFetchHandledRef.current = true;


				saveAndUpdateData(apiCache.data, true).then(() => {
					console.log('Данные из API-кэша успешно обработаны');
				}).catch(err => {
					console.error('Ошибка при обработке данных из API-кэша:', err);

					initialFetchHandledRef.current = false;
				});
			}
		}
	}, [parsedDataState, isLoading, checkApiCache, saveAndUpdateData]);


	useEffect(() => {

		if (appJustStartedRef.current && isOnlineMode && !initialFetchHandledRef.current && !isLoading) {
			appJustStartedRef.current = false;


			if (hasValidCache && !isCacheStale()) {
				console.log('Кэш действителен и свежий, пропускаем начальную загрузку');
				initialFetchHandledRef.current = true;
				return;
			}


			if (parsedDataState) {
				console.log('Данные уже загружены, пропускаем начальную загрузку');
				initialFetchHandledRef.current = true;
				return;
			}

			console.log('Выполняем начальную загрузку данных');


			const timer = setTimeout(() => {
				initialFetchHandledRef.current = true;
				fetchGoogleSheetData(true).catch(err => {
					console.error('Ошибка при начальной загрузке:', err);
				});
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [
		isOnlineMode,
		fetchGoogleSheetData,
		hasValidCache,
		isCacheStale,
		parsedDataState,
		isLoading
	]);

	return {
		isLoading,
		error,
		lastSync,
		parsedData: parsedDataState,
		fetchGoogleSheetData,
		resetError: () => setError(null),
		loadedDataInfo,
		isCacheStale: isCacheStale()
	};
}