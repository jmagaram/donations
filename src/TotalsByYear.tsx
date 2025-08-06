import { useMemo } from "react";
import { Link } from "react-router-dom";
import { type DonationsData } from "./types";
import { extractYear, getCurrentYear } from "./date";
import { formatUSD as formatAmount } from "./amount";
import { useUrlParam } from "./useUrlParam";
import {
  type YearFilter,
  parseYearFilter,
  stringifyYearFilter,
  getYearRange,
} from "./yearFilter";
import { getDonationYearRange } from "./donationsData";

interface TotalsByYearProps {
  donationsData: DonationsData;
}

type TaxStatus = "all" | "taxDeductible" | "notTaxDeductible";
type DonationType = "all" | "paid" | "pledges" | "paidAndPledges" | "unknown";

const TotalsByYear = ({ donationsData }: TotalsByYearProps) => {
  const currentYear = getCurrentYear();
  const yearRange = getDonationYearRange(donationsData.donations);
  const minYear = yearRange?.minYear ?? currentYear;
  const maxYear = yearRange?.maxYear ?? currentYear;

  const [yearFilter, updateYearFilter] = useUrlParam({
    paramName: "year",
    parseFromString: parseYearFilter,
    defaultValue: { kind: "last4" },
    noFilterValue: { kind: "all" },
    stringifyValue: stringifyYearFilter,
  });

  const [taxStatus, updateTaxStatus] = useUrlParam({
    paramName: "tax",
    parseFromString: (value) => value as TaxStatus,
    defaultValue: "all" as TaxStatus,
    noFilterValue: "all" as TaxStatus,
    stringifyValue: (value) => value === "all" ? undefined : value,
  });

  const [donationType, updateDonationType] = useUrlParam({
    paramName: "type",
    parseFromString: (value) => value as DonationType,
    defaultValue: "all" as DonationType,
    noFilterValue: "all" as DonationType,
    stringifyValue: (value) => value === "all" ? undefined : value,
  });

  const processedData = useMemo(() => {
    let years: number[] = [];
    
    if (yearFilter.kind === "all") {
      // For "all", use only years that actually have donations
      years = Array.from(new Set(donationsData.donations.map(d => extractYear(d.date)))).sort((a, b) => a - b);
    } else {
      // For specific ranges, generate years from the range
      const [yearFrom, yearTo] = getYearRange({
        yearFilter,
        minYear,
        maxYear,
        currentYear,
      });
      
      for (let year = yearFrom; year <= yearTo; year++) {
        years.push(year);
      }
    }

    // Filter donations
    const filteredDonations = donationsData.donations.filter((donation) => {
      const year = extractYear(donation.date);
      if (!years.includes(year)) return false;

      // Filter by type
      if (donationType === "paid" && donation.kind !== "paid") return false;
      if (donationType === "pledges" && donation.kind !== "pledge")
        return false;
      if (
        donationType === "paidAndPledges" &&
        !["paid", "pledge"].includes(donation.kind)
      )
        return false;
      if (donationType === "unknown" && donation.kind !== "unknown")
        return false;

      return true;
    });

    // Filter organizations by tax status and create org lookup
    const orgsById = new Map(donationsData.orgs.map((org) => [org.id, org]));
    const filteredOrgs = donationsData.orgs.filter((org) => {
      if (taxStatus === "taxDeductible" && !org.taxDeductible) return false;
      if (taxStatus === "notTaxDeductible" && org.taxDeductible) return false;
      return true;
    });

    // Build data structure: orgId -> year -> amount
    const orgYearTotals: Record<string, Record<number, number>> = {};
    const yearTotals: Record<number, number> = {};
    let grandTotal = 0;

    filteredDonations.forEach((donation) => {
      const org = orgsById.get(donation.orgId);
      if (!org || !filteredOrgs.some((o) => o.id === org.id)) return;

      const year = extractYear(donation.date);

      if (!orgYearTotals[org.id]) {
        orgYearTotals[org.id] = {};
      }
      if (!orgYearTotals[org.id][year]) {
        orgYearTotals[org.id][year] = 0;
      }
      if (!yearTotals[year]) {
        yearTotals[year] = 0;
      }

      orgYearTotals[org.id][year] += donation.amount;
      yearTotals[year] += donation.amount;
      grandTotal += donation.amount;
    });

    // Sort organizations alphabetically
    const sortedOrgs = filteredOrgs
      .filter((org) => orgYearTotals[org.id])
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      years,
      sortedOrgs,
      orgYearTotals,
      yearTotals,
      grandTotal,
    };
  }, [donationsData, yearFilter, taxStatus, donationType, minYear, maxYear, currentYear]);

  return (
    <div>
      <h1>Organization totals</h1>

      <div className="filters">
        <div>
          <label htmlFor="yearRange">Years</label>
          <select
            id="yearRange"
            value={stringifyYearFilter(yearFilter)}
            onChange={(e) => updateYearFilter(parseYearFilter(e.target.value))}
          >
            <option value="all">All years</option>
            <option value="current">Current year</option>
            <option value="previous">Previous year</option>
            <option value="last2">Last 2 years</option>
            <option value="last3">Last 3 years</option>
            <option value="last4">Last 4 years</option>
            <option value="last5">Last 5 years</option>
          </select>
        </div>

        <div>
          <label htmlFor="taxStatus">Tax status</label>
          <select
            id="taxStatus"
            value={taxStatus}
            onChange={(e) => updateTaxStatus(e.target.value as TaxStatus)}
          >
            <option value="all">All</option>
            <option value="taxDeductible">Charity (tax-deductible)</option>
            <option value="notTaxDeductible">Not tax-deductible</option>
          </select>
        </div>

        <div>
          <label htmlFor="donationType">Type</label>
          <select
            id="donationType"
            value={donationType}
            onChange={(e) => updateDonationType(e.target.value as DonationType)}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pledges">Pledge</option>
            <option value="paidAndPledges">Paid and pledge</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      {processedData.sortedOrgs.length === 0 ? (
        <p>No donations to show.</p>
      ) : (
        <div
          className="totals-by-year-grid"
          style={{
            gridTemplateColumns: `auto ${processedData.years.map(() => "auto").join(" ")} auto`,
          }}
        >
          {/* Header row */}
          <div className="totals-by-year-header">Organization</div>
          {processedData.years.map((year) => (
            <div key={year} className="totals-by-year-header">
              {year}
            </div>
          ))}
          <div className="totals-by-year-header">Total</div>

          {/* Data rows */}
          {processedData.sortedOrgs.map((org) => {
            const orgTotal = processedData.years.reduce(
              (sum, year) =>
                sum + (processedData.orgYearTotals[org.id][year] || 0),
              0,
            );

            return (
              <>
                <div key={org.id} className="totals-by-year-row">
                  <Link to={`/orgs/${org.id}`}>{org.name}</Link>
                </div>
                {processedData.years.map((year) => (
                  <div key={`${org.id}-${year}`} className="totals-by-year-row">
                    {formatAmount(
                      processedData.orgYearTotals[org.id][year] || 0,
                      "hidePennies",
                    )}
                  </div>
                ))}
                <div className="totals-by-year-row totals-by-year-total-col">
                  {formatAmount(orgTotal, "hidePennies")}
                </div>
              </>
            );
          })}

          {/* Totals row */}
          <div className="totals-by-year-total-row">Total</div>
          {processedData.years.map((year) => (
            <div key={`total-${year}`} className="totals-by-year-total-row">
              {formatAmount(processedData.yearTotals[year] || 0, "hidePennies")}
            </div>
          ))}
          <div className="totals-by-year-total-row">
            {formatAmount(processedData.grandTotal, "hidePennies")}
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalsByYear;
