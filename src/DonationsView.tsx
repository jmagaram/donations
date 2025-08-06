import { Link } from "react-router-dom";
import StatusBox from "./StatusBox";
import {
  type YearFilter,
  stringifyYearFilter,
  parseYearFilter,
} from "./yearFilter";
import { type AmountFilter } from "./amountFilter";
import { formatUSD } from "./amount";
import {
  parseCategoryFilter,
  stringifyCategoryFilter,
  type CategoryFilter,
} from "./categoryFilter";

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
  currentFilter: string;
  textFilterChanged: (filter: string) => void;
  yearFilter: YearFilter;
  yearFilterOptions: { value: string; label: string }[];
  yearFilterChanged: (yearFilter: YearFilter) => void;
  categoryFilter: CategoryFilter;
  categoryFilterOptions: { value: string; label: string }[];
  categoryFilterChanged: (categoryFilter: CategoryFilter) => void;
  amountFilter: AmountFilter;
  amountFilterChanged: (newFilter: AmountFilter) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const DonationsView = ({
  donations,
  currentFilter,
  textFilterChanged,
  yearFilter,
  yearFilterOptions,
  yearFilterChanged,
  categoryFilter,
  categoryFilterOptions,
  categoryFilterChanged,
  amountFilter,
  amountFilterChanged,
  onClearFilters,
  hasActiveFilters,
}: DonationsViewProps) => {
  // Amount filter change handlers
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
        <div className="toolbar-item large-screen">
          <label htmlFor="year-filter">Year</label>
          <select
            id="year-filter"
            value={stringifyYearFilter(yearFilter)}
            onChange={(e) => yearFilterChanged(parseYearFilter(e.target.value))}
          >
            {yearFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-item large-screen">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={stringifyCategoryFilter(categoryFilter)}
            onChange={(e) =>
              categoryFilterChanged(parseCategoryFilter(e.target.value))
            }
          >
            {categoryFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
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
          <div className="toolbar-item medium-screen large-screen">
            <label htmlFor="min-amount">Min</label>
            <select
              id="min-amount"
              value={amountFilter.min}
              onChange={(e) => handleMinAmountChange(parseInt(e.target.value))}
            >
              {getMinOptions().map((amount) => (
                <option key={amount} value={amount}>
                  {formatUSD(amount, "hidePennies")}
                </option>
              ))}
            </select>
          </div>
        )}
        {amountFilter.kind === "lessThan" && (
          <div className="toolbar-item medium-screen large-screen">
            <label htmlFor="max-amount">Max</label>
            <select
              id="max-amount"
              value={amountFilter.max}
              onChange={(e) => handleMaxAmountChange(parseInt(e.target.value))}
            >
              {getMaxOptions().map((amount) => (
                <option key={amount} value={amount}>
                  {formatUSD(amount, "hidePennies")}
                </option>
              ))}
            </select>
          </div>
        )}
        {amountFilter.kind === "between" && (
          <>
            <div className="toolbar-item medium-screen large-screen">
              <label htmlFor="min-amount">Min</label>
              <select
                id="min-amount"
                value={amountFilter.min}
                onChange={(e) =>
                  handleMinAmountChange(parseInt(e.target.value))
                }
              >
                {getMinOptions().map((amount) => (
                  <option key={amount} value={amount}>
                    {formatUSD(amount, "hidePennies")}
                  </option>
                ))}
              </select>
            </div>
            <div className="toolbar-item medium-screen large-screen">
              <label htmlFor="max-amount">Max</label>
              <select
                id="max-amount"
                value={amountFilter.max}
                onChange={(e) =>
                  handleMaxAmountChange(parseInt(e.target.value))
                }
              >
                {getMaxOptions().map((amount) => (
                  <option key={amount} value={amount}>
                    {formatUSD(amount, "hidePennies")}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="toolbar-item">
          <label htmlFor="filter">Search</label>
          <input
            type="search"
            id="filter"
            value={currentFilter}
            onChange={(e) => textFilterChanged(e.target.value)}
            placeholder="Search"
          />
        </div>
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
                <Link to={`/donations/${donation.id}/edit`}>
                  {donation.amount}
                </Link>
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
