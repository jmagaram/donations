import { Link } from "react-router-dom";
import { type DonationsData } from "./types";
import OrgCard from "./OrgCard";

interface OrgsViewProps {
  donationsData: DonationsData;
}

const OrgsView = ({ donationsData }: OrgsViewProps) => {
  return (
    <div>
      <h1>Organizations</h1>
      <Link to="/orgs/add">Add New Organization</Link>
      <div className="org-cards">
        {donationsData.orgs.map((org) => (
          <OrgCard key={org.id} data={donationsData} orgId={org.id} />
        ))}
      </div>
    </div>
  );
};

export default OrgsView;
