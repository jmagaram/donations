import { useParams, useNavigate } from "react-router-dom";
import OrgDetailsView from "./OrgDetailsView";
import { orgDelete } from "./donationsData";
import type { DonationsData, Org } from "./types";

interface OrgDetailsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgDetailsContainer = ({
  donationsData,
  setDonationsData,
}: OrgDetailsContainerProps) => {
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

  const handleAdd = (orgId: string) => {
    navigate(`/donations/add?org=${orgId}`);
  };

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  return (
    <OrgDetailsView
      donationsData={donationsData}
      orgId={id!}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onAdd={handleAdd}
    />
  );
};

export default OrgDetailsContainer;
