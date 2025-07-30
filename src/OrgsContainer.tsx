import { useState } from "react";
import { type DonationsData } from "./types";
import { recency, textMatch } from "./organization";
import OrgsView from "./OrgsView";

type SortOrder = "Recent first" | "Alphabetical";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [filter, setFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("Recent first");

  const filteredOrgs = donationsData.orgs.filter((org) =>
    textMatch(org, filter)
  );

  const sortedOrgs = [...filteredOrgs].sort((a, b) => {
    if (sortOrder === "Alphabetical") {
      return a.name.localeCompare(b.name);
    } else {
      const aRecency = recency(a.id, donationsData);
      const bRecency = recency(b.id, donationsData);
      return bRecency - aRecency; // Descending order (most recent first)
    }
  });

  const sortedAndFilteredData: DonationsData = {
    ...donationsData,
    orgs: sortedOrgs,
  };

  return (
    <OrgsView
      donationsData={sortedAndFilteredData}
      currentFilter={filter}
      textFilterChanged={setFilter}
      sortOrder={sortOrder}
      changeSortOrder={setSortOrder}
    />
  );
};

export default OrgsContainer;
