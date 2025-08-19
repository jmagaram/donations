import { Link } from "react-router-dom";
import { type Org } from "../organization";
import React from "react";

interface OrgGridProps {
  orgs: Org[];
}

const OrgGrid = ({ orgs }: OrgGridProps) => {
  return (
    <div className="grid orgs-grid">
      {/* Header */}
      <div className="grid__header org-name-col">Name</div>
      <div className="grid__header grid-col--show-medium">Category</div>
      <div className="grid__header grid-col--show-large">Notes</div>

      {/* Data Rows */}
      {orgs
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((org) => (
          <React.Fragment key={org.id}>
            <div className="grid__cell org-name-col">
              <Link to={`/orgs/${org.id}`}>{org.name}</Link>
              {!org.taxDeductible && <span title="Not tax-deductible"> *</span>}
            </div>
            <div className="grid__cell grid-col--show-medium">
              {org.category || ""}
            </div>
            <div className="grid__cell grid-col--show-large">{org.notes}</div>
          </React.Fragment>
        ))}
    </div>
  );
};

export default OrgGrid;
