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
import "./App.css";
import { useState } from "react";
import { tryCreateSampleData } from "./donationsData";
import { type DonationsData, DonationsDataSchema } from "./types";

const AppContent = () => {
  const [donationsData, setDonationsData] = useState<DonationsData>(() => {
    const FORCE_RESET_SAMPLE_DATA = true;
    const DONATIONS_DATA_KEY = "donationsData";
    const saved = sessionStorage.getItem(DONATIONS_DATA_KEY);
    if (FORCE_RESET_SAMPLE_DATA || !saved) {
      const data = tryCreateSampleData();
      sessionStorage.setItem(DONATIONS_DATA_KEY, JSON.stringify(data));
      return data;
    } else {
      return DonationsDataSchema.parse(JSON.parse(saved));
    }
  });

  return (
    <>
      <Header />
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
        <Route path="/reports/yearlytotals" element={<TotalsByYear donationsData={donationsData} />} />
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
