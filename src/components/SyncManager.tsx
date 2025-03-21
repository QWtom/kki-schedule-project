'use client';

import { useEffect, useRef } from 'react';
import { useAppMode } from '@/lib/hooks/useAppMode';
import { useGoogleSheets } from '@/lib/hooks/useGoogleSheets';

// Интервал автоматической синхронизации - 16 часов
const AUTO_SYNC_INTERVAL = 16 * 60 * 60 * 1000;

export function SyncManager() {
	const { isOnlineMode, isAutoSyncEnabled, lastSyncTime } = useAppMode();
	const { fetchGoogleSheetData, isLoading } = useGoogleSheets();
	const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const syncAttemptedRef = useRef(false);

	useEffect(() => {
		// Функция для настройки автосинхронизации
		const setupAutoSync = () => {
			if (!isOnlineMode || !isAutoSyncEnabled) return;

			// Избегаем множественных синхронизаций
			if (syncAttemptedRef.current && !lastSyncTime) return;

			// Очищаем предыдущий таймер, если он был
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
				syncTimeoutRef.current = null;
			}

			// Рассчитываем, когда должна произойти следующая синхронизация
			const now = Date.now();
			const nextSyncTime = lastSyncTime
				? lastSyncTime + AUTO_SYNC_INTERVAL
				: now + 30000; // При первом запуске отложим на 30 секунд

			// Если пора синхронизировать или прошло больше времени, чем интервал
			if (now >= nextSyncTime) {
				// Отмечаем, что попытка была сделана
				syncAttemptedRef.current = true;

				// Запускаем синхронизацию с небольшой задержкой
				syncTimeoutRef.current = setTimeout(() => {
					if (!isLoading) {
						console.log('Auto sync triggered');
						fetchGoogleSheetData(true).then(() => {
							// После успешной синхронизации планируем следующую
							syncTimeoutRef.current = setTimeout(setupAutoSync, AUTO_SYNC_INTERVAL);
						});
					} else {
						// Если загрузка уже идет, отложим проверку
						syncTimeoutRef.current = setTimeout(setupAutoSync, 60000);
					}
				}, 10000); // 10 секунд задержки
			} else {
				// Иначе планируем синхронизацию на нужное время
				const timeToNextSync = nextSyncTime - now;
				syncTimeoutRef.current = setTimeout(setupAutoSync, timeToNextSync);
			}
		};

		setupAutoSync();

		// Очищаем таймер при размонтировании компонента
		return () => {
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
			}
		};
	}, [isOnlineMode, isAutoSyncEnabled, lastSyncTime, fetchGoogleSheetData, isLoading]);

	// Компонент не отображает никакого UI
	return null;
}