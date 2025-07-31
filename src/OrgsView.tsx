import { Link } from "react-router-dom";
import { type Org } from "./types";

interface OrgsViewProps {
  orgs: Org[];
  currentFilter: string;
  textFilterChanged: (filter: string) => void;
}

const OrgsView = ({
  orgs,
  currentFilter,
  textFilterChanged,
}: OrgsViewProps) => {
  return (
    <div>
      <h1>Organizations</h1>
      <Link to="/orgs/add">Add New Organization</Link>
      <div>
        <input
          type="search"
          id="filter"
          value={currentFilter}
          onChange={(e) => textFilterChanged(e.target.value)}
          placeholder="Search"
        />
      </div>
      <div className="orgs-grid">
        <div className="orgs-grid-header">
          <div className="orgs-grid-header-name">Name</div>
          <div className="orgs-grid-header-tax">Tax Deductible</div>
          <div className="orgs-grid-header-notes">Notes</div>
        </div>
        {orgs
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((org) => (
            <div key={org.id} className="orgs-grid-row">
              <div className="orgs-grid-name">
                <Link to={`/orgs/${org.id}`}>{org.name}</Link>
              </div>
              <div className="orgs-grid-tax">
                {org.taxDeductible ? "Yes" : "No"}
              </div>
              <div className="orgs-grid-notes">{org.notes}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default OrgsView;
