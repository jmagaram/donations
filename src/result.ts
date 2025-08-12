export type Result<T, U> =
  | { kind: "success"; value: T }
  | { kind: "error"; value: U };

export const success = <T>(value: T): Result<T, never> => ({
  kind: "success",
  value,
});

export const error = <U>(value: U): Result<never, U> => ({
  kind: "error", 
  value,
});