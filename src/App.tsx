import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import OrgsContainer from "./OrgsContainer";
import AddOrg from "./AddOrganization";
// import OrganizationsDetailsView from "./OrganizationsDetailsView"; // No longer used directly
import OrgDetailsComponent from "./OrgDetailsComponent";
import "./App.css";
import { useState } from "react";
import { sampleData, addOrganization } from "./donationsData";
import { create } from "./organization";
import { DonationsDataSchema } from "./types";
import type { AddOrgForm } from "./organization";

// ...removed OrganizationDetailsRoute, now using OrganizationDetailsComponent...

const AppContent = () => {
  const navigate = useNavigate();
  const [donationsData, setDonationsData] = useState(() => {
    const saved = localStorage.getItem("donationsData");
    return saved ? DonationsDataSchema.parse(JSON.parse(saved)) : sampleData();
  });

  const handleAddOrganization = (formData: AddOrgForm) => {
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
          element={<AddOrg onAddOrg={handleAddOrganization} />}
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
