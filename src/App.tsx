import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import OrgsContainer from "./OrgsContainer";
import UpsertOrgForm from "./UpsertOrgForm";
import OrgDetailsComponent from "./OrgDetailsComponent";
import EditOrgComponent from "./EditOrgComponent";
import "./App.css";
import { useState } from "react";
import { sampleData, addOrganization } from "./donationsData";
import { create } from "./organization";
import { DonationsDataSchema } from "./types";
import type { AddOrgFormFields } from "./organization";

const AppContent = () => {
  const navigate = useNavigate();
  const [donationsData, setDonationsData] = useState(() => {
    const saved = localStorage.getItem("donationsData");
    return saved ? DonationsDataSchema.parse(JSON.parse(saved)) : sampleData();
  });

  const handleAddOrg = (formData: AddOrgFormFields) => {
    const newOrganization = create(formData);
    const updatedData = addOrganization(donationsData, newOrganization);
    setDonationsData(updatedData);
    navigate("/orgs");
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
          element={<UpsertOrgForm onSubmit={handleAddOrg} mode="add" />}
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
            <EditOrgComponent
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
