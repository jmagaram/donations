import { Link } from "react-router-dom";
import { type DonationsData } from "./types";

interface DonationsViewProps {
  donationsData: DonationsData;
  currentFilter: string;
  textFilterChanged: (filter: string) => void;
}

const DonationsView = ({
  donationsData,
  currentFilter,
  textFilterChanged,
}: DonationsViewProps) => {
  const getOrgName = (orgId: string) => {
    const org = donationsData.orgs.find((o) => o.id === orgId);
    return org?.name || "Unknown Organization";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toISOString().split("T")[0];
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toISOString().split("T")[0];
  };

  return (
    <div>
      <h1>Donations</h1>
      <Link to="/donations/add">Add New Donation</Link>
      <div>
        <label htmlFor="filter">Filter:</label>
        <input
          type="search"
          id="filter"
          value={currentFilter}
          onChange={(e) => textFilterChanged(e.target.value)}
          placeholder="Search donations..."
        />
      </div>
      <hr />
      <div className="donations-page-grid">
        <div className="donations-page-grid-header">
          <div>Date</div>
          <div>Amount</div>
          <div>Organization</div>
          <div>Kind</div>
          <div>Notes</div>
        </div>
        {donationsData.donations.map((donation) => (
          <div key={donation.id} className="donations-page-grid-row">
            <div>
              <Link to={`/donations/${donation.id}/edit`}>
                {formatDate(donation.timestamp)}
              </Link>
            </div>
            <div>{formatAmount(donation.amount)}</div>
            <div>{getOrgName(donation.orgId)}</div>
            <div>{donation.kind}</div>
            <div>{donation.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationsView;
