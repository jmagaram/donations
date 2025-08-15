import { useState, useEffect } from "react";
import type {
  OfflineStore,
  StorageState,
  SyncError,
  SyncStatus,
} from "../store/offlineStore";

export interface StorageStateHookResult<T> {
  storageState: StorageState<T>;
  syncStatus: SyncStatus;
  isSyncing: boolean;
  syncError: SyncError | undefined;
}

/**
 * React hook for monitoring storage state from an OfflineStore.
 *
 * This hook handles:
 * - Subscribing to storage state changes
 * - Initial data loading via sync
 * - Cleanup on unmount or store changes
 *
 * The hook automatically triggers an initial "pull" sync when the store changes
 * to ensure data is loaded from storage.
 */
export function useStorageState<T>(
  offlineStore: OfflineStore<T>
): StorageStateHookResult<T> {
  const [storageState, setStorageState] = useState<StorageState<T>>(() =>
    offlineStore.get()
  );

  useEffect(() => {
    const unsubscribe = offlineStore.onChange((newState) => {
      setStorageState(newState);
    });
    offlineStore.sync("pull");
    return unsubscribe;
  }, [offlineStore]);

  return {
    storageState,
    syncStatus: storageState.status,
    isSyncing: storageState.status.kind === "syncing",
    syncError:
      storageState.status.kind === "error"
        ? storageState.status.error
        : undefined,
  };
}
