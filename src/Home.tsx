import { Link } from "react-router-dom";
import { type StorageProvider } from "./storage/index";

interface HomeProps {
  storageProvider: StorageProvider;
  refreshData: () => Promise<void>;
  currentEtag: string;
}

const Home = ({ storageProvider, refreshData, currentEtag }: HomeProps) => {
  const testGetCachedData = () => {
    const cached = storageProvider.getCachedData();
    console.log("Debug: getCachedData():", cached);
    alert(`Cached data: ${cached ? 'exists' : 'null'}, ETag: ${cached?.etag || 'none'}`);
  };

  const testLoadFresh = async () => {
    try {
      console.log("Debug: Calling loadFresh()...");
      const fresh = await storageProvider.loadFresh();
      console.log("Debug: loadFresh() result:", fresh);
      alert(`Fresh data loaded! ETag: ${fresh.etag}, Orgs: ${fresh.data.orgs.length}, Donations: ${fresh.data.donations.length}`);
    } catch (error) {
      console.error("Debug: loadFresh() error:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testClearCache = () => {
    storageProvider.clearCache();
    console.log("Debug: Cache cleared");
    alert("Cache cleared!");
  };

  const testSave = async () => {
    try {
      console.log("Debug: Testing save with current ETag:", currentEtag);
      const testData = { orgs: [], donations: [] };
      const result = await storageProvider.save(testData, currentEtag);
      console.log("Debug: Save successful:", result);
      alert(`Save successful! New ETag: ${result.etag}`);
    } catch (error) {
      console.error("Debug: Save failed:", error);
      alert(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const checkEtagSync = async () => {
    try {
      const fresh = await storageProvider.loadFresh();
      const cached = storageProvider.getCachedData();
      console.log("Debug: Fresh ETag from server:", fresh.etag);
      console.log("Debug: Cached ETag:", cached?.etag);
      console.log("Debug: App's current ETag:", currentEtag);
      alert(`Server: ${fresh.etag}\nCached: ${cached?.etag}\nApp: ${currentEtag}\nMatch: ${fresh.etag === currentEtag}`);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div>
      <h1>Home</h1>
      <nav>
        <ul className="nav-list">
          <li><Link to="/donations">Donations</Link></li>
          <li><Link to="/orgs">Organizations</Link></li>
          <li><Link to="/reports">Reports</Link></li>
          <li><Link to="/import">Import</Link></li>
          <li><Link to="/export">Export</Link></li>
          <li><Link to="/admin">Admin</Link></li>
        </ul>
      </nav>
      
      <hr />
      <h2>Debug Tools</h2>
      <p>Current ETag: <code>{currentEtag || 'none'}</code></p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={testGetCachedData}>
          Test getCachedData()
        </button>
        <button onClick={testLoadFresh}>
          Test loadFresh()
        </button>
        <button onClick={testClearCache}>
          Clear Cache
        </button>
        <button onClick={refreshData}>
          App refreshData()
        </button>
        <button onClick={testSave}>
          Test Save (Empty Data)
        </button>
        <button onClick={checkEtagSync}>
          Check ETag Sync
        </button>
      </div>
    </div>
  );
};

export default Home;
