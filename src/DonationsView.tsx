import { Link } from "react-router-dom";

export interface DonationDisplay {
  id: string;
  date: string;
  amount: string;
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
}: DonationsViewProps) => {
  const yearOptions = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  return (
    <div>
      <h1>Donations</h1>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
        <label htmlFor="filter">Filter:</label>
        <input
          type="search"
          id="filter"
          value={currentFilter}
          onChange={(e) => textFilterChanged(e.target.value)}
          placeholder="Search donations..."
        />
      </div>
      <hr />
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
            <div>{donation.orgName}</div>
            <div>{donation.kind}</div>
            <div>{donation.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationsView;
