import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import SyncSpinner from "./SyncSpinner";
import {
  type SyncStatus as SyncStatusType,
  type SyncError,
} from "./store/offlineStore";
import { type Result } from "./types";

interface HeaderProps {
  syncStatus: SyncStatusType;
  onSync: (
    option: "pull" | "push" | "pushForce",
  ) => Promise<Result<void, SyncError>>;
}

const Header = ({ syncStatus, onSync }: HeaderProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if API key is already set
    const storedApiKey = localStorage.getItem("donations-api-key");
    setHasApiKey(!!storedApiKey);
  }, []);

  const handleSetApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem("donations-api-key", apiKey.trim());
      setHasApiKey(true);
      setShowApiKeyInput(false);
      setApiKey("");
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("donations-api-key");
    setHasApiKey(false);
    setShowApiKeyInput(false);
    setApiKey("");
  };

  return (
    <header>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
        <div>
          <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
          {hasApiKey && (
            <>
              <Link to="/donations" style={{ marginRight: "1rem" }}>Donations</Link>
              <Link to="/orgs" style={{ marginRight: "1rem" }}>Organizations</Link>
              <Link to="/reports" style={{ marginRight: "1rem" }}>Reports</Link>
            </>
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {hasApiKey && <SyncSpinner status={syncStatus} sync={onSync} />}
          
          {hasApiKey ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", color: "#666" }}>API Key Set</span>
              <button
                onClick={handleClearApiKey}
                style={{
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              {!showApiKeyInput ? (
                <button
                  onClick={() => setShowApiKeyInput(true)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Set API Key
                </button>
              ) : (
                <form onSubmit={handleSetApiKey} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API Key"
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Set
                  </button>
                  <button
                    type="button"
                    onClick={() => {setShowApiKeyInput(false); setApiKey("");}}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
