import React from "react";
import type { Organization } from "./types";

interface OrganizationsDetailsViewProps {
  organization: Organization;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const OrganizationsDetailsView = ({
  organization,
  onDelete,
  onEdit,
}: OrganizationsDetailsViewProps) => {
  return (
    <div>
      <h1>Organization Details</h1>
      <div>
        <strong>Name:</strong> {organization.name}
      </div>
      <div>
        <strong>Tax Deductible:</strong>{" "}
        {organization.taxDeductible ? "Yes" : "No"}
      </div>
      <div>
        <strong>Notes:</strong> {organization.notes || "-"}
      </div>
      {/* Add donations list here in the future */}
      <div style={{ marginTop: "1em" }}>
        <button onClick={() => onEdit(organization.id)}>Edit</button>
        <button
          onClick={() => onDelete(organization.id)}
          style={{ marginLeft: "0.5em", color: "red" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default OrganizationsDetailsView;
