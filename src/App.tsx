import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import OrganizationsContainer from "./OrganizationsContainer";
import AddOrganization from "./AddOrganization";
import OrganizationsDetailsView from "./OrganizationsDetailsView";
import "./App.css";
import { useState } from "react";
import { sampleData, addOrganization } from "./donationsData";
import { create } from "./organization";
import { DonationsDataSchema } from "./types";
import type { AddOrganizationForm } from "./organization";

const OrganizationDetailsRoute = ({
  donationsData,
}: {
  donationsData: any;
}) => {
  const { id } = useParams<{ id: string }>();

  const organization = donationsData.organizations.find(
    (org: any) => org.id === id
  );

  const handleDelete = (orgId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete organization:", orgId);
  };

  const handleEdit = (orgId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit organization:", orgId);
  };

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  return (
    <OrganizationsDetailsView
      organization={organization}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );
};

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
        <Route
          path="/orgs/:id"
          element={<OrganizationDetailsRoute donationsData={donationsData} />}
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
