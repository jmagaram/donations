import { Link } from "react-router-dom";
import { type Org } from "../organization";
import { type Donation } from "../donation";
import StatusBox from "./StatusBox";
import SearchFilterBox from "./SearchFilterBox";
import CategoryPicker from "./CategoryPicker";
import TaxStatusPicker from "./TaxStatusPicker";
import OrgCard from "./OrgCard";
import { getCurrentDateIso, isOlderThanDays, isFutureDate } from "../date";
import { type SearchFilter } from "../searchFilter";
import { type CategoryFilter } from "../categoryFilter";
import { type TaxStatusFilter } from "../taxStatusFilter";

interface OrgWithDonations {
  org: Org;
  donations: Pick<Donation, "date" | "amount" | "kind">[];
}

interface OrgsViewProps {
  orgs: OrgWithDonations[];
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
  // If there's a search string, show all orgs in the top section and hide inactive
  const isSearching = currentTextFilter.trim() !== "";

  // Determine active vs inactive orgs based on recent/future donations (5 years tolerance)
  const now = getCurrentDateIso();
  const fiveYearsDays = 5 * 365;
  let activeOrgs: typeof orgs = [];
  let inactiveOrgs: typeof orgs = [];
  if (isSearching) {
    activeOrgs = orgs;
    inactiveOrgs = [];
  } else {
    activeOrgs = orgs.filter((o) =>
      o.donations.some(
        (d) =>
          !isOlderThanDays({
            now,
            other: d.date,
            toleranceDays: fiveYearsDays,
          }) || isFutureDate({ now, other: d.date })
      )
    );
    inactiveOrgs = orgs.filter((o) => !activeOrgs.includes(o));
  }

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
        <div>
          {activeOrgs.length > 0 && (
            <div className="org-list">
              {[...activeOrgs]
                .sort((a, b) => a.org.name.localeCompare(b.org.name))
                .map((o) => (
                  <OrgCard key={o.org.id} org={o.org} donations={o.donations} />
                ))}
            </div>
          )}
          {inactiveOrgs.length > 0 && (
            <>
              <h2>Inactive orgs</h2>
              <div className="org-list">
                {[...inactiveOrgs]
                  .sort((a, b) => a.org.name.localeCompare(b.org.name))
                  .map((o) => (
                    <OrgCard
                      key={o.org.id}
                      org={o.org}
                      donations={o.donations}
                    />
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OrgsView;
