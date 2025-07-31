import { useState } from "react";
import { type DonationsData } from "./types";
import { textMatch } from "./organization";
import OrgsView from "./OrgsView";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [filter, setFilter] = useState("");

  const filteredOrgs = donationsData.orgs
    .filter((org) => textMatch(org, filter))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <OrgsView
      orgs={filteredOrgs}
      currentFilter={filter}
      textFilterChanged={setFilter}
    />
  );
};

export default OrgsContainer;
