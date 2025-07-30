import { type DonationsData } from "./types";
import OrgsView from "./OrgsView";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  return <OrgsView organizations={donationsData.organizations} />;
};

export default OrgsContainer;
