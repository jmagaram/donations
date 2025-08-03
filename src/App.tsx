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
import { empty, isEmpty } from "./donationsData";

const AppContent = () => {
  const [offlineStore] = useState(() => {
    const emptyData: DonationsData = empty();
    const browserStore = new BrowserStore({
      storageKey: "donations-data",
      isValidData: (data): data is DonationsData =>
        DonationsDataSchema.safeParse(data).success,
      timeoutMs: 3000,
      errorSimulation: {
        networkError: 0.3,
        unauthorized: 0.05,
        serverError: 0.03,
        dataCorruption: 0.02,
        etagMismatch: 0.08,
      },
    });
    return new OfflineStoreImpl({
      remote: browserStore,
      emptyData,
      isEmpty: isEmpty,
    });
  });

  const [storageState, setStorageState] = useState(() => offlineStore.get());
  const [syncError, setSyncError] = useState<SyncError | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = offlineStore.onChange((newState) => {
      setStorageState(newState);
      if (newState.status.kind === "error") {
        setSyncError(newState.status.error);
      } else {
        setSyncError(undefined);
      }
    });

    // Initial sync to load data
    offlineStore.sync("pull");

    return unsubscribe;
  }, [offlineStore]);

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

  if (isLoading && storageState.data.kind === "new") {
    return <div>Loading donation data...</div>;
  }

  return (
    <>
      <Header syncStatus={storageState.status} onSync={handleSync} />
      <SyncStatusBox
        syncError={syncError}
        onRefreshData={refreshData}
        onDismissError={() => setSyncError(undefined)}
      />
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
