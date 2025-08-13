import { useEffect } from "react";

export const useInterval = (
  callback: () => void,
  delayMs: number | undefined,
) => {
  useEffect(() => {
    if (delayMs === undefined) return;
    const interval = setInterval(callback, delayMs);
    return () => clearInterval(interval);
  }, [callback, delayMs]);
};
