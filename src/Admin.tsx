import { type OfflineStore } from "./store/offlineStore";
import { tryCreateSampleData } from "./sampleData";
import { type DonationsData } from "./types";
import { empty } from "./donationsData";

interface AdminProps {
  storageProvider: OfflineStore<DonationsData>;
}

const Admin = ({ storageProvider }: AdminProps) => {
  const useSampleData = async () => {
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

  const deleteAllData = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL data? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const emptyData = empty();
      storageProvider.save(emptyData);
      await storageProvider.sync("pushForce");
    } catch (error) {
      alert(
        `Failed to delete data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div>
      <h1>Admin</h1>
      <div className="toolbar">
        <button onClick={useSampleData}>Use sample data</button>
        <button onClick={deleteAllData}>Delete all data</button>
      </div>
    </div>
  );
};

export default Admin;
