import { Link } from "react-router-dom";
import { type Org } from "./types";

interface OrgGridProps {
  orgs: Org[];
}

const OrgGrid = ({ orgs }: OrgGridProps) => {
  return (
    <div className="orgs-grid">
      <div className="header">
        <div className="name">Name</div>
        <div className="category medium-screen">Category</div>
        <div className="notes large-screen">Notes</div>
      </div>
      {orgs
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((org) => (
          <div key={org.id} className="row">
            <div className="name">
              <Link to={`/orgs/${org.id}`}>{org.name}</Link>
              {!org.taxDeductible && (
                <span title="Not tax-deductible"> *</span>
              )}
            </div>
            <div className="category medium-screen">{org.category || ""}</div>
            <div className="notes large-screen">{org.notes}</div>
          </div>
        ))}
    </div>
  );
};

export default OrgGrid;
