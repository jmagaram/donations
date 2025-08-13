import { useState, useEffect } from "react";
import {
  storageSelectorService,
  type StorageMode,
} from "./storageSelectorService";

/**
 * React hook for managing storage mode selection in UI components.
 *
 * This hook provides reactive access to the current storage mode preference
 * ("browser" vs "webApi") which is stored in localStorage.
 *
 * IMPORTANT: This hook only manages the storage mode selection/preference.
 * It does not actually change storage behavior - that happens in other code
 * that listens for mode changes and recreates the OfflineStore accordingly.
 *
 * The hook automatically subscribes to mode changes from the storage selector
 * service, so all components using this hook stay in sync when the mode changes.
 */
export const useStorageMode = () => {
  const [currentMode, setCurrentMode] = useState<StorageMode>(() =>
    storageSelectorService.getCurrentMode(),
  );

  useEffect(() => {
    const unsubscribe = storageSelectorService.onModeChange((newMode) => {
      setCurrentMode(newMode);
    });
    return unsubscribe;
  }, []);

  const toggleMode = () => {
    const newMode = currentMode === "browser" ? "webApi" : "browser";
    storageSelectorService.setStorageMode(newMode);
  };

  return {
    currentMode,
    toggleMode,
  };
};
