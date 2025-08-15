import type { Result } from "../result";
import type { DonationsData } from "../donationsData";
import type {
  RemoteStore,
  Versioned,
  LoadError,
  SaveError,
  DeleteError,
} from "./remoteStore";
import { DonationsDataSchema } from "../donationsData";

const API_URL =
  "https://kpukc066rd.execute-api.us-west-2.amazonaws.com/prod/donations";

const API_KEY_STORAGE_KEY = "donations-api-key";

export const getApiKey = (): string | undefined => {
  const value = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (!value || value.trim() === "") {
    return undefined;
  }
  return value.trim();
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const clearApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export class WebApiStore implements RemoteStore<DonationsData> {
  private getHeaders(): Record<string, string> {
    const apiKey = getApiKey();
    return apiKey ? { "x-api-key": apiKey } : {};
  }

  async load(): Promise<
    Result<Versioned<DonationsData> | undefined, LoadError>
  > {
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (res.status === 401) return { kind: "error", value: "unauthorized" };
      if (res.status >= 500) return { kind: "error", value: "server-error" };
      if (!res.ok) return { kind: "error", value: "network-error" };

      const { data, etag } = await res.json();

      if (!data || !etag) return { kind: "success", value: undefined };

      try {
        const parsedData = DonationsDataSchema.parse(JSON.parse(data));
        return { kind: "success", value: { data: parsedData, etag } };
      } catch {
        return { kind: "error", value: "data-corruption" };
      }
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        return { kind: "error", value: "network-error" };
      }
      return { kind: "error", value: "network-error" };
    }
  }

  async save(
    data: DonationsData,
    etag?: string
  ): Promise<Result<Versioned<DonationsData>, SaveError>> {
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...this.getHeaders(),
        },
        body: JSON.stringify({ data: JSON.stringify(data), etag }),
      });

      if (res.status === 401) {
        return { kind: "error", value: "unauthorized" };
      }
      if (res.status === 412 || res.status === 409) {
        return { kind: "error", value: "etag-mismatch" };
      }
      if (res.status >= 500) {
        return { kind: "error", value: "server-error" };
      }
      if (!res.ok) {
        return { kind: "error", value: "network-error" };
      }

      // Return fresh data from server after successful save
      const loadResult = await this.load();
      if (loadResult.kind === "error") {
        return { kind: "error", value: loadResult.value as SaveError };
      }

      if (!loadResult.value) {
        // This shouldn't happen after a successful save
        return { kind: "error", value: "server-error" };
      }

      return { kind: "success", value: loadResult.value };
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        return { kind: "error", value: "network-error" };
      }
      return { kind: "error", value: "network-error" };
    }
  }

  async delete(): Promise<Result<void, DeleteError>> {
    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...this.getHeaders(),
        },
        body: JSON.stringify({}),
      });

      if (res.status === 401) return { kind: "error", value: "unauthorized" };
      if (res.status >= 500) return { kind: "error", value: "server-error" };
      if (res.status === 404) return { kind: "success", value: undefined };
      if (!res.ok) return { kind: "error", value: "network-error" };

      return { kind: "success", value: undefined };
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        return { kind: "error", value: "network-error" };
      }
      return { kind: "error", value: "network-error" };
    }
  }
}
