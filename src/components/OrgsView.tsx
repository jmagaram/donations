import { Link } from "react-router-dom";
import { type Org } from "../organization";
import StatusBox from "./StatusBox";
import SearchFilterBox from "./SearchFilterBox";
import OrgsList from "./OrgsList";
import { type SearchFilter } from "../searchFilter";
import { type SortBy, type SortByFilter } from "../sortByFilter";

interface OrgsViewProps {
  orgs: Org[];
  currentTextFilter: SearchFilter;
  textFilterChanged: (filter: SearchFilter) => void;
  sortByFilter: SortByFilter | undefined;
  sortByFilterChanged: (value: SortByFilter | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const OrgsView = ({
  orgs,
  currentTextFilter,
  textFilterChanged,
  sortByFilter,
  sortByFilterChanged,
  onClearFilters,
  hasActiveFilters,
}: OrgsViewProps) => {
  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as SortBy;
    sortByFilterChanged(value);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orgs</h1>
        <Link to="/recategorize" className="large-screen">
          Recategorize
        </Link>
        <Link to="/orgs/add">Add organization</Link>
      </div>
      <div className="toolbar">
        <SearchFilterBox
          value={currentTextFilter}
          onChange={textFilterChanged}
          className="toolbar-item search-box"
          id="filter"
          placeholder="Search"
        />
        <div className="toolbar-item">
          <label htmlFor="sort-by">Sort by</label>
          <select
            id="sort-by"
            value={sortByFilter}
            onChange={handleSortByChange}
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="tax-status">Tax Status</option>
          </select>
        </div>
        {hasActiveFilters && (
          <div className="toolbar-item">
            <button type="button" onClick={onClearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
      {orgs.length === 0 ? (
        <StatusBox content="No organizations found" kind="info" />
      ) : (
        <OrgsList
          orgs={orgs}
          sortBy={sortByFilter ?? "name"}
          currentTextFilter={currentTextFilter}
        />
      )}
    </div>
  );
};

export default OrgsView;
