import type { DonationsData } from "../types";

export interface CachedData {
  data: DonationsData;
  etag: string;
}

/**
 * StorageProvider implements a 2-layer storage architecture:
 * 1. Remote storage (slow, persistent) - server/database/file system
 * 2. Local cache (fast, temporary) - in-memory or browser storage
 *
 * Note: sessionStorage provider is for development/testing and simulates
 * remote storage locally.
 */
export interface StorageProvider {
  // Retrieves cached data without making a network request. Returns undefined
  // if no cached data exists or the data cannot be successfully parsed and
  // validated.
  getCachedData(): CachedData | undefined;

  // Bypasses cache and loads data from remote storage, updating the local cache.
  // Always makes a network request (or simulates one for testing providers).
  // Returns empty data structure if no data exists.
  // Throws error on network failures or corrupted data.
  refreshFromRemote(): Promise<CachedData>;

  // Saves data to remote storage with ETag validation. Returns fresh data from
  // remote storage after successful save. Promise fails if ETag mismatch,
  // remote storage cannot be accessed, or other fatal errors.
  save(data: DonationsData, etag: string): Promise<CachedData>;

  // Deletes all data from remote storage with ETag validation. Clears local cache.
  // Idempotent operation: succeeds if data already deleted. Only throws error
  // if ETag mismatch or remote storage cannot be accessed.
  delete(etag: string): Promise<void>;

  // Clears only the local cache without affecting remote storage.
  clearCache(): void;
}
