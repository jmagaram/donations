import type { DonationsData } from "../types";
import type { StorageProvider, CachedData } from "./interface";
import { DonationsDataSchema } from "../types";

const API_URL =
  "https://kpukc066rd.execute-api.us-west-2.amazonaws.com/prod/donations";
const SHARED_SECRET = "MY_SHARED_SECRET";

export class WebApiProvider implements StorageProvider {
  private cachedData: CachedData | undefined = undefined;

  getCachedData(): CachedData | undefined {
    return this.cachedData;
  }

  async refreshFromRemote(): Promise<CachedData> {
    console.log("WebApi: Starting loadFresh(), fetching from:", API_URL);

    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "x-api-key": SHARED_SECRET,
        },
      });

      console.log("WebApi: Fetch response status:", res.status, res.statusText);

      if (!res.ok) {
        console.error("WebApi: Fetch failed with status:", res.status);
        throw new Error(`API request failed: ${res.status} ${res.statusText}`);
      }

      const { data, etag } = await res.json();
      console.log("WebApi: Received data length:", data?.length, "etag:", etag);

      const parsedData = data
        ? DonationsDataSchema.parse(JSON.parse(data))
        : { orgs: [], donations: [] };

      this.cachedData = { data: parsedData, etag: etag || "" };
      console.log("WebApi: Successfully cached data, ETag:", etag);
      return this.cachedData;
    } catch (error) {
      console.error("WebApi: Error in loadFresh():", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error: Could not connect to API. Check CORS settings.",
        );
      }
      throw error;
    }
  }

  async save(data: DonationsData, etag: string): Promise<CachedData> {
    console.log("WebApi: Starting save with ETag:", etag);

    const res = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SHARED_SECRET,
      },
      body: JSON.stringify({ data: JSON.stringify(data), etag }),
    });

    console.log("WebApi: Save response status:", res.status, res.statusText);

    if (res.status === 412) {
      throw new Error("ETag mismatch: data has changed on the server.");
    }
    if (res.status === 409) {
      throw new Error("ETag mismatch: conflict detected by server.");
    }
    if (!res.ok) {
      throw new Error(`Failed to save: ${res.status}`);
    }

    return await this.refreshFromRemote();
  }

  async delete(etag: string): Promise<void> {
    console.log("WebApi: Starting delete with ETag:", etag);

    const res = await fetch(API_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SHARED_SECRET,
      },
      body: JSON.stringify({ etag }),
    });

    console.log("WebApi: Delete response status:", res.status, res.statusText);

    if (res.status === 409) {
      throw new Error("ETag mismatch: conflict detected by server.");
    }
    if (res.status === 404) {
      // File not found - treat as success (idempotent delete)
      this.clearCache();
      console.log("WebApi: Delete successful (file already deleted), cache cleared");
      return;
    }
    if (!res.ok) {
      throw new Error(`Failed to delete: ${res.status}`);
    }

    // Clear cache since data no longer exists
    this.clearCache();
    console.log("WebApi: Delete successful, cache cleared");
  }

  clearCache(): void {
    this.cachedData = undefined;
  }
}
