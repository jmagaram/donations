import { type DonationsData } from "./types";
import OrgView from "./OrganizationsView";

interface OrganizationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const OrganizationsContainer = ({
  donationsData,
}: OrganizationsContainerProps) => {
  return <OrgView organizations={donationsData.organizations} />;
};

export default OrganizationsContainer;
