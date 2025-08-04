import type { Result, DonationsData } from "../types";
import type {
  RemoteStore,
  Versioned,
  LoadError,
  SaveError,
  DeleteError,
} from "./remoteStore";
import { DonationsDataSchema } from "../types";

const API_URL =
  "https://kpukc066rd.execute-api.us-west-2.amazonaws.com/prod/donations";
const SHARED_SECRET = "MY_SHARED_SECRET";

export class WebApiStore implements RemoteStore<DonationsData> {
  async load(): Promise<Result<Versioned<DonationsData> | undefined, LoadError>> {
    console.log("WebApiStore: Starting load(), fetching from:", API_URL);

    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "x-api-key": SHARED_SECRET,
        },
      });

      console.log("WebApiStore: Fetch response status:", res.status, res.statusText);

      if (res.status === 401) {
        return { kind: "error", value: "unauthorized" };
      }

      if (res.status >= 500) {
        return { kind: "error", value: "server-error" };
      }

      if (!res.ok) {
        console.error("WebApiStore: Fetch failed with status:", res.status);
        return { kind: "error", value: "network-error" };
      }

      const { data, etag } = await res.json();
      console.log("WebApiStore: Received data length:", data?.length, "etag:", etag);

      if (!data || !etag) {
        return { kind: "success", value: undefined };
      }

      try {
        const parsedData = DonationsDataSchema.parse(JSON.parse(data));
        return { kind: "success", value: { data: parsedData, etag } };
      } catch (parseError) {
        console.error("WebApiStore: Data parsing error:", parseError);
        return { kind: "error", value: "data-corruption" };
      }
    } catch (error) {
      console.error("WebApiStore: Error in load():", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        return { kind: "error", value: "network-error" };
      }
      return { kind: "error", value: "network-error" };
    }
  }

  async save(data: DonationsData, etag?: string): Promise<Result<Versioned<DonationsData>, SaveError>> {
    console.log("WebApiStore: Starting save with ETag:", etag);

    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SHARED_SECRET,
        },
        body: JSON.stringify({ data: JSON.stringify(data), etag }),
      });

      console.log("WebApiStore: Save response status:", res.status, res.statusText);

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
      console.error("WebApiStore: Error in save():", error);
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
    console.log("WebApiStore: Starting delete");

    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SHARED_SECRET,
        },
        body: JSON.stringify({}),
      });

      console.log("WebApiStore: Delete response status:", res.status, res.statusText);

      if (res.status === 401) {
        return { kind: "error", value: "unauthorized" };
      }

      if (res.status >= 500) {
        return { kind: "error", value: "server-error" };
      }

      if (res.status === 404) {
        // File not found - treat as success (idempotent delete)
        console.log("WebApiStore: Delete successful (file already deleted)");
        return { kind: "success", value: undefined };
      }

      if (!res.ok) {
        return { kind: "error", value: "network-error" };
      }

      console.log("WebApiStore: Delete successful");
      return { kind: "success", value: undefined };
    } catch (error) {
      console.error("WebApiStore: Error in delete():", error);
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