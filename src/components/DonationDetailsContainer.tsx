import { useParams, useNavigate } from "react-router-dom";
import DonationDetailsView from "./DonationDetailsView";
import StatusBox from "./StatusBox";
import type { DonationsData } from "../donationsData";
import {
  findDonationById,
  findOrgById,
  donationDelete,
} from "../donationsData";

interface DonationDetailsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationDetailsContainer = ({
  donationsData,
  setDonationsData,
}: DonationDetailsContainerProps) => {
  const { donationId } = useParams<{ donationId: string }>();
  const navigate = useNavigate();
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

  const handleDelete = () => {
    if (!donationId) return;
    const updatedData = donationDelete(donationsData, donationId);
    setDonationsData(updatedData);
    navigate(-1);
  };

  return (
    <DonationDetailsView
      donation={donation}
      organization={organization}
      onDelete={handleDelete}
    />
  );
};

export default DonationDetailsContainer;
