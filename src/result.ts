import type { Result } from "./types";

export const success = <T>(value: T): Result<T, never> => ({
  kind: "success",
  value,
});

export const error = <U>(value: U): Result<never, U> => ({
  kind: "error", 
  value,
});