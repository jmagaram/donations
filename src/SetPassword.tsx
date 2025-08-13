import { useState } from "react";
import { useApiKey } from "./useApiKey";

const SetPassword = () => {
  const { apiKey, hasApiKey, setApiKey, clearApiKey } = useApiKey();
  const [password, setPassword] = useState(apiKey || "");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      setApiKey(password.trim());
      setPasswordChanged(true);
      setTimeout(() => setPasswordChanged(false), 3000);
    }
  };

  const handleClear = () => {
    clearApiKey();
    setPassword("");
    setPasswordChanged(false);
  };

  return (
    <div>
      <h1>Set password</h1>
      {hasApiKey && (
        <p className="instructions">
          Password is configured. If incorrect, you'll see a security warning
          when using the site.
        </p>
      )}
      {!hasApiKey && (
        <p className="instructions">
          Enter your password to access the donation tracker. If incorrect,
          you'll see a security warning when using the site.
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <label htmlFor="password">Password</label>
        <div className="form-row">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordChanged(false);
            }}
          />
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => {
                setShowPassword(e.target.checked);
                setPasswordChanged(false);
              }}
            />
            Show
          </label>
        </div>
        <div className="toolbar">
          <button type="submit" disabled={!password.trim()}>
            {hasApiKey ? "Update password" : "Set password"}
          </button>
          {hasApiKey && (
            <button type="button" onClick={handleClear}>
              Sign out
            </button>
          )}
        </div>
        {passwordChanged && (
          <p
            className="password-changed"
            style={{ color: "green", fontWeight: "bold" }}
          >
            Password changed
          </p>
        )}
      </form>
    </div>
  );
};

export default SetPassword;
