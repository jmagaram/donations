export type StorageMode = "browser" | "webApi";

type ModeChangeCallback = (mode: StorageMode) => void;

export interface IStorageSelectorService {
  getCurrentMode(): StorageMode;
  setStorageMode(mode: StorageMode): void;
  onModeChange(callback: ModeChangeCallback): () => void;
}

const STORAGE_MODE_KEY = "donations-storage-mode";
const DEFAULT_STORAGE_MODE = "browser";

class StorageSelectorService implements IStorageSelectorService {
  private callbacks: ModeChangeCallback[] = [];
  private readonly defaultMode: StorageMode;

  constructor(defaultMode: StorageMode) {
    this.defaultMode = defaultMode;
  }

  getCurrentMode(): StorageMode {
    try {
      const stored = localStorage.getItem(STORAGE_MODE_KEY);
      if (stored === "browser" || stored === "webApi") {
        return stored;
      }
      return this.defaultMode;
    } catch (error) {
      console.warn(
        `Failed to read storage mode with error '${error}'; defaulting to ${this.defaultMode}:`,
        error,
      );
      return this.defaultMode;
    }
  }

  setStorageMode(mode: StorageMode): void {
    if (this.getCurrentMode() === mode) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_MODE_KEY, mode);
      const actualMode = this.getCurrentMode();
      this.notifyCallbacks(actualMode);
    } catch (error) {
      console.warn("Failed to set storage mode in localStorage:", error);
    }
  }

  onModeChange(callback: ModeChangeCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index >= 0) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  private notifyCallbacks(mode: StorageMode): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(mode);
      } catch (error) {
        console.warn("Callback failed on storage mode change:", error);
      }
    });
  }
}

export const storageSelectorService: IStorageSelectorService =
  new StorageSelectorService(DEFAULT_STORAGE_MODE);
