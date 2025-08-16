import { Link } from "react-router-dom";
import { formatUSD } from "../amount";
import { getCurrentDateIso } from "../date";
import type { Donation } from "../donation";
import KindBadge from "./KindBadge";

interface BudgetDonationListProps {
  orgId: string;
  donations: Donation[];
}

const BudgetDonationList = ({ orgId, donations }: BudgetDonationListProps) => {
  const currentDate = getCurrentDateIso();

  if (donations.length === 0) {
    // Create URL for adding new idea donation
    const params = new URLSearchParams({
      org: orgId,
      date: currentDate,
      kind: "idea",
      amount: "0",
      notes: "",
      paymentMethod: "",
    });

    return (
      <div className="budget-donations-empty">
        <div>
          <Link
            to={`/donations/add?${params.toString()}`}
            className="budget-add-link"
          >
            new
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-donations">
      {donations.map((donation) => {
        // Determine badge type - future paid donations show as ideas (since they're likely errors)
        // const isFuturePaid =
        //   donation.kind === "paid" && donation.date > currentDate;
        // const badgeKind = isFuturePaid ? "idea" : donation.kind;
        const badgeKind = donation.kind;

        return (
          <div key={donation.id} className="budget-donation-row">
            <div className="budget-donation-amount">
              <KindBadge kind={badgeKind} />
              <Link
                to={`/donations/${donation.id}/edit`}
                className="budget-amount-link"
              >
                {formatUSD(donation.amount)}
              </Link>
            </div>
            <div className="budget-donation-date">{donation.date}</div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetDonationList;
