import type { DonationsData } from "./types";
import { Link } from "react-router-dom";

interface OrgCardProps {
  data: DonationsData;
  orgId: string;
}

const OrgCard = ({ data, orgId }: OrgCardProps) => {
  const org = data.orgs.find((org) => org.id === orgId);
  if (!org) {
    return <div>Organization not found.</div>;
  }

  const donations = data.donations
    .filter((donation) => donation.orgId === orgId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const maxToShow = 5;
  const showDonations = donations.slice(0, maxToShow);
  const extraCount = donations.length - maxToShow;

  return (
    <div className="org-card">
      <div className="org-card__name">
        <Link to={`/org/${org.id}`}>{org.name}</Link>
      </div>
      {!org.taxDeductible && (
        <div className="org-card__not-tax-deductible">
          <strong>Not</strong> tax-deductible
        </div>
      )}
      {org.notes && <div className="org-card__notes">{org.notes}</div>}
      <div className="org-card__donations">
        {showDonations.map((donation) => {
          const date = new Date(donation.timestamp).toISOString().slice(0, 10);
          const amount = donation.amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          });
          const kind =
            donation.kind.charAt(0).toUpperCase() + donation.kind.slice(1);
          return (
            <div className="org-card__donation" key={donation.id}>
              {`${date}, ${amount}, ${kind}`}
            </div>
          );
        })}
        {extraCount > 0 && (
          <div className="org-card__donation org-card__donation--older">
            ...and {extraCount} older
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgCard;
