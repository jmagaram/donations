import { Link } from "react-router-dom";
import StatusBox from "./StatusBox";

type YearFilter = "all" | "current" | "previous" | "last2" | string;
type AmountFilterType = "all" | "moreThan" | "lessThan" | "between";

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
  categoryFilter: string;
  categoryFilterOptions: { value: string; label: string }[];
  categoryFilterChanged: (categoryFilter: string) => void;
  amountFilter: AmountFilterType;
  minAmount: number;
  maxAmount: number;
  minAmountOptions: number[];
  maxAmountOptions: number[];
  amountFilterChanged: (
    filterType: AmountFilterType,
    minValue?: number,
    maxValue?: number,
  ) => void;
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
  minAmount,
  maxAmount,
  minAmountOptions,
  maxAmountOptions,
  amountFilterChanged,
  onClearFilters,
  hasActiveFilters,
}: DonationsViewProps) => {
  // Amount filter change handlers
  const handleAmountFilterTypeChange = (newType: AmountFilterType) => {
    switch (newType) {
      case "all":
        amountFilterChanged("all");
        break;
      case "moreThan":
        amountFilterChanged("moreThan", minAmountOptions[0]); // Default to first option
        break;
      case "lessThan":
        amountFilterChanged("lessThan", undefined, maxAmountOptions[0]); // Default to first option
        break;
      case "between":
        amountFilterChanged(
          "between",
          minAmountOptions[0],
          maxAmountOptions[0],
        );
        break;
    }
  };

  const handleMinAmountChange = (value: number) => {
    if (amountFilter === "moreThan") {
      amountFilterChanged("moreThan", value);
    } else if (amountFilter === "between") {
      amountFilterChanged("between", value, maxAmount);
    }
  };

  const handleMaxAmountChange = (value: number) => {
    if (amountFilter === "lessThan") {
      amountFilterChanged("lessThan", undefined, value);
    } else if (amountFilter === "between") {
      amountFilterChanged("between", minAmount, value);
    }
  };

  function formatAmountOption(val: number) {
    if (val === Number.POSITIVE_INFINITY) return "Unlimited";
    return `$${val.toLocaleString()}`;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Donations</h1>
        <Link to="/donations/add">New donation</Link>
      </div>
      <div className="toolbar">
        <div className="toolbar-item">
          <label htmlFor="year-filter">Year</label>
          <select
            id="year-filter"
            value={yearFilter}
            onChange={(e) => yearFilterChanged(e.target.value as YearFilter)}
          >
            {yearFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-item">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => categoryFilterChanged(e.target.value)}
          >
            {categoryFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-item">
          <label htmlFor="amount-filter">Amount</label>
          <select
            id="amount-filter"
            value={amountFilter}
            onChange={(e) =>
              handleAmountFilterTypeChange(e.target.value as AmountFilterType)
            }
          >
            <option value="all">Any amount</option>
            <option value="moreThan">Minimum</option>
            <option value="lessThan">Maximum</option>
            <option value="between">Between</option>
          </select>
        </div>
        {amountFilter === "moreThan" && (
          <div className="toolbar-item">
            <label htmlFor="min-amount">Min</label>
            <select
              id="min-amount"
              value={minAmount}
              onChange={(e) => handleMinAmountChange(parseInt(e.target.value))}
            >
              {minAmountOptions.map((amount) => (
                <option key={amount} value={amount}>
                  {formatAmountOption(amount)}
                </option>
              ))}
            </select>
          </div>
        )}
        {amountFilter === "lessThan" && (
          <div className="toolbar-item">
            <label htmlFor="max-amount">Max</label>
            <select
              id="max-amount"
              value={
                maxAmount === Number.POSITIVE_INFINITY
                  ? maxAmountOptions[0]
                  : maxAmount
              }
              onChange={(e) => handleMaxAmountChange(parseInt(e.target.value))}
            >
              {maxAmountOptions.map((amount) => (
                <option key={amount} value={amount}>
                  {formatAmountOption(amount)}
                </option>
              ))}
            </select>
          </div>
        )}
        {amountFilter === "between" && (
          <>
            <div className="toolbar-item">
              <label htmlFor="min-amount">Min</label>
              <select
                id="min-amount"
                value={minAmount}
                onChange={(e) =>
                  handleMinAmountChange(parseInt(e.target.value))
                }
              >
                {minAmountOptions.map((amount) => (
                  <option key={amount} value={amount}>
                    {formatAmountOption(amount)}
                  </option>
                ))}
              </select>
            </div>
            <div className="toolbar-item">
              <label htmlFor="max-amount">Max</label>
              <select
                id="max-amount"
                value={
                  maxAmount === Number.POSITIVE_INFINITY
                    ? maxAmountOptions[0]
                    : maxAmount
                }
                onChange={(e) =>
                  handleMaxAmountChange(parseInt(e.target.value))
                }
              >
                {maxAmountOptions.map((amount) => (
                  <option key={amount} value={amount}>
                    {formatAmountOption(amount)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="toolbar-item">
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
              Remove filters
            </button>
          </div>
        )}
      </div>
      {donations.length === 0 ? (
        <StatusBox
          content="No donations found that match the criteria"
          kind="info"
        />
      ) : (
        <div className="donations-grid">
          <div className="header">
            <div>Date</div>
            <div>Amount</div>
            <div>Organization</div>
            <div className="medium-screen">Kind</div>
            <div className="large-screen">Notes</div>
          </div>
          {donations.map((donation) => (
            <div key={donation.id} className="row">
              <div>
                <Link to={`/donations/${donation.id}/edit`}>
                  {donation.date}
                </Link>
              </div>
              <div className="amount">{donation.amount}</div>
              <div>
                <Link to={`/orgs/${donation.orgId}`}>{donation.orgName}</Link>
              </div>
              <div className="kind medium-screen">
                {donation.kind}
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
