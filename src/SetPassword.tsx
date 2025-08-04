import { useState, useEffect } from "react";
import StatusBox from "./StatusBox";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      setPassword("");
    }
  };

  // centralize the code for managing this key?
  const handleClear = () => {
    localStorage.removeItem("donations-api-key");
    setHasPassword(false);
    setPassword("");
  };

  return (
    <div>
      <h1>Set password</h1>
      {hasPassword && (
        <p className="instructions">
          A password is required to use this web site. You will know if it is
          set correctly when you try to sync or change some data. If the
          password is incorrect, a security error message will be displayed and
          you will then have an opportunity to try again.
        </p>
      )}
      {!hasPassword && (
        <p className="instructions">
          A password is required to use this web site; please type it below. You
          will know if it is set correctly when you try to sync or change some
          data. If the password is incorrect, a security error message will be
          displayed and you will then have an opportunity to try again.
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <div className="form-row">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show
            </label>
          </div>
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
      </form>
    </div>
  );
};

export default SetPassword;
