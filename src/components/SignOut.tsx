import { useApiKey } from "../hooks/useApiKey";

const SignOut = () => {
  const { hasApiKey, clearApiKey } = useApiKey();

  const handleSignOut = () => {
    if (
      window.confirm(
        "Are you sure you want to sign out? You'll need to enter the password again to access your data."
      )
    ) {
      clearApiKey();
    }
  };

  if (!hasApiKey) {
    return null;
  }

  return (
    <button className="large-screen" onClick={handleSignOut}>
      Sign out
    </button>
  );
};

export default SignOut;
