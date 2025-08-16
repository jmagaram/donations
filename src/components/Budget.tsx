import { Link } from "react-router-dom";
import { useMemo } from "react";
import { formatUSD } from "../amount";
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

  const { activeOrgs, inactiveOrgs, yearTotals, budgetTotal, displayYears } =
    useMemo(() => {
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
        orgData.unresolvedItems.sort((a, b) =>
          compareDatesDesc(a.date, b.date),
        );
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
      <h1>Budget</h1>
      <section>
        <div className="budget-grid">
          <div className="header">
            <div>Active organizations</div>
            {displayYears.map((year) => (
              <div key={year} className="year-header">
                {year}
              </div>
            ))}
            <div className="budget-header">Budget</div>
          </div>

          {/* Active Organization Rows */}
          {activeOrgs.map((orgData) => (
            <div key={orgData.org.id} className="row">
              <div>
                <Link to={`/orgs/${orgData.org.id}`}>{orgData.org.name}</Link>
              </div>

              {displayYears.map((year) => {
                const yearData = orgData.years[year];
                const amount = yearData?.amount || 0;
                const isZero = amount === 0;

                return (
                  <div key={year}>
                    <div className={`year-cell amount${isZero ? " zero" : ""}`}>
                      {formatUSD(amount, "hidePennies")}
                    </div>
                  </div>
                );
              })}

              <div>
                <BudgetDonationList
                  orgId={orgData.org.id}
                  donations={orgData.unresolvedItems}
                />
              </div>
            </div>
          ))}

          {/* Total Row */}
          <div className="row total-row">
            <div>
              <strong>Total</strong>
            </div>
            {displayYears.map((year) => {
              const total = yearTotals[year];
              const isZero = total === 0;
              return (
                <div key={year}>
                  <div className={`year-cell amount${isZero ? " zero" : ""}`}>
                    <strong>{formatUSD(total, "hidePennies")}</strong>
                  </div>
                </div>
              );
            })}
            <div>
              <div className="budget-total">
                <strong>{formatUSD(budgetTotal, "hidePennies")}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="budget-grid-simple">
          <div className="header">
            <div>Other organizations</div>
            <div>Budget</div>
          </div>

          {/* Inactive Organization Rows */}
          {inactiveOrgs.map((orgData) => (
            <div key={orgData.org.id} className="row">
              <div>
                <Link to={`/orgs/${orgData.org.id}`}>{orgData.org.name}</Link>
              </div>
              <div>
                <BudgetDonationList
                  orgId={orgData.org.id}
                  donations={orgData.unresolvedItems}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Budget;
