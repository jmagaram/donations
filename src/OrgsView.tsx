import { Link } from "react-router-dom";
import { type DonationsData } from "./types";
import OrgCard from "./OrgCard";

type SortOrder = "Recent first" | "Alphabetical";

interface OrgsViewProps {
  donationsData: DonationsData;
  currentFilter: string;
  textFilterChanged: (filter: string) => void;
  sortOrder: SortOrder;
  changeSortOrder: (sortOrder: SortOrder) => void;
}

const OrgsView = ({ donationsData, currentFilter, textFilterChanged, sortOrder, changeSortOrder }: OrgsViewProps) => {
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
      <div>
        <label htmlFor="sortOrder">Sort by:</label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => changeSortOrder(e.target.value as SortOrder)}
        >
          <option value="Recent first">Recent first</option>
          <option value="Alphabetical">Alphabetical</option>
        </select>
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
