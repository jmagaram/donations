import { useState, useEffect } from "react";
import { getApiKey, clearApiKey } from "./store/webApi";

const SignOut = () => {
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkApiKey = () => {
      setHasApiKey(getApiKey() !== undefined);
    };
    checkApiKey();
    const interval = setInterval(checkApiKey, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    clearApiKey();
    setHasApiKey(false);
  };

  if (!hasApiKey) {
    return null;
  }

  return (
    <button className="sign-out-button" onClick={handleSignOut}>
      Sign out
    </button>
  );
};

export default SignOut;
