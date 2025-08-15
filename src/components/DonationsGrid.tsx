import { Link } from "react-router-dom";
import { type DonationDisplay } from "./DonationsView";
import KindBadge from "./KindBadge";
import { getCurrentDateIso, compareDatesDesc } from "../date";

interface DonationsGridProps {
  donations: DonationDisplay[];
  showOrgName: boolean;
}

const DonationsGrid = ({ donations, showOrgName }: DonationsGridProps) => {
  const isFutureDonation = (donationDate: string): boolean => {
    return compareDatesDesc(donationDate, getCurrentDateIso()) < 0;
  };

  return (
    <div className={`donations-grid${showOrgName ? "" : " hide-org-name"}`}>
      <div className="header">
        <div>Date</div>
        <div className="amount">Amount</div>
        {showOrgName && <div>Organization</div>}
        {showOrgName ? (
          <div className="medium-screen">Kind</div>
        ) : (
          <div>Kind</div>
        )}
        <div className="large-screen">Paid by</div>
        <div className="large-screen">Notes</div>
      </div>
      {donations.map((donation) => (
        <div
          key={donation.id}
          className={`row${isFutureDonation(donation.date) ? " future" : ""}`}
        >
          <div>{donation.date}</div>
          <div className="amount">
            <KindBadge kind={donation.kind} />
            <Link to={`/donations/${donation.id}`}>{donation.amount}</Link>
          </div>
          {showOrgName && (
            <div>
              <Link to={`/orgs/${donation.orgId}`}>{donation.orgName}</Link>
            </div>
          )}
          <div className={`kind${showOrgName ? " medium-screen" : ""}`}>
            {donation.kind}
          </div>
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
