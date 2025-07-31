import { useState } from "react";
import { type DonationsData } from "./types";
import DonationsView from "./DonationsView";

interface DonationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationsContainer = ({ donationsData }: DonationsContainerProps) => {
  const [filter, setFilter] = useState("");

  return (
    <DonationsView
      donationsData={donationsData}
      currentFilter={filter}
      textFilterChanged={setFilter}
    />
  );
};

export default DonationsContainer;