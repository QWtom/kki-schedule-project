'use client';

import { useEffect, useRef } from 'react';
import { useAppMode } from '@/lib/hooks/useAppMode';
import { useGoogleSheets } from '@/lib/hooks/useGoogleSheets';

const AUTO_SYNC_INTERVAL = 16 * 60 * 60 * 1000;

export function SyncManager() {
	const { isOnlineMode, isAutoSyncEnabled, lastSyncTime } = useAppMode();
	const { fetchGoogleSheetData, isLoading } = useGoogleSheets();
	const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const syncAttemptedRef = useRef(false);

	useEffect(() => {

		const setupAutoSync = () => {
			if (!isOnlineMode || !isAutoSyncEnabled) return;


			if (syncAttemptedRef.current && !lastSyncTime) return;


			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
				syncTimeoutRef.current = null;
			}

			const now = Date.now();
			const nextSyncTime = lastSyncTime
				? lastSyncTime + AUTO_SYNC_INTERVAL
				: now + 30000;


			if (now >= nextSyncTime) {

				syncAttemptedRef.current = true;


				syncTimeoutRef.current = setTimeout(() => {
					if (!isLoading) {
						console.log('Auto sync triggered');
						fetchGoogleSheetData(true).then(() => {

							syncTimeoutRef.current = setTimeout(setupAutoSync, AUTO_SYNC_INTERVAL);
						});
					} else {

						syncTimeoutRef.current = setTimeout(setupAutoSync, 60000);
					}
				}, 10000);
			} else {

				const timeToNextSync = nextSyncTime - now;
				syncTimeoutRef.current = setTimeout(setupAutoSync, timeToNextSync);
			}
		};

		setupAutoSync();


		return () => {
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
			}
		};
	}, [isOnlineMode, isAutoSyncEnabled, lastSyncTime, fetchGoogleSheetData, isLoading]);


	return null;
}