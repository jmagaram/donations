import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import OrganizationsContainer from "./OrganizationsContainer";
import AddOrganization from "./AddOrganization";
import "./App.css";
import { useState } from "react";
import { sampleData, addOrganization } from "./donationsData";
import { create } from "./organization";
import { DonationsDataSchema } from "./types";
import type { AddOrganizationForm } from "./organization";

const AppContent = () => {
  const navigate = useNavigate();
  const [donationsData, setDonationsData] = useState(() => {
    const saved = localStorage.getItem("donationsData");
    return saved ? DonationsDataSchema.parse(JSON.parse(saved)) : sampleData();
  });

  const handleAddOrganization = (formData: AddOrganizationForm) => {
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
            <OrganizationsContainer
              donationsData={donationsData}
              setDonationsData={setDonationsData}
            />
          }
        />
        <Route
          path="/orgs/add"
          element={
            <AddOrganization onAddOrganization={handleAddOrganization} />
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
