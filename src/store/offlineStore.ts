import type { Result } from "../types";
import type {
  RemoteStore,
  LoadError,
  SaveError,
  DeleteError,
} from "./remoteStore";

export type SyncError = "network-error" | "etag-mismatch" | "other";

export type SyncStatus =
  | { kind: "idle"; requiresSync: boolean }
  | { kind: "syncing" }
  | { kind: "error"; error: SyncError };

export type DataState<T> =
  | { kind: "new"; data: T }
  | { kind: "unchanged"; data: T }
  | { kind: "modified"; data: T };

export interface StorageState<T> {
  data: DataState<T>;
  status: SyncStatus;
}

export interface OfflineStore<T> {
  save(data: T): void;
  getState(): StorageState<T>;
  sync(option: "pull" | "pushThenPull"): Promise<Result<void, SyncError>>;
  delete(): Promise<Result<void, SyncError>>;
  onChange(callback: (state: StorageState<T>) => void): () => void;
}

export class OfflineStoreImpl<T> implements OfflineStore<T> {
  private readonly remoteStore: RemoteStore<T>;
  private readonly emptyData: T;
  private cachedData: DataState<T>;
  private syncStatus: SyncStatus;
  private callbacks: ((state: StorageState<T>) => void)[] = [];
  private currentEtag: string | undefined;

  constructor(remoteStore: RemoteStore<T>, emptyData: T) {
    this.remoteStore = remoteStore;
    this.emptyData = emptyData;
    this.syncStatus = { kind: "idle", requiresSync: false };
    this.cachedData = { kind: "new", data: emptyData };
  }

  save(data: T): void {
    // Update local cache immediately
    this.cachedData = { kind: "modified", data };
    this.syncStatus = { kind: "idle", requiresSync: true };

    this.notifyCallbacks();

    // Trigger automatic sync
    this.performSync();
  }

  getState(): StorageState<T> {
    return {
      data: this.cachedData,
      status: this.syncStatus,
    };
  }

  async sync(
    option: "pull" | "pushThenPull",
  ): Promise<Result<void, SyncError>> {
    if (this.syncStatus.kind === "syncing") {
      return { kind: "error", value: "other" };
    }

    return this.performSyncWithOption(option);
  }

  async delete(): Promise<Result<void, SyncError>> {
    if (this.syncStatus.kind === "syncing") {
      return { kind: "error", value: "other" };
    }

    this.syncStatus = { kind: "syncing" };
    this.notifyCallbacks();

    try {
      const deleteResult = await this.remoteStore.delete();

      if (deleteResult.kind === "error") {
        const syncError = this.mapDeleteErrorToSyncError(deleteResult.value);
        this.syncStatus = {
          kind: "error",
          error: syncError,
        };
        this.notifyCallbacks();
        return { kind: "error", value: syncError };
      }

      // Clear local state after successful delete
      this.cachedData = { kind: "new", data: this.emptyData };
      this.currentEtag = undefined;
      this.syncStatus = { kind: "idle", requiresSync: false };
      this.notifyCallbacks();

      return { kind: "success", value: undefined };
    } catch {
      this.syncStatus = {
        kind: "error",
        error: "other",
      };
      this.notifyCallbacks();
      return { kind: "error", value: "other" };
    }
  }

  onChange(callback: (state: StorageState<T>) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index >= 0) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  private async performSync(): Promise<void> {
    if (this.cachedData.kind === "new" || this.cachedData.kind === "modified") {
      await this.performSyncWithOption("pushThenPull");
    } else {
      await this.performSyncWithOption("pull");
    }
  }

  private async performSyncWithOption(
    option: "pull" | "pushThenPull",
  ): Promise<Result<void, SyncError>> {
    this.syncStatus = { kind: "syncing" };
    this.notifyCallbacks();

    try {
      if (
        option === "pushThenPull" &&
        (this.cachedData.kind === "new" || this.cachedData.kind === "modified")
      ) {
        // Push local changes
        const saveResult = await this.remoteStore.save(
          this.cachedData.data,
          this.currentEtag,
        );

        if (saveResult.kind === "error") {
          const syncError = this.mapSaveErrorToSyncError(saveResult.value);
          this.syncStatus = {
            kind: "error",
            error: syncError,
          };
          this.notifyCallbacks();
          return { kind: "error", value: syncError };
        }

        // Update local state with new etag
        this.currentEtag = saveResult.value.etag;
        this.cachedData = {
          kind: "unchanged",
          data: saveResult.value.data,
        };
      } else {
        // Pull from remote
        const loadResult = await this.remoteStore.load();

        if (loadResult.kind === "error") {
          const syncError = this.mapLoadErrorToSyncError(loadResult.value);
          this.syncStatus = {
            kind: "error",
            error: syncError,
          };
          this.notifyCallbacks();
          return { kind: "error", value: syncError };
        }

        if (loadResult.value) {
          this.currentEtag = loadResult.value.etag;
          this.cachedData = {
            kind: "unchanged",
            data: loadResult.value.data,
          };
        }
      }

      this.syncStatus = {
        kind: "idle",
        requiresSync: false,
      };
      this.notifyCallbacks();

      return { kind: "success", value: undefined };
    } catch {
      this.syncStatus = {
        kind: "error",
        error: "other",
      };
      this.notifyCallbacks();

      return { kind: "error", value: "other" };
    }
  }

  private notifyCallbacks(): void {
    const state = this.getState();
    this.callbacks.forEach((callback) => callback(state));
  }

  private mapLoadErrorToSyncError(loadError: LoadError): SyncError {
    switch (loadError) {
      case "network-error":
        return "network-error";
      case "unauthorized":
      case "server-error":
      case "data-corruption":
        return "other";
    }
  }

  private mapSaveErrorToSyncError(saveError: SaveError): SyncError {
    switch (saveError) {
      case "network-error":
        return "network-error";
      case "etag-mismatch":
        return "etag-mismatch";
      case "unauthorized":
      case "server-error":
        return "other";
    }
  }

  private mapDeleteErrorToSyncError(deleteError: DeleteError): SyncError {
    switch (deleteError) {
      case "network-error":
        return "network-error";
      case "unauthorized":
      case "server-error":
        return "other";
    }
  }
}
