import { type DonationsData } from "./types";
import OrgsView from "./OrgsView";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  return <OrgsView donationsData={donationsData} />;
};

export default OrgsContainer;
