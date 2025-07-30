import { type DonationsData } from "./types";
import OrgsView from "./OrgsView";

interface OrgsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrgsContainer = ({ donationsData }: OrgsContainerProps) => {
  return <OrgsView orgs={donationsData.orgs} />;
};

export default OrgsContainer;
