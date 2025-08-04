import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import OrgsContainer from "./OrgsContainer";
import DonationsContainer from "./DonationsContainer";
import OrgDetailsContainer from "./OrgDetailsContainer";
import OrgUpsertContainer from "./OrgUpsertContainer";
import DonationUpsertContainer from "./DonationUpsertContainer";
import Importer from "./Importer";
import Exporter from "./Exporter";
import Reports from "./Reports";
import TotalsByYear from "./TotalsByYear";
import TotalsByCategory from "./TotalsByCategory";
import SyncStatusBox from "./SyncStatusBox";
import Admin from "./Admin";
import "./App.css";
import { useState, useEffect, useCallback } from "react";
import { type DonationsData, DonationsDataSchema } from "./types";
import { OfflineStoreImpl, type SyncError } from "./store/offlineStore";
import { BrowserStore } from "./store/browserStore";
import { WebApiStore } from "./store/webApi";
import { empty, isEmpty } from "./donationsData";
import type { RemoteStore } from "./store";

const createStore = (
  kind: "browser" | "webApi",
): RemoteStore<DonationsData> => {
  switch (kind) {
    case "browser":
      return new BrowserStore({
        storageKey: "donations-data",
        isValidData: (data): data is DonationsData =>
          DonationsDataSchema.safeParse(data).success,
        timeoutMs: 2000,
        errorSimulation: {
          networkError: 0.3,
          unauthorized: 0.0,
          serverError: 0.0,
          dataCorruption: 0.0,
          etagMismatch: 0.0,
        },
      });
    case "webApi":
      return new WebApiStore();
  }
};

const AppContent = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const [offlineStore] = useState(() => {
    const emptyData: DonationsData = empty();
    const remote = createStore("webApi");
    return new OfflineStoreImpl({
      remote,
      emptyData,
      isEmpty: isEmpty,
    });
  });

  const [storageState, setStorageState] = useState(() => offlineStore.get());
  const [syncError, setSyncError] = useState<SyncError | undefined>(undefined);

  // Check for API key on mount and set up listener for changes
  useEffect(() => {
    const checkApiKey = () => {
      const apiKey = localStorage.getItem("donations-api-key");
      setHasApiKey(!!apiKey);
    };

    checkApiKey();

    // Listen for storage changes to update API key status
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "donations-api-key") {
        checkApiKey();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkApiKey, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = offlineStore.onChange((newState) => {
      setStorageState(newState);
      if (newState.status.kind === "error") {
        setSyncError(newState.status.error);
      } else {
        setSyncError(undefined);
      }
    });

    // Initial sync to load data only if API key is set
    if (hasApiKey) {
      offlineStore.sync("pull");
    }

    return unsubscribe;
  }, [offlineStore, hasApiKey]);

  const setDonationsData = (data: DonationsData) => {
    offlineStore.save(data);
  };

  const refreshData = async () => {
    await offlineStore.sync("pull");
  };

  const handleSync = useCallback(
    (option: "pull" | "push" | "pushForce") => {
      return offlineStore.sync(option);
    },
    [offlineStore],
  );

  const donationsData = storageState.data.data;
  const isLoading = storageState.status.kind === "syncing";

  if (!hasApiKey) {
    return (
      <>
        <Header syncStatus={storageState.status} onSync={handleSync} />
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>API Key Required</h2>
          <p>Please set your API key using the "Set API Key" button above to access the donations tracker.</p>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            You'll need the shared secret that was configured when the application was deployed.
          </p>
        </div>
      </>
    );
  }

  if (isLoading && storageState.data.kind === "new") {
    return (
      <>
        <Header syncStatus={storageState.status} onSync={handleSync} />
        <div>Loading donation data...</div>
      </>
    );
  }

  return (
    <>
      <Header syncStatus={storageState.status} onSync={handleSync} />
      {hasApiKey && (
        <SyncStatusBox
          syncError={syncError}
          onPull={() => offlineStore.sync("pull")}
          onPush={() => offlineStore.sync("push")}
          onPushForce={() => offlineStore.sync("pushForce")}
          onDismissError={() => setSyncError(undefined)}
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/donations"
          element={
            <DonationsContainer
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/donations/add"
          element={
            <DonationUpsertContainer
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/donations/:donationId/edit"
          element={
            <DonationUpsertContainer
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/orgs"
          element={
            <OrgsContainer
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/orgs/add"
          element={
            <OrgUpsertContainer
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/orgs/:id"
          element={
            <OrgDetailsContainer
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/orgs/:id/edit"
          element={
            <OrgUpsertContainer
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/import"
          element={<Importer setDonationsData={setDonationsData} />}
        />
        <Route
          path="/export"
          element={<Exporter donationsData={donationsData} />}
        />
        <Route path="/reports" element={<Reports />} />
        <Route
          path="/reports/yearlytotals"
          element={<TotalsByYear donationsData={donationsData} />}
        />
        <Route
          path="/reports/yearlytotalsbycategory"
          element={<TotalsByCategory donationsData={donationsData} />}
        />
        <Route
          path="/admin"
          element={
            <Admin storageProvider={offlineStore} refreshData={refreshData} />
          }
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
