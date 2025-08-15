import { useMemo } from "react";
import { Link } from "react-router-dom";
import { type DonationsData } from "../donationsData";
import { extractYear, getCurrentYear } from "../date";
import { formatUSD as formatAmount } from "../amount";
import { useSearchParam } from "../hooks/useSearchParam";
import {
  yearFilterSearchParam,
  getYearRange,
  type YearFilter,
} from "../yearFilter";
import YearFilterPicker from "./YearFilterPicker";
import {
  taxStatusParam,
  matchesTaxStatusFilter,
  type TaxStatusFilter,
} from "../taxStatusFilter";
import TaxStatusPicker from "./TaxStatusPicker";
import {
  paymentKindParam,
  matchesPaymentKindFilter,
  type KindFilterParam,
} from "../kindFilter";
import KindPicker from "./KindPicker";
import { getDonationYearRange } from "../donationsData";

const getAmountClasses = (amount: number, ...extraClasses: string[]) => {
  const valueClass = amount > 0 ? "positive" : amount < 0 ? "negative" : "zero";
  return [valueClass, ...extraClasses].filter(Boolean).join(" ");
};

interface TotalsByCategoryProps {
  donationsData: DonationsData;
}

const TotalsByCategory = ({ donationsData }: TotalsByCategoryProps) => {
  const currentYear = getCurrentYear();
  const yearRange = getDonationYearRange(donationsData.donations);
  const minYear = yearRange?.minYear ?? currentYear;
  const maxYear = yearRange?.maxYear ?? currentYear;

  const [yearFilter, setYearFilter] = useSearchParam(
    "year",
    yearFilterSearchParam
  );
  const [taxStatusFilter, setTaxStatusFilter] = useSearchParam(
    "tax",
    taxStatusParam
  );
  const [paymentKindFilter, setPaymentKindFilter] = useSearchParam(
    "type",
    paymentKindParam
  );

  const processedData = useMemo(() => {
    let years: number[] = [];

    if (yearFilter === undefined || yearFilter.kind === "all") {
      years = Array.from(
        new Set(donationsData.donations.map((d) => extractYear(d.date)))
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
        org.taxDeductible ?? false
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

    // Filter out years with no donations
    years = years.filter(year => yearTotals[year] > 0);

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

  const updateYearFilter = (yearFilter: YearFilter | undefined) => {
    setYearFilter(yearFilter);
  };

  const updateTaxStatusFilter = (
    taxStatusFilter: TaxStatusFilter | undefined
  ) => {
    setTaxStatusFilter(taxStatusFilter);
  };

  const updatePaymentKindFilter = (
    paymentKindFilter: KindFilterParam | undefined
  ) => {
    setPaymentKindFilter(paymentKindFilter);
  };

  return (
    <div>
      <h1>Category totals</h1>

      <div className="filters">
        <YearFilterPicker
          value={yearFilter}
          onChange={updateYearFilter}
          minYear={minYear}
          maxYear={maxYear}
          maxLastYears={5}
          className="toolbar-item"
          id="yearRange"
        />

        <TaxStatusPicker
          value={taxStatusFilter}
          onChange={updateTaxStatusFilter}
          className="toolbar-item"
          id="taxStatus"
        />

        <KindPicker
          value={paymentKindFilter}
          onChange={updatePaymentKindFilter}
          className="toolbar-item"
          id="donationType"
        />
      </div>

      {processedData.sortedCategories.length === 0 ? (
        <p>No donations to show.</p>
      ) : (
        <div
          className="totals-by-year-grid"
          style={{
            gridTemplateColumns: `auto ${processedData.years
              .map(() => "max-content")
              .join(" ")} max-content`,
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
              0
            );

            return (
              <>
                <div key={category} className="totals-by-year-row">
                  {category === "(No category)" ? (
                    <Link to={`/donations?category=__no_category__`}>
                      {category}
                    </Link>
                  ) : (
                    <Link
                      to={`/donations?category=${encodeURIComponent(category)}`}
                    >
                      {category}
                    </Link>
                  )}
                </div>
                {processedData.years.map((year) => {
                  const amount =
                    processedData.categoryYearTotals[category][year] || 0;
                  return (
                    <div
                      key={`${category}-${year}`}
                      className={getAmountClasses(
                        amount,
                        "totals-by-year-row",
                        "interior-value"
                      )}
                    >
                      {formatAmount(amount, "hidePennies")}
                    </div>
                  );
                })}
                <div
                  className={getAmountClasses(
                    categoryTotal,
                    "totals-by-year-row",
                    "totals-by-year-total-col",
                    "row-total"
                  )}
                >
                  {formatAmount(categoryTotal, "hidePennies")}
                </div>
              </>
            );
          })}

          {/* Totals row */}
          <div className="totals-by-year-total-row">Total</div>
          {processedData.years.map((year) => {
            const amount = processedData.yearTotals[year] || 0;
            return (
              <div
                key={`total-${year}`}
                className={getAmountClasses(
                  amount,
                  "totals-by-year-total-row",
                  "column-total"
                )}
              >
                {formatAmount(amount, "hidePennies")}
              </div>
            );
          })}
          <div
            className={getAmountClasses(
              processedData.grandTotal,
              "totals-by-year-total-row",
              "grand-total"
            )}
          >
            {formatAmount(processedData.grandTotal, "hidePennies")}
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalsByCategory;
