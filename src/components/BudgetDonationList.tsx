import { Link } from "react-router-dom";
import { Fragment } from "react";
import AmountView from "./AmountView";
import { getCurrentDateIso } from "../date";
import type { Donation } from "../donation";
import { requiresWarning } from "../donation";

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
      <div>
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
    <div
      className="grid budget-grid grid--no-borders"
      style={{ gridTemplateColumns: "max-content 1fr" }}
    >
      {donations.map((donation) => {
        const showWarning = requiresWarning(donation);
        const badgeKind = donation.kind;

        return (
          <Fragment key={donation.id}>
            <div className="grid__cell grid-col--align-right">
              <Link
                to={`/donations/${donation.id}/edit`}
                className="budget-amount-link"
              >
                <AmountView
                  type="single"
                  amount={donation.amount}
                  showPennies={false}
                  showWarning={showWarning}
                  badge={badgeKind}
                />
              </Link>
            </div>
            <div className="grid__cell">{donation.date}</div>
          </Fragment>
        );
      })}
    </div>
  );
};

export default BudgetDonationList;
