import type { DonationsData, Result } from "../types";
import type { StorageProvider, CachedData, StorageError } from "./interface";
import { DonationsDataSchema } from "../types";
import { empty } from "../donationsData";
import { success, error } from "../result";

export class SessionStorageProvider implements StorageProvider {
  private readonly STORAGE_KEY = "donationsData";
  private readonly ETAG_KEY = "donationsDataEtag";
  private cachedData: CachedData | undefined = undefined;

  getCachedData(): CachedData | undefined {
    return this.cachedData;
  }

  async refreshFromRemote(): Promise<Result<CachedData, StorageError>> {
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
      } catch (parseError) {
        // Corrupted data in sessionStorage
        return error({
          kind: "data-corruption",
          message:
            "Corrupted data in sessionStorage: " +
            (parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error"),
        });
      }
    } else {
      // No data in sessionStorage - return empty data structure
      data = empty();
      finalEtag = this.generateEtag(data);
      this.saveToSessionStorage(data, finalEtag);
    }

    this.cachedData = { data, etag: finalEtag };
    return success(this.cachedData);
  }

  async save(
    data: DonationsData,
    etag: string,
  ): Promise<Result<CachedData, StorageError>> {
    console.log("Trying session storage saving");

    // Check ETag against sessionStorage (remote storage)
    const storedEtag = sessionStorage.getItem(this.ETAG_KEY);
    if (storedEtag && storedEtag !== etag) {
      return error({ kind: "etag-mismatch" });
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newEtag = this.generateEtag(data);

    // Save to sessionStorage (remote storage)
    this.saveToSessionStorage(data, newEtag);

    // Refresh from remote to ensure consistency (like webApi)
    return await this.refreshFromRemote();
  }

  async delete(etag: string): Promise<Result<void, StorageError>> {
    // Check current ETag against sessionStorage (remote storage)
    const storedEtag = sessionStorage.getItem(this.ETAG_KEY);

    if (!storedEtag) {
      // No data exists - treat as success (idempotent delete)
      this.cachedData = undefined;
      return success(undefined);
    }

    if (etag !== storedEtag) {
      return error({ kind: "etag-mismatch" });
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Delete from sessionStorage (remote storage)
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.ETAG_KEY);

    // Clear in-memory cache
    this.cachedData = undefined;

    return success(undefined);
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
