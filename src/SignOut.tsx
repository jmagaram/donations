import { useApiKey } from "./useApiKey";

const SignOut = () => {
  const { hasApiKey, clearApiKey } = useApiKey();

  const handleSignOut = () => {
    clearApiKey();
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
