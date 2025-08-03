import type { Result } from "../types";

export interface Versioned<T> {
  data: T;
  etag: string;
}

export type LoadError =
  | "network-error" // Network/connectivity issues
  | "unauthorized" // 401 API key mismatch
  | "server-error" // 500 S3/server failures
  | "data-corruption"; // Parsing/validation errors

export type SaveError =
  | "network-error" // Network/connectivity issues
  | "unauthorized" // 401 API key mismatch
  | "etag-mismatch" // 409 conflict detection
  | "server-error"; // 500 S3/server failures

export type DeleteError =
  | "network-error" // Network/connectivity issues
  | "unauthorized" // 401 API key mismatch
  | "server-error"; // 500 S3/server failures

export interface RemoteStore<T> {
  // Returns server data if it exists; otherwise undefined
  load(): Promise<Result<Versioned<T> | undefined, LoadError>>;

  // Creates new server data if none exists (etag parameter ignored)
  // Updates existing server data only if etag matches current server version
  // Returns etag-mismatch error if server data exists but provided etag doesn't match
  save(data: T, etag?: string): Promise<Result<Versioned<T>, SaveError>>;

  // Deletes server data completely - used for corruption recovery
  delete(): Promise<Result<void, DeleteError>>;
}
