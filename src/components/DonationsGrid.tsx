import { Link } from "react-router-dom";
import { type DonationDisplay } from "./DonationsView";
import AmountView from "./AmountView";
import { requiresWarning } from "../donation";
import React from "react";

interface DonationsGridProps {
  donations: DonationDisplay[];
  showOrgName: boolean;
}

const DonationsGrid = ({ donations, showOrgName }: DonationsGridProps) => {
  return (
    <div
      className={`grid donations-grid ${!showOrgName ? "donations-grid--hide-org" : ""}`}
    >
      {/* Header */}
      <div className="grid__header">Date</div>
      <div className="grid__header grid-col--align-right">Amount</div>
      {showOrgName && <div className="grid__header org-name">Organization</div>}
      <div className="grid__header grid-col--show-large">Kind</div>
      <div className="grid__header grid-col--show-large">Paid by</div>
      <div className="grid__header grid-col--show-large">Notes</div>

      {/* Data Rows */}
      {donations.map((donation) => {
        return (
          <React.Fragment key={donation.id}>
            <div className={`grid__cell`}>{donation.date}</div>
            <div className={`grid__cell grid-col--align-right`}>
              <Link to={`/donations/${donation.id}`}>
                <AmountView
                  type="single"
                  amount={donation.amount}
                  showPennies={false}
                  showWarning={requiresWarning(donation)}
                  badge={donation.kind}
                />
              </Link>
            </div>
            {showOrgName && (
              <div className={"grid__cell org-name"}>
                <Link to={`/orgs/${donation.orgId}`}>{donation.orgName}</Link>
              </div>
            )}
            <div className="grid__cell grid-col--show-large donation-kind">
              {donation.kind}
            </div>
            <div className="grid__cell grid-col--show-large">
              {donation.paymentMethod || ""}
            </div>
            <div className={`grid__cell grid-col--show-large`}>
              {donation.notes}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DonationsGrid;
