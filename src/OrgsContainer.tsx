import { useState } from "react";
import { type DonationsData } from "./types";
import { recency } from "./organization";
import OrgsView from "./OrgsView";

type SortOrder = "Recent first" | "Alphabetical";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [filter, setFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("Recent first");

  const filteredOrgs = donationsData.orgs.filter(org => 
    org.name.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedOrgs = [...filteredOrgs].sort((a, b) => {
    if (sortOrder === "Alphabetical") {
      return a.name.localeCompare(b.name);
    } else {
      // Recent first
      const aDonations = donationsData.donations.filter(d => d.orgId === a.id);
      const bDonations = donationsData.donations.filter(d => d.orgId === b.id);
      const aRecency = recency(a, aDonations);
      const bRecency = recency(b, bDonations);
      return bRecency - aRecency; // Descending order (most recent first)
    }
  });

  const sortedAndFilteredData: DonationsData = {
    ...donationsData,
    orgs: sortedOrgs
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
