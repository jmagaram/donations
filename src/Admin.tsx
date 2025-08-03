import { type OfflineStore } from "./store/offlineStore";
import { tryCreateSampleData } from "./sampleData";
import { type DonationsData } from "./types";

interface AdminProps {
  storageProvider: OfflineStore<DonationsData>;
  refreshData: () => Promise<void>;
}

const Admin = ({ storageProvider, refreshData }: AdminProps) => {
  const useSampleData = async () => {
    if (!confirm("Are you sure replace all data?")) {
      return;
    }

    try {
      const sampleData = tryCreateSampleData();
      storageProvider.save(sampleData);
      refreshData();
    } catch (error) {
      alert(
        `Failed to load sample data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div>
      <h1>Admin</h1>
      <button onClick={useSampleData}>Use sample data</button>
    </div>
  );
};

export default Admin;
