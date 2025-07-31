import { useParams, useNavigate } from "react-router-dom";
import OrgUpsertForm from "./OrgUpsertForm";
import type { DonationsData, Org } from "./types";
import { type OrgUpsertFields } from "./organization";
import { orgUpdate } from "./donationsData";

interface OrgEditComponentProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgEditComponent = ({
  donationsData,
  setDonationsData,
}: OrgEditComponentProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const organization = donationsData.orgs.find((org: Org) => org.id === id);

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  const handleEditOrg = (formData: OrgUpsertFields) => {
    if (!organization) return;
    const updatedOrg = { ...formData, id: organization.id };
    const newData = orgUpdate(donationsData, updatedOrg);
    if (!newData) {
      alert("Failed to update organization: not found.");
      return;
    }
    setDonationsData(newData);
    navigate("/orgs/" + updatedOrg.id);
  };

  return (
    <OrgUpsertForm
      defaultValues={organization}
      onSubmit={handleEditOrg}
      mode="edit"
    />
  );
};

export default OrgEditComponent;
