import type { DonationsData } from "../types";
import type { StorageProvider, CachedData } from "./interface";
import { DonationsDataSchema } from "../types";

const API_URL = "https://kpukc066rd.execute-api.us-west-2.amazonaws.com/prod/donations";
const SHARED_SECRET = "MY_SHARED_SECRET";

export class WebApiProvider implements StorageProvider {
  private cachedData: CachedData | undefined = undefined;

  getCachedData(): CachedData | undefined {
    return this.cachedData;
  }

  async loadFresh(): Promise<CachedData> {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "x-api-key": SHARED_SECRET,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to load: ${res.status}`);
    }

    const { data, etag } = await res.json();
    const parsedData = DonationsDataSchema.parse(JSON.parse(data));
    
    this.cachedData = { data: parsedData, etag };
    return this.cachedData;
  }

  async save(data: DonationsData, etag: string): Promise<CachedData> {
    const res = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SHARED_SECRET,
        "If-Match": etag,
      },
      body: JSON.stringify(data),
    });

    if (res.status === 412) {
      throw new Error("ETag mismatch: data has changed on the server.");
    }
    if (!res.ok) {
      throw new Error(`Failed to save: ${res.status}`);
    }

    return await this.loadFresh();
  }

  clearCache(): void {
    this.cachedData = undefined;
  }
}