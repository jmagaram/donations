import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  return (
    <div>
      <h1>Organizations</h1>
      <div className="toolbar">
        <button type="button" onClick={() => navigate("/orgs/add")}>
          New organization
        </button>
        <input
          type="search"
          id="filter"
          value={currentFilter}
          onChange={(e) => textFilterChanged(e.target.value)}
          placeholder="Search"
        />
      </div>
      <div className="orgs-grid">
        <div className="header">
          <div className="name">Name</div>
          <div className="tax">Tax Deductible</div>
          <div className="notes">Notes</div>
        </div>
        {orgs
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((org) => (
            <div key={org.id} className="row">
              <div className="name">
                <Link to={`/orgs/${org.id}`}>{org.name}</Link>
              </div>
              <div className="tax">
                {org.taxDeductible ? "Yes" : "No"}
              </div>
              <div className="notes">{org.notes}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default OrgsView;
