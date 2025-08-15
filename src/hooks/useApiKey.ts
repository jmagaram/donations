import { useState, useEffect, useCallback } from "react";
import { getApiKey, setApiKey, clearApiKey } from "../store/webApi";
import { useInterval } from "./useInterval";

interface ApiKeyHook {
  apiKey: string | undefined;
  hasApiKey: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

// Custom hook to manage API key state with automatic sync checking every 2 seconds
export const useApiKey = (): ApiKeyHook => {
  const [apiKey, setApiKeyState] = useState<string | undefined>(() =>
    getApiKey()
  );
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => !!getApiKey());

  const checkApiKey = useCallback(() => {
    const current = getApiKey();
    setApiKeyState(current);
    setHasApiKey(!!current);
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  useInterval(checkApiKey, 2000);

  const updateApiKey = useCallback(
    (newKey: string) => {
      setApiKey(newKey);
      checkApiKey();
    },
    [checkApiKey]
  );

  const clearApiKeyState = useCallback(() => {
    clearApiKey();
    checkApiKey();
  }, [checkApiKey]);

  return {
    apiKey,
    hasApiKey,
    setApiKey: updateApiKey,
    clearApiKey: clearApiKeyState,
  };
};
