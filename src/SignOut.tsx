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
    <a href="#" onClick={handleSignOut} className="sign-out-link">
      Sign out
    </a>
  );
};

export default SignOut;
