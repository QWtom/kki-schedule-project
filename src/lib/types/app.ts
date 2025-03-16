// src/lib/types/app.ts
export type AppMode = 'online' | 'offline';

export interface AppSettings {
	mode: AppMode;
	lastSyncTime?: number; // Время последней синхронизации с API
	autoSyncEnabled: boolean; // Флаг для автоматической синхронизации
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
	mode: 'online',
	autoSyncEnabled: true
};