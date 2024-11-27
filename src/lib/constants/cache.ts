export const CACHE_CONSTANTS = {
	KEYS: {
		SCHEDULE: 'schedule-cache',
	},
	VERSION: '1.0.0',
	LIFETIME: {
		SCHEDULE: 24 * 60 * 60 * 1000,
	},
} as const;