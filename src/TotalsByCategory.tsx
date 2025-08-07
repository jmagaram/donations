import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { type DonationsData } from "./types";
import { extractYear, getCurrentYear } from "./date";
import { formatUSD as formatAmount } from "./amount";
import { useUrlParamValue } from "./urlParam";
import { yearFilterParam, getYearRange } from "./yearFilterParam";
import {
  taxStatusFilterParam,
  matchesTaxStatusFilter,
} from "./taxStatusFilterParam";
import {
  paymentKindUrlParam,
  matchesPaymentKindFilter,
} from "./donationTypeFilterParam";
import { getDonationYearRange } from "./donationsData";

interface TotalsByCategoryProps {
  donationsData: DonationsData;
}

const NO_FILTER = "__no_filter__";

const TotalsByCategory = ({ donationsData }: TotalsByCategoryProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentYear = getCurrentYear();
  const yearRange = getDonationYearRange(donationsData.donations);
  const minYear = yearRange?.minYear ?? currentYear;
  const maxYear = yearRange?.maxYear ?? currentYear;

  const yearFilter = useUrlParamValue("year", yearFilterParam);
  const taxStatusFilter = useUrlParamValue("tax", taxStatusFilterParam);
  const paymentKindFilter = useUrlParamValue("type", paymentKindUrlParam);

  const processedData = useMemo(() => {
    let years: number[] = [];

    if (yearFilter === undefined || yearFilter.kind === "all") {
      years = Array.from(
        new Set(donationsData.donations.map((d) => extractYear(d.date))),
      ).sort((a, b) => a - b);
    } else {
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

    const filteredDonations = donationsData.donations.filter((donation) => {
      const year = extractYear(donation.date);
      if (!years.includes(year)) return false;

      if (!matchesPaymentKindFilter(donation.kind, paymentKindFilter))
        return false;

      return true;
    });

    const orgsById = new Map(donationsData.orgs.map((org) => [org.id, org]));
    const filteredOrgs = donationsData.orgs.filter((org) => {
      return matchesTaxStatusFilter(
        taxStatusFilter,
        org.taxDeductible ?? false,
      );
    });

    // Build data structure: category -> year -> amount
    const categoryYearTotals: Record<string, Record<number, number>> = {};
    const yearTotals: Record<number, number> = {};
    let grandTotal = 0;

    filteredDonations.forEach((donation) => {
      const org = orgsById.get(donation.orgId);
      if (!org || !filteredOrgs.some((o) => o.id === org.id)) return;

      const year = extractYear(donation.date);
      const category = org.category || "(No category)";

      if (!categoryYearTotals[category]) {
        categoryYearTotals[category] = {};
      }
      if (!categoryYearTotals[category][year]) {
        categoryYearTotals[category][year] = 0;
      }
      if (!yearTotals[year]) {
        yearTotals[year] = 0;
      }

      categoryYearTotals[category][year] += donation.amount;
      yearTotals[year] += donation.amount;
      grandTotal += donation.amount;
    });

    // Sort categories alphabetically, with "(No category)" first
    const sortedCategories = Object.keys(categoryYearTotals).sort((a, b) => {
      if (a === "(No category)") return -1;
      if (b === "(No category)") return 1;
      return a.localeCompare(b);
    });

    return {
      years,
      sortedCategories,
      categoryYearTotals,
      yearTotals,
      grandTotal,
    };
  }, [
    donationsData,
    yearFilter,
    taxStatusFilter,
    paymentKindFilter,
    minYear,
    maxYear,
    currentYear,
  ]);

  const updateYearFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const yearFilter =
      value === NO_FILTER ? undefined : yearFilterParam.parse(value);
    const encoded = yearFilterParam.encode(yearFilter ?? { kind: "all" });
    if (encoded) {
      newParams.set("year", encoded);
    } else {
      newParams.delete("year");
    }
    setSearchParams(newParams);
  };

  const updateTaxStatusFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const taxStatusFilter =
      value === NO_FILTER ? undefined : taxStatusFilterParam.parse(value);
    const encoded = taxStatusFilterParam.encode(
      taxStatusFilter ?? { kind: "all" },
    );
    if (encoded) {
      newParams.set("tax", encoded);
    } else {
      newParams.delete("tax");
    }
    setSearchParams(newParams);
  };

  const updatePaymentKindFilter = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    const paymentKindFilter =
      value === NO_FILTER ? undefined : paymentKindUrlParam.parse(value);
    const encoded = paymentKindUrlParam.encode(paymentKindFilter ?? "all");
    if (encoded) {
      newParams.set("type", encoded);
    } else {
      newParams.delete("type");
    }
    setSearchParams(newParams);
  };

  const currentYearValue =
    yearFilter === undefined
      ? NO_FILTER
      : (yearFilterParam.encode(yearFilter) ?? NO_FILTER);
  const currentTaxStatusValue = taxStatusFilter
    ? (taxStatusFilterParam.encode(taxStatusFilter) ?? NO_FILTER)
    : NO_FILTER;
  const currentPaymentKindValue = paymentKindFilter
    ? (paymentKindUrlParam.encode(paymentKindFilter) ?? NO_FILTER)
    : NO_FILTER;

  return (
    <div>
      <h1>Category totals</h1>

      <div className="filters">
        <div>
          <label htmlFor="yearRange">Years</label>
          <select
            id="yearRange"
            value={currentYearValue}
            onChange={(e) => updateYearFilter(e.target.value)}
          >
            <option value={NO_FILTER}>All years</option>
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
            value={currentTaxStatusValue}
            onChange={(e) => updateTaxStatusFilter(e.target.value)}
          >
            <option value={NO_FILTER}>Any tax status</option>
            <option value="charity">Charity</option>
            <option value="notTaxDeductible">Not tax-deductible</option>
          </select>
        </div>

        <div>
          <label htmlFor="donationType">Kind</label>
          <select
            id="donationType"
            value={currentPaymentKindValue}
            onChange={(e) => updatePaymentKindFilter(e.target.value)}
          >
            <option value={NO_FILTER}>Any kind</option>
            <option value="paid">Paid</option>
            <option value="pledge">Pledge</option>
            <option value="paidAndPledge">Paid and pledge</option>
            <option value="unknown">Unknown</option>
            <option value="idea">Idea</option>
          </select>
        </div>
      </div>

      {processedData.sortedCategories.length === 0 ? (
        <p>No donations to show.</p>
      ) : (
        <div
          className="totals-by-year-grid"
          style={{
            gridTemplateColumns: `auto ${processedData.years.map(() => "auto").join(" ")} auto`,
          }}
        >
          {/* Header row */}
          <div className="totals-by-year-header">Category</div>
          {processedData.years.map((year) => (
            <div key={year} className="totals-by-year-header">
              {year}
            </div>
          ))}
          <div className="totals-by-year-header">Total</div>

          {/* Data rows */}
          {processedData.sortedCategories.map((category) => {
            const categoryTotal = processedData.years.reduce(
              (sum, year) =>
                sum + (processedData.categoryYearTotals[category][year] || 0),
              0,
            );

            return (
              <>
                <div key={category} className="totals-by-year-row">
                  {category === "(No category)" ? (
                    <Link to={`/donations?category=`}>{category}</Link>
                  ) : (
                    <Link
                      to={`/donations?category=${encodeURIComponent(category)}`}
                    >
                      {category}
                    </Link>
                  )}
                </div>
                {processedData.years.map((year) => (
                  <div
                    key={`${category}-${year}`}
                    className="totals-by-year-row"
                  >
                    {formatAmount(
                      processedData.categoryYearTotals[category][year] || 0,
                      "hidePennies",
                    )}
                  </div>
                ))}
                <div className="totals-by-year-row totals-by-year-total-col">
                  {formatAmount(categoryTotal, "hidePennies")}
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

export default TotalsByCategory;
