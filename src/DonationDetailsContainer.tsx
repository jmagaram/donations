import { useParams } from "react-router-dom";
import DonationDetailsView from "./DonationDetailsView";
import StatusBox from "./StatusBox";
import type { DonationsData } from "./donationsData";
import { findDonationById, findOrgById } from "./donationsData";

interface DonationDetailsContainerProps {
  donationsData: DonationsData;
}

const DonationDetailsContainer = ({
  donationsData,
}: DonationDetailsContainerProps) => {
  const { donationId } = useParams<{ donationId: string }>();
  if (!donationId) {
    return <StatusBox content="Donation ID not found in URL." kind="error" />;
  }
  const donation = findDonationById(donationsData, donationId);
  if (!donation) {
    return <StatusBox content="Donation not found." kind="error" />;
  }
  const organization = findOrgById(donationsData, donation.orgId);
  if (!organization) {
    return (
      <StatusBox
        content="Organization for this donation not found."
        kind="error"
      />
    );
  }
  return (
    <DonationDetailsView donation={donation} organization={organization} />
  );
};

export default DonationDetailsContainer;
