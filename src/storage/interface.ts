import type { DonationsData } from "../types";

export interface CachedData {
  data: DonationsData;
  etag: string;
}

export interface StorageProvider {
  getCachedData(): CachedData | undefined;
  loadFresh(): Promise<CachedData>;
  save(data: DonationsData, etag: string): Promise<CachedData>;
  clearCache(): void;
}