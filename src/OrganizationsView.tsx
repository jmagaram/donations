import { type Organization } from "./types";

interface OrganizationsViewProps {
  organizations: Organization[];
}

const OrganizationsView = ({ organizations }: OrganizationsViewProps) => {
  return (
    <div>
      <h1>Organizations</h1>
      <div className="org-table">
        <div className="org-header">Name</div>
        <div className="org-header">Tax Deductible</div>
        <div className="org-header">Notes</div>
        {organizations.map((org) => (
          <>
            <div key={`${org.id}-name`} className="org-cell">{org.name}</div>
            <div key={`${org.id}-tax`} className="org-cell">{org.taxDeductible ? "Yes" : "No"}</div>
            <div key={`${org.id}-notes`} className="org-cell">{org.notes || "-"}</div>
          </>
        ))}
      </div>
    </div>
  );
};

export default OrganizationsView;
