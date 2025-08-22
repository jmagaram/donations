import { Link } from "react-router-dom";
import { type DonationDisplay } from "./DonationsView";
import AmountView from "./AmountView";
import { requiresWarning } from "../donation";
import React from "react";
import DateView from "./DateView";
import OrgNameView from "./OrgNameView";

interface DonationsGridProps {
  donations: DonationDisplay[];
  showOrg: boolean;
}

const DonationsGrid = ({ donations, showOrg }: DonationsGridProps) => {
  return (
    <div
      className={`grid donations-grid ${
        !showOrg ? "donations-grid--hide-org" : ""
      }`}
    >
      {/* Header */}
      <div className="grid__header">Date</div>
      <div className="grid__header grid-col--align-right">Amount</div>
      {showOrg && <div className="grid__header org-name">Organization</div>}
      {showOrg && (
        <div className="grid__header grid-col--show-large">Category</div>
      )}
      <div className="grid__header grid-col--show-large">Paid by</div>
      <div className="grid__header grid-col--show-large">Notes</div>

      {/* Data Rows */}
      {donations.map((donation) => {
        return (
          <React.Fragment key={donation.id}>
            <div className="grid__cell">
              <DateView date={donation.date} />
            </div>
            <div className="grid__cell grid-col--align-right">
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
            {showOrg && (
              <div className={"grid__cell org-name"}>
                <Link to={`/orgs/${donation.orgId}`}>
                  <OrgNameView
                    name={donation.orgName}
                    taxDeductible={donation.orgTaxDeductible}
                  />
                </Link>
              </div>
            )}
            {showOrg && (
              <div className="grid__cell grid-col--show-large">
                {donation.orgCategory ?? ""}
              </div>
            )}
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
