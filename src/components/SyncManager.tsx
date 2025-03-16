// src/components/SyncManager.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAppMode } from '@/lib/hooks/useAppMode';
import { useGoogleSheets } from '@/lib/hooks/useGoogleSheets';

// Интервал автоматической синхронизации - 16 часов
const AUTO_SYNC_INTERVAL = 16 * 60 * 60 * 1000;

export function SyncManager() {
	const { isOnlineMode, isAutoSyncEnabled, lastSyncTime } = useAppMode();
	const { fetchGoogleSheetData } = useGoogleSheets();
	const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Функция для настройки автосинхронизации
		const setupAutoSync = () => {
			if (!isOnlineMode || !isAutoSyncEnabled) return;

			// Очищаем предыдущий таймер, если он был
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
				syncTimeoutRef.current = null;
			}

			// Рассчитываем, когда должна произойти следующая синхронизация
			const now = Date.now();
			const nextSyncTime = lastSyncTime
				? lastSyncTime + AUTO_SYNC_INTERVAL
				: now;

			// Если пора синхронизировать или прошло больше времени, чем интервал
			if (now >= nextSyncTime) {
				// Запускаем синхронизацию сразу
				fetchGoogleSheetData(true).then(() => {
					// После успешной синхронизации планируем следующую
					syncTimeoutRef.current = setTimeout(setupAutoSync, AUTO_SYNC_INTERVAL);
				});
			} else {
				// Иначе планируем синхронизацию на нужное время
				const timeToNextSync = nextSyncTime - now;
				syncTimeoutRef.current = setTimeout(() => {
					fetchGoogleSheetData(true).then(() => {
						// После успешной синхронизации планируем следующую
						syncTimeoutRef.current = setTimeout(setupAutoSync, AUTO_SYNC_INTERVAL);
					});
				}, timeToNextSync);
			}
		};

		setupAutoSync();

		// Очищаем таймер при размонтировании компонента
		return () => {
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
			}
		};
	}, [isOnlineMode, isAutoSyncEnabled, lastSyncTime, fetchGoogleSheetData]);

	// Компонент не отображает никакого UI
	return null;
}