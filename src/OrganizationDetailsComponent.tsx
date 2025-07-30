import React from "react";
import { useParams } from "react-router-dom";
import OrganizationsDetailsView from "./OrganizationsDetailsView";
import type { DonationsData, Organization } from "./types";

interface OrgDetailsComponentProps {
  donationsData: DonationsData;
}

const OrgDetailsComponent = ({ donationsData }: OrgDetailsComponentProps) => {
  const { id } = useParams<{ id: string }>();

  const organization = donationsData.organizations.find(
    (org: Organization) => org.id === id
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

export default OrgDetailsComponent;
