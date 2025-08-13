import { useState, useEffect } from "react";
import { type OfflineStore, type SyncStatus } from "./store/offlineStore";
import { type DonationsData } from "./donationsData";

export const useSyncStatus = (offlineStore: OfflineStore<DonationsData>): SyncStatus => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => 
    offlineStore.get().status
  );

  useEffect(() => {
    const unsubscribe = offlineStore.onChange((storageState) => {
      setSyncStatus(storageState.status);
    });

    return unsubscribe;
  }, [offlineStore]);

  return syncStatus;
};