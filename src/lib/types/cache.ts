import { ParsedSchedule } from "./shedule";

export interface CacheMetadata {
  lastUpdated: number;
  version: string;
  source?: 'api' | 'file';
  hash?: string;
}

export interface CacheData {
  data: ParsedSchedule;
  metadata: CacheMetadata;
}

export interface CacheEntry<T> {
  data: T;
  metadata: {
    lastUpdated: number;
    version: string;
    source?: 'api' | 'file';
    hash?: string;
  };
}

export type ScheduleCache = CacheData;
export type StorageValue<T> = T | null;
export type StorageSetValue<T> = (value: T | ((val: T | null) => T)) => void;