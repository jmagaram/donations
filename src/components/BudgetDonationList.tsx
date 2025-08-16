import { Link } from "react-router-dom";
import AmountView from "./AmountView";
import { getCurrentDateIso, isOlderThanDays, isFutureDate } from "../date";
import type { Donation } from "../donation";

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
        const now = currentDate;
        const other = donation.date;
        const isOldPledge =
          donation.kind === "pledge" &&
          isOlderThanDays({ now, other, toleranceDays: 180 });
        const isOldIdea =
          donation.kind === "idea" &&
          isOlderThanDays({ now, other, toleranceDays: 180 });
        const isFuturePaid =
          donation.kind === "paid" && isFutureDate({ now, other });
        const showWarning = isOldPledge || isOldIdea || isFuturePaid;
        const badgeKind = donation.kind;

        return (
          <div key={donation.id} className="budget-donation-row">
            <div className="budget-donation-amount">
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
            <div className="budget-donation-date">{donation.date}</div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetDonationList;
