import { type OfflineStore } from "./store/offlineStore";
import { tryCreateSampleData } from "./sampleData";
import { type DonationsData } from "./donationsData";
import { empty } from "./donationsData";

interface AdminProps {
  storageProvider: OfflineStore<DonationsData>;
}

const Admin = ({ storageProvider }: AdminProps) => {
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
    if (
      !confirm(
        "Replace server data with your local data?",
      )
    ) {
      return;
    }
    await storageProvider.sync("pushForce");
  };

  return (
    <div>
      <h1>Admin</h1>
      <div className="toolbar">
        <button onClick={confirmUseSampleData}>Use sample data</button>
        <button onClick={confirmDeleteAll}>Delete all data</button>
        <button onClick={confirmPushForceSync}>Force upload</button>
      </div>
    </div>
  );
};

export default Admin;
