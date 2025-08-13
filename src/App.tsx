import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import SetPassword from "./SetPassword";
import OrgsContainer from "./OrgsContainer";
import DonationsContainer from "./DonationsContainer";
import OrgDetailsContainer from "./OrgDetailsContainer";
import OrgUpsertContainer from "./OrgUpsertContainer";
import DonationUpsertContainer from "./DonationUpsertContainer";
import DonationDetailsContainer from "./DonationDetailsContainer";
import Importer from "./Importer";
import Exporter from "./Exporter";
import Reports from "./Reports";
import TotalsByYear from "./TotalsByYear";
import TotalsByCategory from "./TotalsByCategory";
import SyncStatusBox from "./SyncStatusBox";
import Admin from "./Admin";
import "./App.css";
import { useState, useEffect, useCallback } from "react";
import { type DonationsData, DonationsDataSchema } from "./donationsData";
import { OfflineStoreImpl, type SyncError } from "./store/offlineStore";
import { BrowserStore } from "./store/browserStore";
import { WebApiStore } from "./store/webApi";
import { empty, isEmpty } from "./donationsData";
import type { RemoteStore } from "./store/remoteStore";
import StatusBox from "./StatusBox";
import { sampleData } from "./sampleData";
import {
  storageSelectorService,
  type StorageMode,
} from "./storageSelectorService";
import { useStorageMode } from "./useStorageMode";
import { useStorageState } from "./useStorageState";

// Creates the underlying storage implementation - local browser storage for
// testing, or internet server storage for real applicaiton usage.
const createStore = (kind: StorageMode): RemoteStore<DonationsData> => {
  switch (kind) {
    case "browser": {
      const initialData: DonationsData = sampleData() ?? empty();
      return new BrowserStore({
        storageKey: "donations-data",
        isValidData: (data): data is DonationsData =>
          DonationsDataSchema.safeParse(data).success,
        timeoutMs: 2000,
        initialData: { data: initialData, overwrite: false },
        errorSimulation: {
          networkError: 0.0,
          unauthorized: 0.0,
          serverError: 0.0,
          dataCorruption: 0.0,
          etagMismatch: 0.0,
        },
      });
    }
    case "webApi":
      return new WebApiStore();
  }
};

// Wraps the underlying store for sync management and caching.
const createOfflineStore = (mode: StorageMode) => {
  const emptyData: DonationsData = empty();
  const remote = createStore(mode);
  return new OfflineStoreImpl({
    remote,
    emptyData,
    isEmpty,
  });
};

const AppContent = () => {
  const { currentMode } = useStorageMode();
  const location = useLocation();

  // Creates the initial offline store based on the current storage mode preference.
  const [offlineStore, setOfflineStore] = useState(() =>
    createOfflineStore(storageSelectorService.getCurrentMode()),
  );

  const storageState = useStorageState(offlineStore);
  const [syncError, setSyncError] = useState<SyncError | undefined>(undefined);

  // Update UI error state when storage status changes
  useEffect(() => {
    if (storageState.status.kind === "error") {
      setSyncError(storageState.status.error);
    } else {
      setSyncError(undefined);
    }
  }, [storageState.status]);

  // Recreate the offline store when storage mode changes
  useEffect(() => {
    const newOfflineStore = createOfflineStore(currentMode);
    setOfflineStore(newOfflineStore);
  }, [currentMode]);

  const setDonationsData = (data: DonationsData) => {
    offlineStore.save(data);
  };

  const handleSync = useCallback(
    (option: "pull" | "push" | "pushForce") => {
      return offlineStore.sync(option);
    },
    [offlineStore],
  );

  const donationsData = storageState.data.data;
  const isLoading = storageState.status.kind === "syncing";

  if (isLoading && storageState.data.kind === "new") {
    return (
      <>
        <Header syncStatus={storageState.status} onSync={handleSync} />
        <StatusBox content="Loading donation data..." kind="info" />
      </>
    );
  }

  return (
    <>
      {currentMode === "browser" && (
        <header className="test-mode">
          <div>
            Test Environment
            {location.pathname !== "/admin" && (
              <>
                &nbsp;<Link to="/admin">change</Link>
              </>
            )}
          </div>
        </header>
      )}
      <Header syncStatus={storageState.status} onSync={handleSync} />
      <SyncStatusBox
        syncError={syncError}
        onPull={() => offlineStore.sync("pull")}
        onPush={() => offlineStore.sync("push")}
        onDismissError={() => setSyncError(undefined)}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/set-password" element={<SetPassword />} />
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
          path="/donations/:donationId"
          element={<DonationDetailsContainer donationsData={donationsData} />}
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
          element={<Admin storageProvider={offlineStore} />}
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
