import { useState } from "react";
import { DonationsDataSchema, type DonationsData } from "../donationsData";
import OrgGrid from "./OrgGrid";

interface RecategorizeProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const Recategorize = ({
  donationsData,
  setDonationsData,
}: RecategorizeProps) => {
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");

  const allCategories = Array.from(
    new Set(
      donationsData.orgs
        .map((org) => org.category)
        .filter((category): category is string => category !== undefined),
    ),
  ).sort((a, b) => {
    if (a === "") return -1;
    if (b === "") return 1;
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  const handleSelectionChanged = (orgIds: string[]) => {
    setSelectedOrgIds(orgIds);
    console.log("Selected organization IDs:", orgIds);
  };

  const sortedOrgs = [...donationsData.orgs].sort((a, b) => {
    const categoryA = a.category || "";
    const categoryB = b.category || "";
    if (categoryA !== categoryB) {
      return categoryA.localeCompare(categoryB);
    }
    return a.name.localeCompare(b.name);
  });

  const handleRecategorize = () => {
    if (selectedOrgIds.length === 0) {
      alert("Select at least one organization to recategorize.");
      return;
    }

    const selectedOrgNames = donationsData.orgs
      .filter((org) => selectedOrgIds.includes(org.id))
      .map((org) => org.name)
      .join(", ");

    const trimmedCategory = newCategory.trim();
    const categoryText =
      trimmedCategory === "" ? "No category" : trimmedCategory;
    const categoryValue = trimmedCategory === "" ? undefined : trimmedCategory;

    const confirmMessage = `Change ${selectedOrgIds.length} organization(s) to "${categoryText}"?\n\n${selectedOrgNames}`;

    if (window.confirm(confirmMessage)) {
      const updatedOrgs = donationsData.orgs.map((org) => {
        if (selectedOrgIds.includes(org.id)) {
          return { ...org, category: categoryValue };
        }
        return org;
      });

      const updatedData = { ...donationsData, orgs: updatedOrgs };

      const parseResult = DonationsDataSchema.safeParse(updatedData);
      if (parseResult.success) {
        setDonationsData(parseResult.data);
        setSelectedOrgIds([]);
      } else {
        window.alert(
          "Failed to update the organizations due to a validation error. This is likely a bug in the application.",
        );
      }
    }
  };

  return (
    <div>
      <h1>Recategorize orgs</h1>
      <div className="toolbar">
        <div className="toolbar-item">
          <label htmlFor="new-category">Change to</label>
          <input
            id="new-category"
            type="text"
            list="categories"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.altKey && e.key === "ArrowDown") {
                e.preventDefault();
                try {
                  e.currentTarget.showPicker();
                } catch {
                  // If showPicker is not supported, do nothing
                }
              }
            }}
          />
          <datalist id="categories">
            {allCategories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
        <div className="toolbar-item">
          <button
            onClick={handleRecategorize}
            disabled={selectedOrgIds.length === 0}
          >
            {`Recategorize (${selectedOrgIds.length})`}
          </button>
        </div>
      </div>

      <OrgGrid
        orgs={sortedOrgs}
        mode="select"
        onSelectionChanged={handleSelectionChanged}
        selectedOrgIds={selectedOrgIds}
      />
    </div>
  );
};

export default Recategorize;
