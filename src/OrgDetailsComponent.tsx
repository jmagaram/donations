import { useParams, useNavigate } from "react-router-dom";
import OrgDetailsView from "./OrgDetailsView";
import { deleteOrganization } from "./donationsData";
import type { DonationsData, Organization } from "./types";

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

  const organization = donationsData.organizations.find(
    (org: Organization) => org.id === id
  );

  const handleDelete = (orgId: string) => {
    try {
      const updatedData = deleteOrganization(donationsData, orgId);
      setDonationsData(updatedData);
      navigate("/");
    } catch (error) {
      window.alert(
        "Failed to delete organization: " +
          (error instanceof Error ? error.message : error)
      );
    }
  };

  const handleEdit = (orgId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit organization:", orgId);
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
