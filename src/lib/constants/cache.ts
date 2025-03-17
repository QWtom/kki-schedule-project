// src/lib/constants/cache.ts
export const CACHE_CONSTANTS = {
	KEYS: {
		SCHEDULE: 'schedule-cache',
		WEEKS: 'schedule-weeks',
		SETTINGS: 'app-settings'
	},
	VERSION: '1.1.0',  // Увеличиваем версию
	LIFETIME: {
		SCHEDULE: 24 * 60 * 60 * 1000,  // 24 часа
		STALE: 8 * 60 * 60 * 1000,      // 8 часов до обновления
	},
	MAX_STORED_WEEKS: 10
} as const;