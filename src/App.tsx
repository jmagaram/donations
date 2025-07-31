import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import OrgsContainer from "./OrgsContainer";
import DonationsContainer from "./DonationsContainer";
import OrgUpsertForm from "./OrgUpsertForm";
import OrgDetailsComponent from "./OrgDetailsComponent";
import OrgEditComponent from "./OrgEditComponent";
import DonationUpsertForm from "./DonationUpsertForm";
import DonationEditComponent from "./DonationEditComponent";
import "./App.css";
import { useState } from "react";
import { sampleData, orgAdd, donationAdd, empty } from "./donationsData";
import { type DonationsData, DonationsDataSchema } from "./types";
import type { OrgUpsertFields } from "./organization";
import { createDonation, type DonationUpsertFields } from "./donation";
import { nanoid } from "nanoid";

const tryCreateSampleData = () => {
  const result = sampleData();
  if (result === undefined) {
    alert("Failed to load sample data; using empty data instead.");
    return empty();
  } else {
    return result;
  }
};

const AppContent = () => {
  const navigate = useNavigate();
  const [donationsData, setDonationsData] = useState<DonationsData>(() => {
    const forceResetOfSampleData = false;
    const DONATIONS_DATA_KEY = "donationsData";
    const saved = sessionStorage.getItem(DONATIONS_DATA_KEY);
    if (forceResetOfSampleData || !saved) {
      const data = tryCreateSampleData();
      sessionStorage.setItem(DONATIONS_DATA_KEY, JSON.stringify(data));
      return data;
    } else {
      return DonationsDataSchema.parse(JSON.parse(saved));
    }
  });

  const handleAddOrg = (formData: OrgUpsertFields) => {
    const newOrganization = { ...formData, id: nanoid() };
    const updatedData = orgAdd(donationsData, newOrganization);
    if (updatedData === undefined) {
      alert("Could not add organization.");
    } else {
      setDonationsData(updatedData);
      navigate("/orgs");
    }
  };

  const handleAddDonation = (formData: DonationUpsertFields) => {
    const newDonation = createDonation(formData);
    const updatedData = donationAdd(donationsData, newDonation);
    if (updatedData === undefined) {
      alert("Failed to add donation");
    } else {
      setDonationsData(updatedData);
      navigate(`/orgs/${newDonation.orgId}`);
    }
  };

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
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
          path="/donations"
          element={
            <DonationsContainer
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/orgs/add"
          element={<OrgUpsertForm onSubmit={handleAddOrg} mode="add" />}
        />
        <Route
          path="/donations/add"
          element={
            <DonationUpsertForm
              onSubmit={handleAddDonation}
              mode="add"
              donationsData={donationsData}
            />
          }
        />
        <Route
          path="/orgs/:id"
          element={
            <OrgDetailsComponent
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/orgs/:id/edit"
          element={
            <OrgEditComponent
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/donations/:donationId/edit"
          element={
            <DonationEditComponent
              donationsData={donationsData}
              setDonationsData={setDonationsData}
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
