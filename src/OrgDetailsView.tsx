import type { Org } from "./types";

interface OrgDetailsViewProps {
  organization: Org;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const OrgDetailsView = ({
  organization,
  onDelete,
  onEdit,
}: OrgDetailsViewProps) => {
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

export default OrgDetailsView;
