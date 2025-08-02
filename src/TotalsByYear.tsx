import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { type DonationsData } from "./types";
import { extractYear, getCurrentYear } from "./date";

interface TotalsByYearProps {
  donationsData: DonationsData;
}

type YearRange = "current" | "past2" | "past3" | "past4" | "future";
type TaxStatus = "all" | "taxDeductible" | "notTaxDeductible";
type DonationType = "all" | "paid" | "pledges" | "paidAndPledges" | "unknown";

const TotalsByYear = ({ donationsData }: TotalsByYearProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const yearRange = (searchParams.get("years") as YearRange) || "current";
  const taxStatus = (searchParams.get("tax") as TaxStatus) || "all";
  const donationType = (searchParams.get("type") as DonationType) || "all";

  const updateYearRange = (value: YearRange) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("years", value);
    setSearchParams(newParams);
  };

  const updateTaxStatus = (value: TaxStatus) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tax", value);
    setSearchParams(newParams);
  };

  const updateDonationType = (value: DonationType) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("type", value);
    setSearchParams(newParams);
  };

  const processedData = useMemo(() => {
    const currentYear = getCurrentYear();

    // Calculate year range
    const years: number[] = [];
    switch (yearRange) {
      case "current":
        years.push(currentYear);
        break;
      case "past2":
        years.push(currentYear, currentYear - 1);
        break;
      case "past3":
        years.push(currentYear, currentYear - 1, currentYear - 2);
        break;
      case "past4":
        years.push(
          currentYear,
          currentYear - 1,
          currentYear - 2,
          currentYear - 3,
        );
        break;
      case "future": // Find max year in donations
      {
        const maxYearInData = Math.max(
          ...donationsData.donations.map((d) => extractYear(d.date)),
          currentYear,
        );
        const futureEndYear = Math.min(currentYear + 5, maxYearInData);
        for (let year = currentYear + 1; year <= futureEndYear; year++) {
          years.push(year);
        }
        break;
      }
    }
    years.sort((a, b) => a - b); // Sort ascending

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
  }, [donationsData, yearRange, taxStatus, donationType]);

  return (
    <div>
      <h1>Yearly giving</h1>

      <div className="filters">
        <div>
          <label htmlFor="yearRange">Years</label>
          <select
            id="yearRange"
            value={yearRange}
            onChange={(e) => updateYearRange(e.target.value as YearRange)}
          >
            <option value="current">Current</option>
            <option value="past2">Past 2 years</option>
            <option value="past3">Past 3 years</option>
            <option value="past4">Past 4 years</option>
            <option value="future">Future</option>
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
                    $
                    {(processedData.orgYearTotals[org.id][year] || 0).toFixed(
                      2,
                    )}
                  </div>
                ))}
                <div className="totals-by-year-row totals-by-year-total-col">
                  ${orgTotal.toFixed(2)}
                </div>
              </>
            );
          })}

          {/* Totals row */}
          <div className="totals-by-year-total-row">Total</div>
          {processedData.years.map((year) => (
            <div key={`total-${year}`} className="totals-by-year-total-row">
              ${(processedData.yearTotals[year] || 0).toFixed(2)}
            </div>
          ))}
          <div className="totals-by-year-total-row">
            ${processedData.grandTotal.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalsByYear;
