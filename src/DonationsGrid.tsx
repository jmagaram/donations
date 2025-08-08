import { Link } from "react-router-dom";
import { type DonationDisplay } from "./DonationsView";

interface DonationsGridProps {
  donations: DonationDisplay[];
  showOrgName: boolean;
}

const DonationsGrid = ({ donations, showOrgName }: DonationsGridProps) => {
  return (
    <div className="donations-grid">
      <div className="header">
        <div>Date</div>
        <div>Amount</div>
        {showOrgName && <div>Organization</div>}
        <div className="medium-screen">Kind</div>
        <div className="large-screen">Paid by</div>
        <div className="large-screen">Notes</div>
      </div>
      {donations.map((donation) => (
        <div key={donation.id} className="row">
          <div>{donation.date}</div>
          <div className="amount">
            <Link to={`/donations/${donation.id}`}>{donation.amount}</Link>
          </div>
          {showOrgName && (
            <div>
              <Link to={`/orgs/${donation.orgId}`}>{donation.orgName}</Link>
            </div>
          )}
          <div className="kind medium-screen">{donation.kind}</div>
          <div className="payment-method large-screen">
            {donation.paymentMethod || ""}
          </div>
          <div className="notes large-screen">{donation.notes}</div>
        </div>
      ))}
    </div>
  );
};

export default DonationsGrid;
