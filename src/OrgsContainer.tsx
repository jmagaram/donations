import { useState } from "react";
import { type DonationsData } from "./types";
import OrgsView from "./OrgsView";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  const [filter, setFilter] = useState("");

  const filteredData: DonationsData = {
    ...donationsData,
    orgs: donationsData.orgs.filter(org => 
      org.name.toLowerCase().includes(filter.toLowerCase())
    )
  };

  return (
    <OrgsView 
      donationsData={filteredData}
      currentFilter={filter}
      textFilterChanged={setFilter}
    />
  );
};

export default OrgsContainer;
