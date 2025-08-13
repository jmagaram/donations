import { useState, useEffect, useCallback } from "react";
import { getApiKey, clearApiKey } from "./store/webApi";
import { useInterval } from "./useInterval";

const SignOut = () => {
  const [hasApiKey, setHasApiKey] = useState(false);

  const checkApiKey = useCallback(() => {
    setHasApiKey(getApiKey() !== undefined);
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  useInterval(checkApiKey, 2000);

  const handleSignOut = () => {
    clearApiKey();
    setHasApiKey(false);
  };

  if (!hasApiKey) {
    return null;
  }

  return (
    <button className="sign-out-button large-screen" onClick={handleSignOut}>
      Sign out
    </button>
  );
};

export default SignOut;
