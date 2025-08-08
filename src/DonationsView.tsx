import { Link } from "react-router-dom";
import StatusBox from "./StatusBox";
import { type AmountFilter } from "./amountFilter";
import { type CategoryFilter } from "./categoryFilter";
import CategoryPicker from "./CategoryPicker";
import { type YearFilter } from "./yearFilter";
import YearFilterPicker from "./YearFilterPicker";
import { type TaxStatusFilter } from "./taxStatusFilter";
import TaxStatusPicker from "./TaxStatusPicker";
import { type KindFilterParam } from "./kindFilter";
import KindPicker from "./KindPicker";
import AmountPicker from "./AmountPicker";
import { type SearchFilter } from "./searchFilter";
import SearchFilterBox from "./SearchFilterBox";

export interface DonationDisplay {
  id: string;
  date: string;
  amount: string;
  orgId: string;
  orgName: string;
  kind: string;
  notes: string;
  paymentMethod?: string;
}

interface DonationsViewProps {
  donations: DonationDisplay[];
  currentFilter: SearchFilter;
  textFilterChanged: (filter: SearchFilter) => void;
  yearFilter: YearFilter | undefined;
  minYear: number;
  maxYear: number;
  yearFilterChanged: (value: YearFilter | undefined) => void;
  categoryFilter: CategoryFilter | undefined;
  availableCategories: CategoryFilter[];
  categoryFilterChanged: (value: CategoryFilter | undefined) => void;
  amountFilter: AmountFilter;
  amountFilterChanged: (newFilter: AmountFilter) => void;
  taxStatusFilter: TaxStatusFilter | undefined;
  taxStatusFilterChanged: (value: TaxStatusFilter | undefined) => void;
  paymentKindFilter: KindFilterParam | undefined;
  paymentKindFilterChanged: (value: KindFilterParam | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const DonationsView = ({
  donations,
  currentFilter,
  textFilterChanged,
  yearFilter,
  minYear,
  maxYear,
  yearFilterChanged,
  categoryFilter,
  availableCategories,
  categoryFilterChanged,
  amountFilter,
  amountFilterChanged,
  taxStatusFilter,
  taxStatusFilterChanged,
  paymentKindFilter,
  paymentKindFilterChanged,
  onClearFilters,
  hasActiveFilters,
}: DonationsViewProps) => {
  const handleAmountFilterTypeChange = (newType: string) => {
    switch (newType) {
      case "all":
        amountFilterChanged({ kind: "all" });
        break;
      case "moreThan":
        amountFilterChanged({ kind: "moreThan", min: 100 }); // Default to 100
        break;
      case "lessThan":
        amountFilterChanged({ kind: "lessThan", max: 1000 }); // Default to 1000
        break;
      case "between":
        amountFilterChanged({ kind: "between", min: 100, max: 1000 }); // Default range
        break;
    }
  };

  const handleMinAmountChange = (value: number) => {
    if (amountFilter.kind === "moreThan") {
      amountFilterChanged({ kind: "moreThan", min: value });
    } else if (amountFilter.kind === "between") {
      amountFilterChanged({
        kind: "between",
        min: value,
        max: amountFilter.max,
      });
    }
  };

  const handleMaxAmountChange = (value: number) => {
    if (amountFilter.kind === "lessThan") {
      amountFilterChanged({ kind: "lessThan", max: value });
    } else if (amountFilter.kind === "between") {
      amountFilterChanged({
        kind: "between",
        min: amountFilter.min,
        max: value,
      });
    }
  };

  // Amount preset options
  const minAmountOptions = [100, 250, 500, 1000, 2500, 5000];
  const maxAmountOptions = [5000, 2500, 1000, 500, 250, 100];

  // Add current values if not in presets
  const getMinOptions = () => {
    const options = [...minAmountOptions];
    if (amountFilter.kind === "moreThan" || amountFilter.kind === "between") {
      const currentMin = amountFilter.min;
      if (!options.includes(currentMin)) {
        options.push(currentMin);
        options.sort((a, b) => a - b);
      }
    }
    return options;
  };

  const getMaxOptions = () => {
    const options = [...maxAmountOptions];
    if (amountFilter.kind === "lessThan" || amountFilter.kind === "between") {
      const currentMax = amountFilter.max;
      if (!options.includes(currentMax)) {
        options.push(currentMax);
        options.sort((a, b) => b - a);
      }
    }
    return options;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Donations</h1>
        <Link to="/donations/add">Add donation</Link>
      </div>
      <div className="toolbar">
        <YearFilterPicker
          value={yearFilter}
          onChange={yearFilterChanged}
          minYear={minYear}
          maxYear={maxYear}
          maxLastYears={3}
          className="toolbar-item large-screen"
          id="year-filter"
        />
        <CategoryPicker
          value={categoryFilter}
          availableCategories={availableCategories}
          onChange={categoryFilterChanged}
          className="toolbar-item large-screen"
          id="category-filter"
        />
        <TaxStatusPicker
          value={taxStatusFilter}
          onChange={taxStatusFilterChanged}
          className="toolbar-item large-screen"
          id="tax-status-filter"
        />
        <KindPicker
          value={paymentKindFilter}
          onChange={paymentKindFilterChanged}
          className="toolbar-item large-screen"
          id="donation-type-filter"
        />
        <div className="toolbar-item medium-screen large-screen">
          <label htmlFor="amount-filter">Amount</label>
          <select
            id="amount-filter"
            value={amountFilter.kind}
            onChange={(e) => handleAmountFilterTypeChange(e.target.value)}
          >
            <option value="all">All amounts</option>
            <option value="moreThan">More than</option>
            <option value="lessThan">Less than</option>
            <option value="between">Between</option>
          </select>
        </div>
        {amountFilter.kind === "moreThan" && (
          <AmountPicker
            label="Min"
            value={amountFilter.min}
            options={getMinOptions()}
            sort="smallestFirst"
            onChange={handleMinAmountChange}
            className="toolbar-item medium-screen large-screen"
            id="min-amount"
          />
        )}
        {amountFilter.kind === "lessThan" && (
          <AmountPicker
            label="Max"
            value={amountFilter.max}
            options={getMaxOptions()}
            sort="biggestFirst"
            onChange={handleMaxAmountChange}
            className="toolbar-item medium-screen large-screen"
            id="max-amount"
          />
        )}
        {amountFilter.kind === "between" && (
          <>
            <AmountPicker
              label="Min"
              value={amountFilter.min}
              options={getMinOptions()}
              sort="smallestFirst"
              onChange={handleMinAmountChange}
              className="toolbar-item medium-screen large-screen"
              id="min-amount"
            />
            <AmountPicker
              label="Max"
              value={amountFilter.max}
              options={getMaxOptions()}
              sort="biggestFirst"
              onChange={handleMaxAmountChange}
              className="toolbar-item medium-screen large-screen"
              id="max-amount"
            />
          </>
        )}
        <SearchFilterBox
          value={currentFilter}
          onChange={textFilterChanged}
          className="toolbar-item"
          id="filter"
          placeholder="Search"
        />
        {hasActiveFilters && (
          <div className="toolbar-item">
            <button type="button" onClick={onClearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
      {donations.length === 0 ? (
        <StatusBox content="No donations found" kind="info" />
      ) : (
        <div className="donations-grid">
          <div className="header">
            <div>Date</div>
            <div>Amount</div>
            <div>Organization</div>
            <div className="medium-screen">Kind</div>
            <div className="large-screen">Paid by</div>
            <div className="large-screen">Notes</div>
          </div>
          {donations.map((donation) => (
            <div key={donation.id} className="row">
              <div>{donation.date}</div>
              <div className="amount">
                <Link to={`/donations/${donation.id}`}>{donation.amount}</Link>
              </div>
              <div>
                <Link to={`/orgs/${donation.orgId}`}>{donation.orgName}</Link>
              </div>
              <div className="kind medium-screen">{donation.kind}</div>
              <div className="payment-method large-screen">
                {donation.paymentMethod || ""}
              </div>
              <div className="notes large-screen">{donation.notes}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationsView;
