import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrgUpsertForm from "./OrgUpsertForm";
import type { DonationsData } from "./types";
import { type OrgUpsertFields } from "./organization";
import { orgUpdate, findOrgById } from "./donationsData";

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
  const [error, setError] = React.useState<string | undefined>();

  const organization = findOrgById(donationsData, id || "");

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  const handleEditOrg = (formData: OrgUpsertFields) => {
    if (!organization) return;
    const updatedOrg = { ...formData, id: organization.id };
    const newData = orgUpdate(donationsData, updatedOrg);
    if (!newData) {
      setError("Failed to update the organization; it could not be found.");
      return;
    }
    setDonationsData(newData);
    navigate("/orgs/" + updatedOrg.id);
  };

  return (
    <div>
      {error && <div className="errorBox">{error}</div>}
      <OrgUpsertForm
        defaultValues={organization}
        onSubmit={handleEditOrg}
        mode="edit"
      />
    </div>
  );
};

export default OrgEditComponent;
