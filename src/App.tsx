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
import StatusBox from "./StatusBox";
import Admin from "./Admin";
import "./App.css";
import { useState, useEffect } from "react";
import { type DonationsData, DonationsDataSchema } from "./types";
import { OfflineStoreImpl, type SyncError } from "./store/offlineStore";
import { BrowserStore } from "./store/browserStore";
import type { StatusBoxProps } from "./StatusBox";
import { empty } from "./donationsData";

const convertSyncErrorToStatusBoxProps = (
  syncError: SyncError,
  refreshData: () => void,
  dismissError: () => void,
): StatusBoxProps => {
  switch (syncError) {
    case "etag-mismatch":
      return {
        kind: "error",
        header: "Data sync conflict",
        content:
          "Your data was changed elsewhere and is not in sync with your web browser. Your recent change was not saved. Try again.",
        buttons: [
          {
            caption: "Refresh data",
            onClick: refreshData,
          },
        ],
      };
    case "network-error":
      return {
        kind: "error",
        header: "Network error",
        content: "Unable to connect to storage",
        buttons: [
          {
            caption: "Dismiss",
            onClick: dismissError,
          },
        ],
      };
    case "data-corruption":
      return {
        kind: "error",
        header: "Data corruption",
        content: "Data could not be parsed or validated",
        buttons: [
          {
            caption: "Refresh Data",
            onClick: refreshData,
          },
          {
            caption: "Dismiss",
            onClick: dismissError,
          },
        ],
      };
    case "unauthorized":
      return {
        kind: "error",
        header: "Unauthorized",
        content: "Access denied",
        buttons: [
          {
            caption: "Dismiss",
            onClick: dismissError,
          },
        ],
      };
    case "server-error":
      return {
        kind: "error",
        header: "Server error",
        content: "Server encountered an error",
        buttons: [
          {
            caption: "Dismiss",
            onClick: dismissError,
          },
        ],
      };
    case "other":
      return {
        kind: "error",
        header: "Unknown error",
        content: "An unknown error occurred",
        buttons: [
          {
            caption: "Dismiss",
            onClick: dismissError,
          },
        ],
      };
  }
};

const AppContent = () => {
  const [offlineStore] = useState(() => {
    const emptyData: DonationsData = empty();
    const browserStore = new BrowserStore({
      storageKey: "donations-data",
      isValidData: (data): data is DonationsData =>
        DonationsDataSchema.safeParse(data).success,
      timeoutMs: 3000,
    });
    return new OfflineStoreImpl({
      remote: browserStore,
      emptyData,
      isEmpty: (data) => data.orgs.length === 0 && data.donations.length === 0,
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

  const donationsData = storageState.data.data;
  const isLoading = storageState.status.kind === "syncing";
  const isSaving =
    storageState.status.kind === "syncing" &&
    storageState.data.kind === "modified";

  if (isLoading && storageState.data.kind === "new") {
    return <div>Loading donation data...</div>;
  }

  return (
    <>
      <Header
        networkStatus={
          isLoading ? "Loading..." : isSaving ? "Saving..." : undefined
        }
      />
      {syncError && (
        <StatusBox
          {...convertSyncErrorToStatusBoxProps(syncError, refreshData, () =>
            setSyncError(undefined),
          )}
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
            <Admin
              storageProvider={offlineStore}
              refreshData={refreshData}
              currentEtag={storageState.etag}
            />
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
