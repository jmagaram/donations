import { Link } from "react-router-dom";
import { type DonationsData } from "./types";
import OrgCard from "./OrgCard";

interface OrgsViewProps {
  donationsData: DonationsData;
  currentFilter: string;
  textFilterChanged: (filter: string) => void;
}

const OrgsView = ({ donationsData, currentFilter, textFilterChanged }: OrgsViewProps) => {
  return (
    <div>
      <h1>Organizations</h1>
      <Link to="/orgs/add">Add New Organization</Link>
      <div>
        <label htmlFor="filter">Filter:</label>
        <input
          type="search"
          id="filter"
          value={currentFilter}
          onChange={(e) => textFilterChanged(e.target.value)}
          placeholder="Search organizations..."
        />
      </div>
      <hr />
      <div className="org-cards">
        {donationsData.orgs.map((org) => (
          <OrgCard key={org.id} data={donationsData} orgId={org.id} />
        ))}
      </div>
    </div>
  );
};

export default OrgsView;
