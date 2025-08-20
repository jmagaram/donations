import { Link } from "react-router-dom";
import { useMemo, Fragment } from "react";
import AmountView from "./AmountView";
import OrgNameView from "./OrgNameView";
import {
  extractYear,
  getCurrentDateIso,
  compareDatesDesc,
  getCurrentYear,
} from "../date";
import type { DonationsData } from "../donationsData";
import type { Donation } from "../donation";
import type { Org } from "../organization";
import BudgetDonationList from "./BudgetDonationList";

interface BudgetProps {
  donationsData: DonationsData;
}

interface YearData {
  amount: number;
  hasPledged: boolean;
  hasUnknown: boolean;
  pledgedAmount: number;
  paidAmount: number;
}

interface OrgBudgetData {
  org: Org;
  years: Record<number, YearData>;
  unresolvedItems: Donation[]; // ideas, pledges, future paid
}

const Budget = ({ donationsData }: BudgetProps) => {
  const currentYear = getCurrentYear();
  const currentDate = getCurrentDateIso();

  const { activeOrgs, inactiveOrgs, displayYears } = useMemo(() => {
    const displayYears = [currentYear - 2, currentYear - 1, currentYear];
    const { orgs, donations } = donationsData;

    // Create org data with year totals and budget items
    const orgDataMap = new Map<string, OrgBudgetData>();

    // Initialize all orgs
    orgs.forEach((org) => {
      orgDataMap.set(org.id, {
        org,
        years: {},
        unresolvedItems: [],
      });
    });

    // Process donations
    donations.forEach((donation) => {
      const orgData = orgDataMap.get(donation.orgId);
      if (!orgData) return; // Skip donations for missing orgs

      const isFuture = compareDatesDesc(donation.date, currentDate) < 0;
      const year = extractYear(donation.date);

      if (
        donation.kind === "idea" ||
        donation.kind === "pledge" ||
        (donation.kind === "paid" && isFuture)
      ) {
        // Unresolved items: ideas (any date), pledges (any date), future paid (errors)
        orgData.unresolvedItems.push(donation);
      } else if (
        donation.kind === "paid" &&
        !isFuture &&
        displayYears.includes(year)
      ) {
        // Historical paid donations - add to year totals
        if (!orgData.years[year]) {
          orgData.years[year] = {
            amount: 0,
            hasPledged: false,
            hasUnknown: false,
            pledgedAmount: 0,
            paidAmount: 0,
          };
        }

        const yearData = orgData.years[year];
        yearData.amount += donation.amount;
        yearData.paidAmount += donation.amount;
      }
    });

    // Sort unresolved items by date (newest first)
    orgDataMap.forEach((orgData) => {
      orgData.unresolvedItems.sort((a, b) => compareDatesDesc(a.date, b.date));
    });

    // Convert to array and sort organizations
    const orgDataArray = Array.from(orgDataMap.values());

    // Separate active and inactive orgs
    const activeOrgs: OrgBudgetData[] = [];
    const inactiveOrgs: OrgBudgetData[] = [];

    orgDataArray.forEach((orgData) => {
      const hasRecentActivity =
        Object.keys(orgData.years).length > 0 ||
        orgData.unresolvedItems.length > 0;

      if (hasRecentActivity) {
        activeOrgs.push(orgData);
      } else {
        inactiveOrgs.push(orgData);
      }
    });

    // Sort each group alphabetically
    const sortByName = (a: OrgBudgetData, b: OrgBudgetData) =>
      a.org.name.localeCompare(b.org.name);

    activeOrgs.sort(sortByName);
    inactiveOrgs.sort(sortByName);

    // Calculate totals for active orgs only
    const yearTotals: Record<number, number> = {};
    let budgetTotal = 0;

    displayYears.forEach((year) => {
      yearTotals[year] = 0;
    });

    activeOrgs.forEach((orgData) => {
      // Sum year amounts
      displayYears.forEach((year) => {
        const yearData = orgData.years[year];
        if (yearData) {
          yearTotals[year] += yearData.amount;
        }
      });

      // Sum budget amounts
      orgData.unresolvedItems.forEach((donation) => {
        budgetTotal += donation.amount;
      });
    });

    return {
      activeOrgs,
      inactiveOrgs,
      yearTotals,
      budgetTotal,
      displayYears,
    };
  }, [donationsData, currentDate, currentYear]);

  return (
    <div className="budget-container">
      <h1>Plan</h1>
      <section>
        <div
          className="grid budget-grid"
          style={{
            gridTemplateColumns: `max-content repeat(${displayYears.length}, max-content) 1fr`,
          }}
        >
          {/* Header row */}
          <div className="grid__header">Active organizations</div>
          {displayYears.map((year) => (
            <div key={year} className="grid__header grid-col--align-right">
              {year}
            </div>
          ))}
          <div className="grid__header">Upcoming</div>

          {/* Active Organization Rows */}
          {activeOrgs.map((orgData) => (
            <Fragment key={orgData.org.id}>
              <div className="grid__cell org-name">
                <Link to={`/orgs/${orgData.org.id}`}>
                  <OrgNameView name={orgData.org.name} taxDeductible={orgData.org.taxDeductible} />
                </Link>
              </div>

              {displayYears.map((year) => {
                const yearData = orgData.years[year];
                const amount = yearData?.amount || 0;

                return (
                  <div
                    key={year}
                    className={"grid__cell grid-col--align-right"}
                  >
                    <AmountView
                      type="single"
                      amount={amount}
                      showPennies={false}
                      showWarning={false}
                      badge={"paid"}
                    />
                  </div>
                );
              })}

              <div className="grid__cell">
                <BudgetDonationList
                  orgId={orgData.org.id}
                  donations={orgData.unresolvedItems}
                />
              </div>
            </Fragment>
          ))}
        </div>
      </section>

      <section>
        <div
          className="grid budget-grid-simple"
          style={{
            gridTemplateColumns: "max-content 1fr",
          }}
        >
          {/* Header row */}
          <div className="grid__header">Other organizations</div>
          <div className="grid__header">Upcoming</div>

          {/* Inactive Organization Rows */}
          {inactiveOrgs.map((orgData) => (
            <Fragment key={orgData.org.id}>
              <div className="grid__cell org-name">
                <Link to={`/orgs/${orgData.org.id}`}>
                  <OrgNameView name={orgData.org.name} taxDeductible={orgData.org.taxDeductible} />
                </Link>
              </div>
              <div className="grid__cell">
                <BudgetDonationList
                  orgId={orgData.org.id}
                  donations={orgData.unresolvedItems}
                />
              </div>
            </Fragment>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Budget;
