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
import "./App.css";
import { useState, useEffect } from "react";
import { type DonationsData } from "./types";
import { createStorageProvider, type StorageProvider } from "./storage/index";

const AppContent = () => {
  const [storageProvider] = useState<StorageProvider>(() =>
    createStorageProvider("sessionStorage"),
  );
  const [donationsData, setDonationsDataState] = useState<
    DonationsData | undefined
  >(undefined);
  const [currentEtag, setCurrentEtag] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(undefined);

        const cached = storageProvider.getCachedData();
        if (cached) {
          console.log("Loaded cached data!");
          setDonationsDataState(cached.data);
          setCurrentEtag(cached.etag);
          setIsLoading(false);
        } else {
          const fresh = await storageProvider.loadFresh();
          console.log("Loaded fresh data!");
          setDonationsDataState(fresh.data);
          setCurrentEtag(fresh.etag);
          setIsLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setIsLoading(false);
      }
    };

    loadData();
  }, [storageProvider]);

  const setDonationsData = async (data: DonationsData) => {
    try {
      setError(undefined);
      const result = await storageProvider.save(data, currentEtag);
      setDonationsDataState(result.data);
      setCurrentEtag(result.etag);
    } catch (err) {
      if (err instanceof Error && err.message.includes("ETag mismatch")) {
        try {
          const fresh = await storageProvider.loadFresh();
          setDonationsDataState(fresh.data);
          setCurrentEtag(fresh.etag);
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
      setDonationsDataState(fresh.data);
      setCurrentEtag(fresh.etag);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !donationsData) {
    return <div>Loading donation data...</div>;
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
