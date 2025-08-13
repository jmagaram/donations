import { type OfflineStore } from "./offlineStore";
import { tryCreateSampleData } from "./sampleData";
import { type DonationsData } from "./donationsData";
import { empty } from "./donationsData";
import { useStorageMode } from "./useStorageMode";
import { useStorageState } from "./useStorageState";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

interface AdminProps {
  storageProvider: OfflineStore<DonationsData>;
}

const Admin = ({ storageProvider }: AdminProps) => {
  const { currentMode, toggleMode } = useStorageMode();
  const { syncStatus, isSyncing } = useStorageState(storageProvider);
  const navigate = useNavigate();

  const confirmUseSampleData = async () => {
    if (!confirm("Are you sure replace all data?")) {
      return;
    }
    try {
      const sampleData = tryCreateSampleData();
      storageProvider.save(sampleData);
      await storageProvider.sync("pushForce");
    } catch (error) {
      alert(
        `Failed to load sample data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const confirmDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL data? This cannot be undone.",
      )
    ) {
      return;
    }
    const emptyData = empty();
    storageProvider.save(emptyData);
    await storageProvider.sync("pushForce");
  };

  const confirmPushForceSync = async () => {
    if (!confirm("Replace server data with your local data?")) {
      return;
    }
    await storageProvider.sync("pushForce");
  };

  const handleToggleMode = () => {
    if (
      currentMode === "webApi" &&
      (syncStatus.kind === "error" ||
        (syncStatus.kind === "idle" && syncStatus.requiresSync))
    ) {
      const message =
        "Switch to offline testing storage? If you have any unsaved local changes they will be lost.";
      if (!confirm(message)) {
        return;
      }
    }
    toggleMode();
    navigate("/");
  };

  const getModeDescription = (): JSX.Element => {
    return currentMode === "browser" ? (
      <>
        You are using a <strong>test-only environment</strong> right now. Data
        is stored offline and is not backed up or synchronized across devices.
      </>
    ) : (
      <>
        Your data is securely synchronized with storage on the Internet and is
        shared across devices. But for testing purposes, you can switch to local
        offline storage with sample data.
      </>
    );
  };

  return (
    <div>
      <h1>Admin</h1>
      <section>
        <h2>Test environment</h2>
        <p className="instructions">{getModeDescription()}</p>
        <div className="toolbar">
          <button onClick={handleToggleMode} disabled={isSyncing}>
            {(() => {
              return currentMode === "browser"
                ? "Use real data"
                : "Use testing environment";
            })()}
          </button>
        </div>
      </section>
      <section>
        <h2>Other</h2>
        <div className="toolbar">
          <button onClick={confirmUseSampleData} disabled={isSyncing}>
            Use sample data
          </button>
          <button onClick={confirmDeleteAll} disabled={isSyncing}>
            Delete all data
          </button>
          <button onClick={confirmPushForceSync} disabled={isSyncing}>
            Force upload
          </button>
        </div>
      </section>
    </div>
  );
};

export default Admin;
