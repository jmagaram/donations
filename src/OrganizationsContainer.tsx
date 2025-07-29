import { type DonationsData } from "./types";
import OrganizationsView from "./OrganizationsView";

interface OrganizationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrganizationsContainer = ({
  donationsData,
}: OrganizationsContainerProps) => {
  return <OrganizationsView organizations={donationsData.organizations} />;
};

export default OrganizationsContainer;
