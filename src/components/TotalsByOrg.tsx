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

interface TotalsByOrgProps {
  donationsData: DonationsData;
}

const TotalsByOrg = ({ donationsData }: TotalsByOrgProps) => {
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

    // Filter out years with no donations
    years = years.filter(year => yearTotals[year] > 0);

    return {
      years,
      sortedOrgs,
      orgYearTotals,
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
      <h1>Organization totals</h1>

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

      {processedData.sortedOrgs.length === 0 ? (
        <p>No donations to show.</p>
      ) : (
        <div
          className="totals-by-year-grid"
          style={{
            gridTemplateColumns: `max-content ${processedData.years
              .map(() => "max-content")
              .join(" ")} max-content`,
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
              0
            );

            return (
              <>
                <div key={org.id} className="totals-by-year-row">
                  <Link to={`/orgs/${org.id}`}>{org.name}</Link>
                </div>
                {processedData.years.map((year) => {
                  const amount = processedData.orgYearTotals[org.id][year] || 0;
                  return (
                    <div
                      key={`${org.id}-${year}`}
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
                    orgTotal,
                    "totals-by-year-row",
                    "totals-by-year-total-col",
                    "row-total"
                  )}
                >
                  {formatAmount(orgTotal, "hidePennies")}
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

export default TotalsByOrg;
