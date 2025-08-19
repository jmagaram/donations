import { useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import { type DonationsData } from "../donationsData";
import { extractYear, getCurrentYear } from "../date";
import AmountView from "./AmountView";
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
    yearFilterSearchParam,
  );
  const [taxStatusFilter, setTaxStatusFilter] = useSearchParam(
    "tax",
    taxStatusParam,
  );
  const [paymentKindFilter, setPaymentKindFilter] = useSearchParam(
    "type",
    paymentKindParam,
  );

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
    years = years.filter((year) => yearTotals[year] > 0);

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
    taxStatusFilter: TaxStatusFilter | undefined,
  ) => {
    setTaxStatusFilter(taxStatusFilter);
  };

  const updatePaymentKindFilter = (
    paymentKindFilter: KindFilterParam | undefined,
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
          className={"grid totals-grid grid--wide-columns"}
          style={{
            gridTemplateColumns: `max-content repeat(${processedData.years.length}, max-content) max-content`,
          }}
        >
          {/* Header row */}
          <div className="grid__header">Organization</div>
          {processedData.years.map((year) => (
            <div key={year} className="grid__header grid-col--align-right">
              {year}
            </div>
          ))}
          <div className="grid__header grid-col--align-right">Total</div>

          {/* Data rows */}
          {processedData.sortedOrgs.map((org) => {
            const orgTotal = processedData.years.reduce(
              (sum, year) =>
                sum + (processedData.orgYearTotals[org.id][year] || 0),
              0,
            );

            return (
              <Fragment key={org.id}>
                <div className="grid__cell">
                  <Link to={`/orgs/${org.id}`}>{org.name}</Link>
                </div>
                {processedData.years.map((year) => {
                  const amount = processedData.orgYearTotals[org.id][year] || 0;
                  return (
                    <div
                      key={`${org.id}-${year}`}
                      className={getAmountClasses(
                        amount,
                        "grid__cell",
                        "grid-col--align-right",
                      )}
                    >
                      <AmountView
                        type="single"
                        amount={amount}
                        showPennies={false}
                        showWarning={false}
                        badge={undefined}
                      />
                    </div>
                  );
                })}
                <div
                  className={getAmountClasses(
                    orgTotal,
                    "grid__cell",
                    "grid__total-col",
                    "grid-col--align-right",
                  )}
                >
                  <AmountView
                    type="single"
                    amount={orgTotal}
                    showPennies={false}
                    showWarning={false}
                    badge={undefined}
                  />
                </div>
              </Fragment>
            );
          })}

          {/* Totals row */}
          <div className="grid__cell grid__total-row">Total</div>
          {processedData.years.map((year) => {
            const amount = processedData.yearTotals[year] || 0;
            return (
              <div
                key={`total-${year}`}
                className={getAmountClasses(
                  amount,
                  "grid__cell",
                  "grid__total-row",
                  "grid-col--align-right",
                )}
              >
                <AmountView
                  type="single"
                  amount={amount}
                  showPennies={false}
                  showWarning={false}
                  badge={undefined}
                />
              </div>
            );
          })}
          <div
            className={getAmountClasses(
              processedData.grandTotal,
              "grid__cell",
              "grid__total-row",
              "grid-col--align-right",
            )}
          >
            <AmountView
              type="single"
              amount={processedData.grandTotal}
              showPennies={false}
              showWarning={false}
              badge={undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalsByOrg;
