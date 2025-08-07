import { Link } from "react-router-dom";
import { type Org } from "./types";
import StatusBox from "./StatusBox";

interface OrgsViewProps {
  orgs: Org[];
  currentTextFilter: string;
  textFilterChanged: (filter: string) => void;
  currentCategoryValue: string;
  categoryFilterChanged: (value: string) => void;
  categoryFilterOptions: { value: string; label: string }[];
  currentTaxStatusValue: string;
  taxStatusFilterChanged: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const OrgsView = ({
  orgs,
  currentTextFilter,
  textFilterChanged,
  currentCategoryValue,
  categoryFilterChanged,
  categoryFilterOptions,
  currentTaxStatusValue,
  taxStatusFilterChanged,
  onClearFilters,
  hasActiveFilters,
}: OrgsViewProps) => {
  return (
    <div>
      <div className="page-header">
        <h1>Orgs</h1>
        <Link to="/orgs/add">Add organization</Link>
      </div>
      <div className="toolbar">
        <div className="toolbar-item">
          <label htmlFor="filter" className="toolbar-item">
            Search
          </label>
          <input
            type="search"
            id="filter"
            value={currentTextFilter}
            onChange={(e) => textFilterChanged(e.target.value)}
            placeholder="Search"
          />
        </div>
        <div className="toolbar-item medium-screen large-screen">
          {categoryFilterOptions.length > 1 && (
            <>
              <label htmlFor="categoryFilter">Category</label>
              <select
                id="categoryFilter"
                value={currentCategoryValue}
                onChange={(e) => categoryFilterChanged(e.target.value)}
              >
                {categoryFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        <div className="toolbar-item large-screen">
          <label htmlFor="taxStatusFilter">Tax status</label>
          <select
            id="taxStatusFilter"
            value={currentTaxStatusValue}
            onChange={(e) => taxStatusFilterChanged(e.target.value)}
          >
            <option value="all">All</option>
            <option value="charity">Charity (tax-deductible)</option>
            <option value="notTaxDeductible">Not tax-deductible</option>
          </select>
        </div>
        {hasActiveFilters && (
          <button type="button" onClick={onClearFilters}>
            Clear filters
          </button>
        )}
      </div>
      {orgs.length === 0 ? (
        <StatusBox content="No organizations found" kind="info" />
      ) : (
        <div className="orgs-grid">
          <div className="header">
            <div className="name">Name</div>
            <div className="category medium-screen">Category</div>
            <div className="notes large-screen">Notes</div>
          </div>
          {orgs
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((org) => (
              <div key={org.id} className="row">
                <div className="name">
                  <Link to={`/orgs/${org.id}`}>{org.name}</Link>
                  {!org.taxDeductible && (
                    <span title="Not tax-deductible"> *</span>
                  )}
                </div>
                <div className="category medium-screen">
                  {org.category || ""}
                </div>
                <div className="notes large-screen">{org.notes}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default OrgsView;
