import { useParams, useNavigate } from "react-router-dom";
import DonationUpsertForm from "./DonationUpsertForm";
import type { DonationsData } from "./types";
import { donationUpdate } from "./donationsData";
import { editDonation } from "./donation";
import type { DonationUpsertFields } from "./donation";

interface DonationEditComponentProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationEditComponent = ({
  donationsData,
  setDonationsData,
}: DonationEditComponentProps) => {
  const { donationId } = useParams<{ donationId: string }>();
  const navigate = useNavigate();

  const donation = donationsData.donations.find((d) => d.id === donationId);

  if (!donation) {
    return <div>Donation not found.</div>;
  }

  const defaultValues = {
    orgId: donation.orgId,
    date: new Date(donation.timestamp).toISOString().slice(0, 10),
    amount: donation.amount,
    kind: donation.kind,
    notes: donation.notes,
  };

  const handleEditDonation = (formData: DonationUpsertFields) => {
    if (!donation) return;
    const updatedDonation = editDonation({ ...formData, id: donation.id });
    const newData = donationUpdate(donationsData, updatedDonation);
    if (!newData) {
      alert("Failed to update donation: not found.");
      return;
    }
    setDonationsData(newData);
    navigate("/orgs/" + updatedDonation.orgId);
  };

  return (
    <DonationUpsertForm
      defaultValues={defaultValues}
      onSubmit={handleEditDonation}
      mode="edit"
      donationsData={donationsData}
    />
  );
};

export default DonationEditComponent;
