import { useParams, useNavigate } from "react-router-dom";
import OrgDetailsView from "./OrgDetailsView";
import { orgDelete } from "./donationsData";
import type { DonationsData, Org } from "./types";

interface OrgDetailsComponentProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgDetailsComponent = ({
  donationsData,
  setDonationsData,
}: OrgDetailsComponentProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const organization = donationsData.orgs.find((org: Org) => org.id === id);

  const handleDelete = (orgId: string) => {
    const updatedData = orgDelete(donationsData, orgId);
    if (updatedData !== donationsData) {
      setDonationsData(updatedData);
    }
    navigate("/");
  };

  const handleEdit = (orgId: string) => {
    navigate(`/orgs/${orgId}/edit`);
  };

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  return (
    <OrgDetailsView
      organization={organization}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );
};

export default OrgDetailsComponent;
