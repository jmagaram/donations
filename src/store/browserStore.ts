import type { Result } from "../types";
import type {
  RemoteStore,
  VersionedData,
  LoadError,
  SaveError,
  DeleteError,
} from "./remoteStore";

interface ErrorSimulation {
  networkError?: number;
  unauthorized?: number;
  serverError?: number;
  dataCorruption?: number;
  etagMismatch?: number;
}

export class BrowserStore<T> implements RemoteStore<T> {
  private readonly storageKey: string;
  private readonly etagKey: string;
  private readonly timeoutMs: number;
  private readonly errorSimulation?: ErrorSimulation;
  private isValidData: (data: unknown) => data is T;

  constructor(
    storageKey: string,
    isValidData: (data: unknown) => data is T,
    timeoutMs: number,
    errorSimulation?: ErrorSimulation,
  ) {
    this.storageKey = storageKey;
    this.etagKey = `${storageKey}_etag`;
    this.timeoutMs = timeoutMs;
    this.errorSimulation = errorSimulation;
    this.isValidData = isValidData;
  }

  async load(): Promise<Result<VersionedData<T> | undefined, LoadError>> {
    await new Promise((resolve) => setTimeout(resolve, this.timeoutMs));

    if (this.shouldSimulateError("networkError")) {
      return { kind: "error", value: "network-error" };
    }
    if (this.shouldSimulateError("unauthorized")) {
      return { kind: "error", value: "unauthorized" };
    }
    if (this.shouldSimulateError("serverError")) {
      return { kind: "error", value: "server-error" };
    }
    if (this.shouldSimulateError("dataCorruption")) {
      return { kind: "error", value: "data-corruption" };
    }

    try {
      const dataStr = sessionStorage.getItem(this.storageKey);
      const etag = sessionStorage.getItem(this.etagKey);

      if (dataStr && etag) {
        const data = JSON.parse(dataStr);
        if (this.isValidData(data)) {
          return { kind: "success", value: { data, etag } };
        } else {
          return { kind: "error", value: "data-corruption" };
        }
      }

      return { kind: "success", value: undefined };
    } catch {
      return { kind: "error", value: "network-error" };
    }
  }

  async save(
    data: T,
    etag?: string,
  ): Promise<Result<VersionedData<T>, SaveError>> {
    await new Promise((resolve) => setTimeout(resolve, this.timeoutMs));

    if (this.shouldSimulateError("networkError")) {
      return { kind: "error", value: "network-error" };
    }
    if (this.shouldSimulateError("unauthorized")) {
      return { kind: "error", value: "unauthorized" };
    }
    if (this.shouldSimulateError("serverError")) {
      return { kind: "error", value: "server-error" };
    }
    if (this.shouldSimulateError("etagMismatch")) {
      return { kind: "error", value: "etag-mismatch" };
    }

    try {
      if (etag) {
        const currentEtag = sessionStorage.getItem(this.etagKey);
        if (currentEtag && currentEtag !== etag) {
          return { kind: "error", value: "etag-mismatch" };
        }
      }

      const newEtag = this.generateEtag(data);
      sessionStorage.setItem(this.storageKey, JSON.stringify(data));
      sessionStorage.setItem(this.etagKey, newEtag);

      return { kind: "success", value: { data, etag: newEtag } };
    } catch {
      return { kind: "error", value: "network-error" };
    }
  }

  async delete(): Promise<Result<void, DeleteError>> {
    await new Promise((resolve) => setTimeout(resolve, this.timeoutMs));

    if (this.shouldSimulateError("networkError")) {
      return { kind: "error", value: "network-error" };
    }
    if (this.shouldSimulateError("unauthorized")) {
      return { kind: "error", value: "unauthorized" };
    }
    if (this.shouldSimulateError("serverError")) {
      return { kind: "error", value: "server-error" };
    }

    try {
      sessionStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(this.etagKey);
      return { kind: "success", value: undefined };
    } catch {
      return { kind: "error", value: "network-error" };
    }
  }

  private generateEtag(data: T): string {
    const hash = this.hashString(JSON.stringify(data));
    return `"${hash}-${Date.now()}"`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private shouldSimulateError(errorType: keyof ErrorSimulation): boolean {
    if (!this.errorSimulation) return false;
    const rate = this.errorSimulation[errorType] || 0;
    return Math.random() < rate;
  }
}
