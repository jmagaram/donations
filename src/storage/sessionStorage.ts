import type { DonationsData } from "../types";
import type { StorageProvider, CachedData } from "./interface";
import { DonationsDataSchema } from "../types";
import { empty } from "../donationsData";

export class SessionStorageProvider implements StorageProvider {
  private readonly STORAGE_KEY = "donationsData";
  private readonly ETAG_KEY = "donationsDataEtag";
  private cachedData: CachedData | undefined = undefined;

  getCachedData(): CachedData | undefined {
    return this.cachedData;
  }

  async refreshFromRemote(): Promise<CachedData> {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Try to load from sessionStorage
    const dataStr = sessionStorage.getItem(this.STORAGE_KEY);
    const etag = sessionStorage.getItem(this.ETAG_KEY);

    let data: DonationsData;
    let finalEtag: string;

    if (dataStr && etag) {
      try {
        data = DonationsDataSchema.parse(JSON.parse(dataStr));
        finalEtag = etag;
      } catch (error) {
        // Corrupted data in sessionStorage - throw error instead of auto-healing
        throw new Error(
          "Corrupted data in sessionStorage: " +
            (error instanceof Error ? error.message : "Unknown parsing error"),
        );
      }
    } else {
      // No data in sessionStorage - return empty data structure
      data = empty();
      finalEtag = this.generateEtag(data);
      this.saveToSessionStorage(data, finalEtag);
    }

    this.cachedData = { data, etag: finalEtag };
    return this.cachedData;
  }

  async save(data: DonationsData, etag: string): Promise<CachedData> {
    // Check ETag against sessionStorage (remote storage)
    const storedEtag = sessionStorage.getItem(this.ETAG_KEY);
    if (storedEtag && storedEtag !== etag) {
      throw new Error("ETag mismatch: data has changed locally.");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newEtag = this.generateEtag(data);

    // Save to sessionStorage (remote storage)
    this.saveToSessionStorage(data, newEtag);

    // Refresh from remote to ensure consistency (like webApi)
    return await this.refreshFromRemote();
  }

  async delete(etag: string): Promise<void> {
    // Check current ETag against sessionStorage (remote storage)
    const storedEtag = sessionStorage.getItem(this.ETAG_KEY);

    if (!storedEtag) {
      // No data exists - treat as success (idempotent delete)
      this.cachedData = undefined;
      return;
    }

    if (etag !== storedEtag) {
      throw new Error("ETag mismatch: data has changed locally.");
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Delete from sessionStorage (remote storage)
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.ETAG_KEY);

    // Clear in-memory cache
    this.cachedData = undefined;
  }

  clearCache(): void {
    // Only clear in-memory cache, leave sessionStorage (remote storage) intact
    this.cachedData = undefined;
  }

  private saveToSessionStorage(data: DonationsData, etag: string): void {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem(this.ETAG_KEY, etag);
  }

  private generateEtag(data: DonationsData): string {
    const hash = this.hashString(JSON.stringify(data));
    return `"${hash}-${Date.now()}"`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}
