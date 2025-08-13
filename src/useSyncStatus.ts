import { useState, useEffect } from "react";
import { type OfflineStore, type SyncStatus } from "./offlineStore";
import { type DonationsData } from "./donationsData";

export interface SyncStatusHookResult {
  syncStatus: SyncStatus;
  isSyncing: boolean;
}

export const useSyncStatus = (
  store: OfflineStore<DonationsData>,
): SyncStatusHookResult => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    () => store.get().status,
  );

  useEffect(() => {
    const unsubscribe = store.onChange((storageState) => {
      setSyncStatus(storageState.status);
    });

    return unsubscribe;
  }, [store]);

  return {
    syncStatus,
    isSyncing: syncStatus.kind === "syncing",
  };
};
