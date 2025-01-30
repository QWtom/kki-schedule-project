export const CACHE_CONSTANTS = {
	KEYS: {
		SCHEDULE: 'schedule-cache',
		WEEKS: 'schedule-weeks'
	},
	VERSION: '1.0.0',
	LIFETIME: {
		SCHEDULE: 3 * 24 * 60 * 60 * 1000,
	},
	MAX_STORED_WEEKS: 10
} as const;