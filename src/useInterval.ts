import { useEffect } from "react";

// Custom hook to run a callback function at regular intervals
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
