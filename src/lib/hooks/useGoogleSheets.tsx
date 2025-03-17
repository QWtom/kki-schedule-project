// src/lib/hooks/useGoogleSheets.tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { getGoogleSheet } from '@/app/api/googlesheets/googleapi';
import { useNotification } from '@/lib/context/NotificationContext';
import { useAppMode } from './useAppMode';
import { useScheduleCache } from './useScheduleCache';
import { parseGoogleSheetData } from '@/lib/utils/parseGoogleSheetData';
import { ParsedSchedule } from '@/lib/types/shedule';

// Константы для управления кэшем
const CACHE_VALIDITY_PERIOD = 24 * 60 * 60 * 1000; // 24 часа
const CACHE_UPDATE_THRESHOLD = 8 * 60 * 60 * 1000; // 8 часов

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

	// Рефы для отслеживания состояния
	const initialFetchHandledRef = useRef(false);
	const appJustStartedRef = useRef(true);
	const activeRequestRef = useRef<Promise<any> | null>(null);

	// Инициализируем данные из кэша при загрузке
	useEffect(() => {
		// Если есть кэшированное расписание, но нет данных в состоянии - инициализируем из кэша
		if (hasValidCache && cachedSchedule && !parsedDataState) {
			console.log('Инициализация данных из кэша расписаний');
			setParsedDataState(cachedSchedule);

			if (metadata?.scheduleInfo) {
				setLoadedDataInfo(metadata.scheduleInfo);
			}

			if (metadata?.lastUpdated) {
				setLastSync(new Date(metadata.lastUpdated));
			}

			// Отмечаем, что первоначальная загрузка выполнена
			initialFetchHandledRef.current = true;
		}
	}, [hasValidCache, cachedSchedule, metadata, parsedDataState]);

	// Проверяем свежесть кэша
	const isCacheStale = useCallback(() => {
		if (!metadata || !metadata.lastUpdated) return true;

		const now = Date.now();
		const cacheAge = now - metadata.lastUpdated;
		return cacheAge > CACHE_UPDATE_THRESHOLD;
	}, [metadata]);

	// Проверяем действительность кэша
	const isCacheValid = useCallback(() => {
		if (!metadata || !metadata.lastUpdated) return false;

		const now = Date.now();
		const cacheAge = now - metadata.lastUpdated;
		return cacheAge <= CACHE_VALIDITY_PERIOD;
	}, [metadata]);

	// Проверка API-кэша в localStorage
	const checkApiCache = useCallback(() => {
		try {
			const cacheData = localStorage.getItem('api-response-cache');
			const cacheTimestamp = localStorage.getItem('api-cache-timestamp');

			if (!cacheData || !cacheTimestamp) return null;

			const cacheAge = Date.now() - parseInt(cacheTimestamp);

			// Если кэш старше 24 часов, считаем его невалидным
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

	// Получение информации о неделе из данных
	const getWeekInfo = useCallback((data: any): string | any => {
		try {
			if (!data || !data.data) return null;

			// Ищем информацию о неделе в первом листе
			const firstSheet = Object.keys(data.data)[0];
			if (!firstSheet) return null;

			const sheetData = data.data[firstSheet];

			// Проверяем строки 3-6, где обычно указывается информация о неделе
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

	// Сохранение в кэш и обновление состояния
	const saveAndUpdateData = useCallback(async (data: any, silent: boolean) => {
		// Получаем информацию о неделе
		const weekInfo = getWeekInfo(data);
		setLoadedDataInfo(weekInfo);

		// Парсим данные
		const parsedData = parseGoogleSheetData(data);

		// Обновляем состояние
		setParsedDataState(parsedData);

		// Создаем ID недели
		const weekId = `Week-${weekInfo || Date.now()}`;

		try {
			// Сохраняем в кэш
			await saveWeekSchedule(weekId, parsedData, weekInfo);

			// Устанавливаем активную неделю
			await setActiveWeek(weekId);

			// Сохраняем в API-кэш
			localStorage.setItem('api-response-cache', JSON.stringify(data));
			localStorage.setItem('api-cache-timestamp', Date.now().toString());

			// Обновляем время синхронизации
			updateLastSyncTime();
			setLastSync(new Date());

			if (!silent) {
				showNotification(`Расписание на ${weekInfo || 'текущую неделю'} успешно загружено`, 'success');
			}

			return parsedData;
		} catch (error) {
			console.error('Ошибка при сохранении данных:', error);

			// Даже если сохранение не удалось, возвращаем распарсенные данные
			return parsedData;
		}
	}, [getWeekInfo, saveWeekSchedule, setActiveWeek, updateLastSyncTime, showNotification]);

	// Функция для получения данных с Google Sheets
	const fetchGoogleSheetData = useCallback(async (silent = false) => {
		// Не выполняем запрос в оффлайн-режиме
		if (!isOnlineMode) {
			console.log('Оффлайн режим, запрос не выполняется');
			return parsedDataState;
		}

		// Проверяем, нет ли уже активного запроса
		if (activeRequestRef.current) {
			console.log('Запрос уже выполняется, ожидаем его завершения');
			return activeRequestRef.current;
		}

		// Проверяем, не выполняется ли уже загрузка
		if (isLoading) {
			console.log('Загрузка уже в процессе, запрос пропущен');
			return parsedDataState;
		}

		setIsLoading(true);
		setError(null);

		try {
			console.log('Выполняем запрос к API');

			// Создаем и сохраняем промис запроса
			const requestPromise = getGoogleSheet();
			activeRequestRef.current = requestPromise;

			// Выполняем запрос
			const data = await requestPromise;

			if (!data) {
				throw new Error('Не удалось получить данные расписания');
			}

			console.log('Данные получены, обрабатываем');

			// Сохраняем и обновляем данные
			return await saveAndUpdateData(data, silent);
		} catch (error) {
			console.error('Ошибка при получении данных:', error);

			// Проверяем API-кэш
			const apiCache = checkApiCache();
			if (apiCache) {
				console.log('Используем API-кэш после ошибки');

				try {
					// Используем данные из API-кэша
					return await saveAndUpdateData(apiCache.data, silent);
				} catch (cacheError) {
					console.error('Ошибка при использовании API-кэша:', cacheError);
				}
			}

			// Если API-кэш не помог, пробуем кэш из useScheduleCache
			if (isCacheValid() && cachedSchedule) {
				console.log('Используем кэшированные данные после ошибки запроса');

				if (!silent) {
					const errorMessage = error instanceof Error ? error.message : 'Ошибка сети';
					showNotification(`Не удалось обновить данные: ${errorMessage}. Используются кэшированные данные.`, 'warning');
				}

				setError(null);
				return cachedSchedule;
			} else {
				// Если нет никакого валидного кэша, возвращаем ошибку
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

	// Инициализация из API-кэша при первой загрузке
	useEffect(() => {
		if (!parsedDataState && !initialFetchHandledRef.current && !isLoading) {
			console.log('Проверка API-кэша при инициализации');

			const apiCache = checkApiCache();
			if (apiCache) {
				console.log(`Найден API-кэш (возраст: ${Math.round(apiCache.age / (60 * 1000))} минут)`);

				// Устанавливаем флаг, чтобы другие эффекты не делали запрос
				initialFetchHandledRef.current = true;

				// Обрабатываем данные из кэша
				saveAndUpdateData(apiCache.data, true).then(() => {
					console.log('Данные из API-кэша успешно обработаны');
				}).catch(err => {
					console.error('Ошибка при обработке данных из API-кэша:', err);
					// Сбрасываем флаг, чтобы другие эффекты могли попытаться загрузить данные
					initialFetchHandledRef.current = false;
				});
			}
		}
	}, [parsedDataState, isLoading, checkApiCache, saveAndUpdateData]);

	// Автоматическая загрузка при инициализации
	useEffect(() => {
		// Выполняем только один раз при загрузке приложения
		if (appJustStartedRef.current && isOnlineMode && !initialFetchHandledRef.current && !isLoading) {
			appJustStartedRef.current = false;

			// Проверяем кэш
			if (hasValidCache && !isCacheStale()) {
				console.log('Кэш действителен и свежий, пропускаем начальную загрузку');
				initialFetchHandledRef.current = true;
				return;
			}

			// Если у нас уже есть данные, не делаем запрос
			if (parsedDataState) {
				console.log('Данные уже загружены, пропускаем начальную загрузку');
				initialFetchHandledRef.current = true;
				return;
			}

			console.log('Выполняем начальную загрузку данных');

			// Добавляем небольшую задержку перед первым запросом
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