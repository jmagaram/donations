import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrgUpsertForm from "./OrgUpsertForm";
import type { DonationsData } from "../donationsData";
import { type OrgUpsertFields } from "../organization";
import { orgUpdate, orgAdd, findOrgById } from "../donationsData";
import { makeId } from "../nanoId";

interface OrgUpsertContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgUpsertContainer = ({
  donationsData,
  setDonationsData,
}: OrgUpsertContainerProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | undefined>();

  const isEditMode = Boolean(id);
  const organization = isEditMode ? findOrgById(donationsData, id!) : undefined;

  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(
      donationsData.orgs
        .map((org) => org.category)
        .filter(
          (cat): cat is string =>
            typeof cat === "string" && cat.trim().length > 0
        )
    );
    return Array.from(uniqueCategories).sort();
  }, [donationsData.orgs]);

  if (isEditMode && !organization) {
    return <div>Organization not found.</div>;
  }

  const handleUpsertOrg = (formData: OrgUpsertFields) => {
    setError(undefined);

    if (isEditMode) {
      if (!organization) return;
      const updatedOrg = { ...formData, id: organization.id };
      const newData = orgUpdate(donationsData, updatedOrg);
      if (!newData) {
        setError("Failed to update the organization; it could not be found.");
        return;
      }
      setDonationsData(newData);
      navigate("/orgs/" + updatedOrg.id);
    } else {
      const newOrganization = { ...formData, id: makeId() };
      const updatedData = orgAdd(donationsData, newOrganization);
      if (!updatedData) {
        setError(
          "Could not add organization; an organization with the same name might already exist."
        );
        return;
      }
      setDonationsData(updatedData);
      navigate("/orgs");
    }
  };

  return (
    <div>
      {error && <div className="errorBox">{error}</div>}
      <OrgUpsertForm
        defaultValues={organization}
        onSubmit={handleUpsertOrg}
        mode={isEditMode ? "edit" : "add"}
        categories={categories}
      />
    </div>
  );
};

export default OrgUpsertContainer;
