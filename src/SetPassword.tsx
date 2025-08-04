import { useState, useEffect } from "react";
import StatusBox from "./StatusBox";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    // Check if password is already set
    const storedPassword = localStorage.getItem("donations-api-key");
    setHasPassword(!!storedPassword);
    if (storedPassword) {
      setPassword(storedPassword);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      localStorage.setItem("donations-api-key", password.trim());
      setHasPassword(true);
      setPasswordChanged(true);
      setTimeout(() => setPasswordChanged(false), 3000);
    }
  };

  // centralize the code for managing this key?
  const handleClear = () => {
    localStorage.removeItem("donations-api-key");
    setHasPassword(false);
    setPassword("");
    setPasswordChanged(false);
  };

  return (
    <div>
      <h1>Set password</h1>
      {hasPassword && (
        <p className="instructions">
          Password is configured. If incorrect, you'll see a security warning
          when using the site.
        </p>
      )}
      {!hasPassword && (
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
            {hasPassword ? "Update password" : "Set password"}
          </button>
          {hasPassword && (
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
