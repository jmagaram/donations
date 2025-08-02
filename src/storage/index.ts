import type { StorageProvider } from "./interface";
import { SessionStorageProvider } from "./sessionStorage";
import { WebApiProvider } from "./webApi";

export type { StorageProvider, CachedData } from "./interface";

export const createStorageProvider = (
  type: "webApi" | "sessionStorage",
): StorageProvider => {
  return type === "webApi"
    ? new WebApiProvider()
    : new SessionStorageProvider();
};
