import { useParams, useNavigate } from "react-router-dom";
import EditOrgForm from "./EditOrgForm";
import type { DonationsData, Organization } from "./types";

interface EditOrgComponentProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const EditOrgComponent = ({
  donationsData,
  setDonationsData,
}: EditOrgComponentProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const organization = donationsData.organizations.find(
    (org: Organization) => org.id === id
  );

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  // You can implement handleEditOrg to update the organization and call setDonationsData
  const handleEditOrg = (updatedOrg: Organization) => {
    // TODO: Implement update logic and call setDonationsData
    // Example: setDonationsData(updateOrganization(donationsData, updatedOrg));
    navigate("/orgs/" + updatedOrg.id);
  };

  return <EditOrgForm organization={organization} onEditOrg={handleEditOrg} />;
};

export default EditOrgComponent;
