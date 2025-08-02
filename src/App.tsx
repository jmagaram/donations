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

const AppContent = () => {
  const [storageProvider] = useState<StorageProvider>(() =>
    createStorageProvider("webApi"),
  );
  const [forceUpdate, setForceUpdate] = useState(0);
  const [currentEtag, setCurrentEtag] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("App: Starting loadData()");
        setIsLoading(true);
        setError(undefined);
        const cached = storageProvider.getCachedData();
        if (cached) {
          console.log("App: Using cached data");
          setCurrentEtag(cached.etag);
          setIsLoading(false);
        } else {
          console.log("App: No cache, calling loadFresh()");
          const fresh = await storageProvider.loadFresh();
          console.log("App: loadFresh() completed successfully");
          setCurrentEtag(fresh.etag);
          setForceUpdate((prev) => prev + 1);
          setIsLoading(false);
        }
      } catch (err) {
        console.log("App: Error caught in loadData():", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load data";
        console.log("App: Setting error state to:", errorMessage);
        setError(errorMessage);
        console.log("App: Setting isLoading to false");
        setIsLoading(false);
      }
    };
    loadData();
  }, [storageProvider]);

  const setDonationsData = async (data: DonationsData) => {
    try {
      setError(undefined);
      const result = await storageProvider.save(data, currentEtag);
      setCurrentEtag(result.etag);
      setForceUpdate((prev) => prev + 1);
    } catch (err) {
      if (err instanceof Error && err.message.includes("ETag mismatch")) {
        try {
          const fresh = await storageProvider.loadFresh();
          setCurrentEtag(fresh.etag);
          setForceUpdate((prev) => prev + 1);
          setError(
            "Data was changed elsewhere. Your changes were not saved. Please try again.",
          );
        } catch {
          setError("Failed to refresh data after conflict");
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to save data");
      }
    }
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const fresh = await storageProvider.loadFresh();
      setCurrentEtag(fresh.etag);
      setForceUpdate((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  // Separate effect to handle force updates without causing infinite loops
  useEffect(() => {
    // This effect just triggers re-renders when forceUpdate changes
    // It doesn't need to do anything, just existing causes a re-render
  }, [forceUpdate]);

  const donationsData = storageProvider.getCachedData()?.data;

  console.log(
    "App: Render - isLoading:",
    isLoading,
    "error:",
    error,
    "donationsData:",
    !!donationsData,
  );

  if (isLoading) {
    return <div>Loading donation data...</div>;
  }

  if (error) {
    return (
      <>
        <Header />
        <StatusBox kind="error" content={error} />
        <button onClick={refreshData} style={{ marginLeft: "10px" }}>
          Refresh Data
        </button>
      </>
    );
  }

  if (!donationsData) {
    return <div>No data available</div>;
  }

  return (
    <>
      <Header />
      {error && (
        <>
          <StatusBox kind="error" content={error} />
          <button onClick={refreshData} style={{ marginLeft: "10px" }}>
            Refresh Data
          </button>
        </>
      )}
      <Routes>
        <Route
          path="/"
          element={
            <Home
              storageProvider={storageProvider}
              refreshData={refreshData}
              currentEtag={currentEtag}
            />
          }
        />
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
        <Route path="/admin" element={<Admin />} />
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
