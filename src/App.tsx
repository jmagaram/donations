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
import { type DonationsData } from "./types";
import { createStorageProvider, type StorageProvider } from "./storage/index";
import type { StorageError } from "./storage/interface";
import type { StatusBoxProps } from "./StatusBox";

const convertStorageErrorToStatusBoxProps = (
  storageError: StorageError,
  refreshData: () => void,
  dismissError: () => void,
): StatusBoxProps => {
  switch (storageError.kind) {
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
        content: storageError.message,
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
        content: storageError.message,
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
    case "not-found":
      return {
        kind: "error",
        header: "Data not found",
        content: "Data not found",
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
  }
};

const AppContent = () => {
  const [storageProvider] = useState<StorageProvider>(() =>
    createStorageProvider("sessionStorage"),
  );
  const [forceUpdate, setForceUpdate] = useState(0);
  const [currentEtag, setCurrentEtag] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storageError, setStorageError] = useState<StorageError | undefined>(
    undefined,
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setStorageError(undefined);
      const cached = storageProvider.getCachedData();
      if (cached) {
        setCurrentEtag(cached.etag);
        setIsLoading(false);
      } else {
        const result = await storageProvider.refreshFromRemote();
        if (result.kind === "success") {
          setCurrentEtag(result.value.etag);
          setForceUpdate((prev) => prev + 1);
          setIsLoading(false);
        } else {
          setStorageError(result.value);
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [storageProvider]);

  const setDonationsData = async (data: DonationsData) => {
    setIsSaving(true);
    setStorageError(undefined);
    const result = await storageProvider.save(data, currentEtag);

    if (result.kind === "success") {
      setCurrentEtag(result.value.etag);
      setForceUpdate((prev) => prev + 1);
    } else {
      console.error("Could not save in App.tsx");
      if (result.value.kind === "etag-mismatch") {
        const refreshResult = await storageProvider.refreshFromRemote();
        if (refreshResult.kind === "success") {
          setCurrentEtag(refreshResult.value.etag);
          setForceUpdate((prev) => prev + 1);
          setStorageError(result.value);
        } else {
          setStorageError({
            kind: "data-corruption",
            message: "Failed to refresh data after conflict",
          });
        }
      } else {
        setStorageError(result.value);
      }
    }
    setIsSaving(false);
  };

  const refreshData = async () => {
    setIsLoading(true);
    setStorageError(undefined);
    const result = await storageProvider.refreshFromRemote();

    if (result.kind === "success") {
      setCurrentEtag(result.value.etag);
      setForceUpdate((prev) => prev + 1);
    } else {
      setStorageError(result.value);
    }

    setIsLoading(false);
  };

  // Separate effect to handle force updates without causing infinite loops
  useEffect(() => {
    // This effect just triggers re-renders when forceUpdate changes
    // It doesn't need to do anything, just existing causes a re-render
  }, [forceUpdate]);

  const donationsData = storageProvider.getCachedData()?.data;

  if (isLoading) {
    return <div>Loading donation data...</div>;
  }

  if (!donationsData) {
    return <div>No data available</div>;
  }

  return (
    <>
      <Header networkStatus={isLoading ? "Loading..." : isSaving ? "Saving..." : undefined} />
      {storageError && (
        <StatusBox
          {...convertStorageErrorToStatusBoxProps(
            storageError,
            refreshData,
            () => setStorageError(undefined),
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
              storageProvider={storageProvider}
              refreshData={refreshData}
              currentEtag={currentEtag}
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
