import React from "react";
import { Link } from "react-router-dom";
import { type Organization } from "./types";

interface OrgViewProps {
  organizations: Organization[];
}

const OrgView = ({ organizations }: OrgViewProps) => {
  return (
    <div>
      <h1>Organizations</h1>
      <Link to="/orgs/add">Add New Organization</Link>
      <div className="org-table">
        <div className="org-header">Name</div>
        <div className="org-header">Tax Deductible</div>
        <div className="org-header">Notes</div>
        {organizations.map((org) => (
          <React.Fragment key={org.id}>
            <div className="org-cell">
              <Link to={`/orgs/${org.id}`}>{org.name}</Link>
            </div>
            <div className="org-cell">{org.taxDeductible ? "Yes" : "No"}</div>
            <div className="org-cell">{org.notes || "-"}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OrgView;
