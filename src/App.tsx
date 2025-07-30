import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import OrgsContainer from "./OrgsContainer";
import OrgUpsertForm from "./OrgUpsertForm";
import OrgDetailsComponent from "./OrgDetailsComponent";
import OrgEditComponent from "./OrgEditComponent";
import DonationUpsertForm from "./DonationUpsertForm";
import DonationEditComponent from "./DonationEditComponent";
import "./App.css";
import { useState } from "react";
import { sampleData, orgAdd, donationAdd } from "./donationsData";
import { create } from "./organization";
import { DonationsDataSchema } from "./types";
import type { OrgUpsertFields } from "./organization";
import { createDonation, type DonationUpsertFields } from "./donation";

const AppContent = () => {
  const navigate = useNavigate();
  const [donationsData, setDonationsData] = useState(() => {
    // const m = sampleData();
    // localStorage.setItem("donationsData", JSON.stringify(m));
    const saved = localStorage.getItem("donationsData");
    return saved ? DonationsDataSchema.parse(JSON.parse(saved)) : sampleData();
  });

  const handleAddOrg = (formData: OrgUpsertFields) => {
    const newOrganization = create(formData);
    const updatedData = orgAdd(donationsData, newOrganization);
    setDonationsData(updatedData);
    navigate("/orgs");
  };

  const handleAddDonation = (formData: DonationUpsertFields) => {
    const newDonation = createDonation(formData);
    const updatedData = donationAdd(donationsData, newDonation);
    if (updatedData === undefined) {
      alert("Failed to add donation: organization not found.");
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
