import { useParams, useNavigate } from "react-router-dom";
import EditOrgForm from "./EditOrgForm";
import type { DonationsData, Organization } from "./types";
import { edit, type AddOrgForm } from "./organization";
import { updateOrganization } from "./donationsData";

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

  const handleEditOrg = (formData: AddOrgForm) => {
    if (!organization) return;
    const updatedOrg = edit({ ...formData, id: organization.id });
    const newData = updateOrganization(donationsData, updatedOrg);
    setDonationsData(newData);
    navigate("/orgs/" + updatedOrg.id);
  };

  return <EditOrgForm organization={organization} onEditOrg={handleEditOrg} />;
};

export default EditOrgComponent;
