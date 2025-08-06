import { Link } from "react-router-dom";
import { type Org } from "./types";
import StatusBox from "./StatusBox";

interface OrgsViewProps {
  orgs: Org[];
  currentTextFilter: string;
  textFilterChanged: (filter: string) => void;
  currentCategoryFilter: string;
  categoryFilterChanged: (category: string) => void;
  availableCategories: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const OrgsView = ({
  orgs,
  currentTextFilter,
  textFilterChanged,
  currentCategoryFilter,
  categoryFilterChanged,
  availableCategories,
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
          {availableCategories.length > 0 && (
            <>
              <label htmlFor="categoryFilter">Category</label>
              <select
                id="categoryFilter"
                value={currentCategoryFilter}
                onChange={(e) => categoryFilterChanged(e.target.value)}
              >
                <option value="all">All categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </>
          )}
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
