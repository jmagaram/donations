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

  const handleEditOrg = (updatedOrg: Organization) => {
    navigate("/orgs/" + updatedOrg.id);
  };

  return <EditOrgForm organization={organization} onEditOrg={handleEditOrg} />;
};

export default EditOrgComponent;
