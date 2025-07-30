import { useParams, useNavigate } from "react-router-dom";
import UpsertOrgForm from "./UpsertOrgForm";
import type { DonationsData, Organization } from "./types";
import { edit, type AddOrgFormFields } from "./organization";
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

  const handleEditOrg = (formData: AddOrgFormFields) => {
    if (!organization) return;
    const updatedOrg = edit({ ...formData, id: organization.id });
    const newData = updateOrganization(donationsData, updatedOrg);
    setDonationsData(newData);
    navigate("/orgs/" + updatedOrg.id);
  };

  return (
    <UpsertOrgForm
      defaultValues={organization}
      onSubmit={handleEditOrg}
      mode="edit"
    />
  );
};

export default EditOrgComponent;
