import { Link } from "react-router-dom";

export interface DonationDisplay {
  id: string;
  date: string;
  amount: string;
  orgId: string;
  orgName: string;
  kind: string;
  notes: string;
}

interface DonationsViewProps {
  donations: DonationDisplay[];
  currentFilter: string;
  textFilterChanged: (filter: string) => void;
  yearFrom: number;
  yearTo: number;
  minYear: number;
  maxYear: number;
  yearFilterChanged: (from: number, to: number) => void;
  amountMin: number;
  amountMax: number;
  amountFilterChanged: (min: number, max: number) => void;
  onClearFilters: () => void;
}

const DonationsView = ({
  donations,
  currentFilter,
  textFilterChanged,
  yearFrom,
  yearTo,
  minYear,
  maxYear,
  yearFilterChanged,
  amountMin,
  amountMax,
  amountFilterChanged,
  onClearFilters,
}: DonationsViewProps) => {
  const yearOptions = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  const amountOptions = [
    0,
    100,
    200,
    300,
    400,
    500,
    1000,
    2000,
    3000,
    4000,
    5000,
    Number.POSITIVE_INFINITY,
  ];

  function formatAmountOption(val: number) {
    if (val === Number.POSITIVE_INFINITY) return "Unlimited";
    return `$${val.toLocaleString()}`;
  }

  return (
    <div>
      <h1>Donations</h1>
      <div className="toolbar">
        <label htmlFor="year-from">From:</label>
        <select
          id="year-from"
          value={yearFrom}
          onChange={(e) => yearFilterChanged(Number(e.target.value), yearTo)}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <label htmlFor="year-to">To:</label>
        <select
          id="year-to"
          value={yearTo}
          onChange={(e) => yearFilterChanged(yearFrom, Number(e.target.value))}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <label htmlFor="amount-min">Min:</label>
        <select
          id="amount-min"
          value={amountMin}
          onChange={(e) =>
            amountFilterChanged(Number(e.target.value), amountMax)
          }
        >
          {amountOptions.map((a) => (
            <option key={a} value={a}>
              {formatAmountOption(a)}
            </option>
          ))}
        </select>
        <label htmlFor="amount-max">Max:</label>
        <select
          id="amount-max"
          value={amountMax}
          onChange={(e) =>
            amountFilterChanged(amountMin, Number(e.target.value))
          }
        >
          {amountOptions.map((a) => (
            <option key={a} value={a}>
              {formatAmountOption(a)}
            </option>
          ))}
        </select>
        <label htmlFor="filter">Filter:</label>
        <input
          type="search"
          id="filter"
          value={currentFilter}
          onChange={(e) => textFilterChanged(e.target.value)}
          placeholder="Search donations..."
        />
        <button
          type="button"
          onClick={onClearFilters}
          style={{ marginLeft: "1rem" }}
        >
          Clear Filters
        </button>
      </div>
      <div className="donations-page-grid">
        <div className="donations-page-grid-header">
          <div>Date</div>
          <div>Amount</div>
          <div>Organization</div>
          <div>Kind</div>
          <div>Notes</div>
        </div>
        {donations.map((donation) => (
          <div key={donation.id} className="donations-page-grid-row">
            <div>
              <Link to={`/donations/${donation.id}/edit`}>{donation.date}</Link>
            </div>
            <div>{donation.amount}</div>
            <div>
              <Link to={`/orgs/${donation.orgId}`}>{donation.orgName}</Link>
            </div>
            <div>{donation.kind}</div>
            <div>{donation.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationsView;
