import type { Result } from "../types";
import type {
  RemoteStore,
  LoadError,
  SaveError,
  DeleteError,
  Versioned,
} from "./remoteStore";

export type SyncError =
  | "network-error"
  | "etag-mismatch"
  | "data-corruption"
  | "unauthorized"
  | "server-error"
  | "other";

export type SyncStatus =
  | { kind: "idle"; requiresSync: boolean }
  | { kind: "syncing" }
  | { kind: "error"; error: SyncError };

// Data synchronization states:
// - "new": Never synchronized with server, sync status unknown
// - "unchanged": Synchronized with server, no local modifications
// - "modified": Previously synchronized but locally changed
export type DataState<T> = {
  kind: "new" | "unchanged" | "modified";
  data: T;
};

export interface StorageState<T> {
  data: DataState<T>;
  status: SyncStatus;
}

export interface OfflineStore<T> {
  save(data: T): void;
  get(): StorageState<T>;
  sync(option: "pull" | "push" | "pushForce"): Promise<Result<void, SyncError>>;
  onChange(callback: (state: StorageState<T>) => void): () => void;
}

export class OfflineStoreImpl<T> implements OfflineStore<T> {
  private readonly remoteStore: RemoteStore<T>;
  private readonly isEmpty: (data: T) => boolean;
  private cachedData: DataState<T>;
  private syncStatus: SyncStatus;
  private callbacks: ((state: StorageState<T>) => void)[] = [];
  private currentEtag: string | undefined;

  constructor(params: {
    remoteStore: RemoteStore<T>;
    emptyData: T;
    isEmpty?: (data: T) => boolean;
  }) {
    this.remoteStore = params.remoteStore;
    this.isEmpty = params.isEmpty || ((data) => data === params.emptyData);
    this.syncStatus = { kind: "idle", requiresSync: true };
    this.cachedData = { kind: "new", data: params.emptyData };
  }

  save(data: T): void {
    this.cachedData = {
      kind:
        this.cachedData.kind === "unchanged"
          ? "modified"
          : this.cachedData.kind,
      data,
    };
    this.syncStatus = { kind: "idle", requiresSync: true };
    this.notifyCallbacks();
    this.syncOnSave();
  }

  get(): StorageState<T> {
    return {
      data: this.cachedData,
      status: this.syncStatus,
    };
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

  private async syncOnSave(): Promise<void> {
    const pushResult = await this.sync("push");
    if (pushResult.kind === "error" && pushResult.value === "etag-mismatch") {
      if (this.isEmpty(this.cachedData.data)) {
        await this.sync("pull");
      }
    }
  }

  async sync(
    option: "pull" | "push" | "pushForce",
  ): Promise<Result<void, SyncError>> {
    if (this.syncStatus.kind === "syncing") {
      return { kind: "success", value: undefined };
    }

    this.syncStatus = { kind: "syncing" };
    this.notifyCallbacks();

    try {
      let result: Result<Versioned<T> | undefined, SyncError>;
      switch (option) {
        case "pushForce":
          result = await this.pushForceToRemote();
          break;
        case "push":
          switch (this.cachedData.kind) {
            case "new":
            case "modified":
              result = await this.pushToRemote();
              break;
            case "unchanged":
              result = await this.pullFromRemote();
              break;
          }
          break;
        case "pull":
          result = await this.pullFromRemote();
          break;
      }

      if (result.kind === "error") {
        this.syncStatus = { kind: "error", error: result.value };
        this.notifyCallbacks();
        return { kind: "error", value: result.value };
      }

      // Update state with sync result
      if (result.value) {
        // Server has data - update with server state
        this.currentEtag = result.value.etag;
        this.cachedData = { kind: "unchanged", data: result.value.data };
        this.syncStatus = { kind: "idle", requiresSync: false };
      } else {
        // Server has no data - clear etag and mark local data as "new"
        this.currentEtag = undefined;
        this.cachedData = { kind: "new", data: this.cachedData.data };

        // Only require sync if we have non-empty data to push
        const needsSync = !this.isEmpty(this.cachedData.data);
        this.syncStatus = { kind: "idle", requiresSync: needsSync };
      }

      this.notifyCallbacks();

      return { kind: "success", value: undefined };
    } catch (error) {
      // Should never happen since all remote methods return Result types
      console.error("Unexpected sync() error - this indicates a bug:", error);
      this.syncStatus = { kind: "error", error: "other" };
      this.notifyCallbacks();
      return { kind: "error", value: "other" };
    }
  }

  private async pullFromRemote(): Promise<
    Result<Versioned<T> | undefined, SyncError>
  > {
    const loadResult = await this.remoteStore.load();
    if (loadResult.kind === "error") {
      return {
        kind: "error",
        value: this.mapLoadErrorToSyncError(loadResult.value),
      };
    }
    return { kind: "success", value: loadResult.value };
  }

  private async pushToRemote(): Promise<Result<Versioned<T>, SyncError>> {
    const saveResult = await this.remoteStore.save(
      this.cachedData.data,
      this.currentEtag,
    );

    if (saveResult.kind === "error") {
      return {
        kind: "error",
        value: this.mapSaveErrorToSyncError(saveResult.value),
      };
    }

    return { kind: "success", value: saveResult.value };
  }

  private async pushForceToRemote(): Promise<Result<Versioned<T>, SyncError>> {
    // Delete corrupted server data
    const deleteResult = await this.remoteStore.delete();
    if (deleteResult.kind === "error") {
      return {
        kind: "error",
        value: this.mapDeleteErrorToSyncError(deleteResult.value),
      };
    }

    // Save current data (creates new record without etag)
    const saveResult = await this.remoteStore.save(this.cachedData.data);
    if (saveResult.kind === "error") {
      return {
        kind: "error",
        value: this.mapSaveErrorToSyncError(saveResult.value),
      };
    }

    // Load to get fresh etag
    const loadResult = await this.remoteStore.load();
    if (loadResult.kind === "error") {
      return {
        kind: "error",
        value: this.mapLoadErrorToSyncError(loadResult.value),
      };
    }

    if (!loadResult.value) {
      return { kind: "error", value: "other" };
    }

    return { kind: "success", value: loadResult.value };
  }

  private notifyCallbacks(): void {
    const state = this.get();
    this.callbacks.forEach((callback) => callback(state));
  }

  private mapLoadErrorToSyncError(loadError: LoadError): SyncError {
    switch (loadError) {
      case "network-error":
        return "network-error";
      case "data-corruption":
        return "data-corruption";
      case "unauthorized":
        return "unauthorized";
      case "server-error":
        return "server-error";
    }
  }

  private mapSaveErrorToSyncError(saveError: SaveError): SyncError {
    switch (saveError) {
      case "network-error":
        return "network-error";
      case "etag-mismatch":
        return "etag-mismatch";
      case "unauthorized":
        return "unauthorized";
      case "server-error":
        return "server-error";
    }
  }

  private mapDeleteErrorToSyncError(deleteError: DeleteError): SyncError {
    switch (deleteError) {
      case "network-error":
        return "network-error";
      case "unauthorized":
        return "unauthorized";
      case "server-error":
        return "server-error";
    }
  }
}
