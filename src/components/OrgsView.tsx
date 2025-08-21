import { Link } from "react-router-dom";
import { type Org } from "../organization";
import StatusBox from "./StatusBox";
import SearchFilterBox from "./SearchFilterBox";
import CategoryPicker from "./CategoryPicker";
import TaxStatusPicker from "./TaxStatusPicker";
import OrgGrid from "./OrgGrid";
import { type SearchFilter } from "../searchFilter";
import { type CategoryFilter } from "../categoryFilter";
import { type TaxStatusFilter } from "../taxStatusFilter";

interface OrgsViewProps {
  orgs: Org[];
  currentTextFilter: SearchFilter;
  textFilterChanged: (filter: SearchFilter) => void;
  categoryFilter: CategoryFilter | undefined;
  availableCategories: CategoryFilter[];
  categoryFilterChanged: (value: CategoryFilter | undefined) => void;
  taxStatusFilter: TaxStatusFilter | undefined;
  taxStatusFilterChanged: (value: TaxStatusFilter | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const OrgsView = ({
  orgs,
  currentTextFilter,
  textFilterChanged,
  categoryFilter,
  availableCategories,
  categoryFilterChanged,
  taxStatusFilter,
  taxStatusFilterChanged,
  onClearFilters,
  hasActiveFilters,
}: OrgsViewProps) => {
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
        <CategoryPicker
          value={categoryFilter}
          availableCategories={availableCategories}
          onChange={categoryFilterChanged}
          className="toolbar-item medium-screen large-screen"
          id="categoryFilter"
        />
        <TaxStatusPicker
          value={taxStatusFilter}
          onChange={taxStatusFilterChanged}
          className="toolbar-item large-screen"
          id="taxStatusFilter"
        />
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
        <OrgGrid
          orgs={[...orgs].sort((a, b) => a.name.localeCompare(b.name))}
          mode="view"
        />
      )}
    </div>
  );
};

export default OrgsView;
