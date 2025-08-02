import type { DonationsData } from "../types";
import type { StorageProvider, CachedData } from "./interface";
import { DonationsDataSchema } from "../types";
import { tryCreateSampleData } from "../donationsData";

export class SessionStorageProvider implements StorageProvider {
  private readonly STORAGE_KEY = "donationsData";
  private readonly ETAG_KEY = "donationsDataEtag";

  getCachedData(): CachedData | undefined {
    const dataStr = sessionStorage.getItem(this.STORAGE_KEY);
    const etag = sessionStorage.getItem(this.ETAG_KEY);

    if (!dataStr || !etag) {
      return undefined;
    }

    try {
      const data = DonationsDataSchema.parse(JSON.parse(dataStr));
      return { data, etag };
    } catch {
      return undefined;
    }
  }

  async loadFresh(): Promise<CachedData> {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = tryCreateSampleData();
    const etag = this.generateEtag(data);

    this.cacheData(data, etag);
    return { data, etag };
  }

  async save(data: DonationsData, etag: string): Promise<CachedData> {
    const cached = this.getCachedData();
    if (cached && cached.etag !== etag) {
      throw new Error("ETag mismatch: data has changed locally.");
    }

    await new Promise((resolve) => setTimeout(resolve, 50));

    const newEtag = this.generateEtag(data);
    this.cacheData(data, newEtag);

    return { data, etag: newEtag };
  }

  clearCache(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.ETAG_KEY);
  }

  private cacheData(data: DonationsData, etag: string): void {
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
