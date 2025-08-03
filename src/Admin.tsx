import { empty } from "./donationsData";
import { type StorageProvider } from "./storage/index";

interface AdminProps {
  storageProvider: StorageProvider;
  refreshData: () => Promise<void>;
  currentEtag: string;
}

const Admin = ({ storageProvider, refreshData, currentEtag }: AdminProps) => {
  const goGetCachedData = () => {
    const cached = storageProvider.getCachedData();
    console.log("Debug: getCachedData():", cached);
    alert(
      `Cached data: ${cached ? "exists" : "null"}, ETag: ${cached?.etag || "none"}`,
    );
  };

  const goRefreshFromRemote = async () => {
    try {
      console.log("Debug: Calling refreshFromRemote()...");
      const fresh = await storageProvider.refreshFromRemote();
      console.log("Debug: refreshFromRemote() result:", fresh);
      alert(
        `Fresh data loaded! ETag: ${fresh.etag}, Orgs: ${fresh.data.orgs.length}, Donations: ${fresh.data.donations.length}`,
      );
    } catch (error) {
      console.error("Debug: refreshFromRemote() error:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const goClearCache = () => {
    storageProvider.clearCache();
    console.log("Debug: Cache cleared");
    alert("Cache cleared!");
  };

  const goSave = async () => {
    try {
      console.log("Debug: Testing save with current ETag:", currentEtag);
      const testData = empty();
      const result = await storageProvider.save(testData, currentEtag);
      console.log("Debug: Save successful:", result);
      alert(`Save successful! New ETag: ${result.etag}`);
    } catch (error) {
      console.error("Debug: Save failed:", error);
      alert(
        `Save failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const checkEtagSync = async () => {
    try {
      const fresh = await storageProvider.refreshFromRemote();
      const cached = storageProvider.getCachedData();
      console.log("Debug: Fresh ETag from server:", fresh.etag);
      console.log("Debug: Cached ETag:", cached?.etag);
      console.log("Debug: App's current ETag:", currentEtag);
      alert(
        `Server: ${fresh.etag}\nCached: ${cached?.etag}\nApp: ${currentEtag}\nMatch: ${fresh.etag === currentEtag}`,
      );
    } catch (error) {
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const goDelete = async () => {
    if (!confirm("DELETE ALL DATA from the server? This cannot be undone!")) {
      return;
    }
    try {
      console.log("Debug: Testing delete with current ETag:", currentEtag);
      await storageProvider.delete(currentEtag);
      console.log("Debug: Delete successful");
      alert("Delete successful! All data has been removed from the server.");
      // Refresh the page or clear local state
      refreshData();
    } catch (error) {
      console.error("Debug: Delete failed:", error);
      alert(
        `Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div>
      <h1>Admin</h1>
      <p>
        Current ETag: <code>{currentEtag || "none"}</code>
      </p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={goGetCachedData}>getCachedData</button>
        <button onClick={goRefreshFromRemote}>refreshFromRemote</button>
        <button onClick={goClearCache}>clearCache</button>
        <button onClick={goDelete}>delete</button>
        <button onClick={refreshData}>App refreshData()</button>
        <button onClick={goSave}>save (empty data)</button>
        <button onClick={checkEtagSync}>Check etag sync</button>
      </div>
    </div>
  );
};

export default Admin;
