import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DonationUpsertForm from "./DonationUpsertForm";
import type { DonationsData } from "./types";
import {
  donationDelete,
  donationUpdate,
  findDonationById,
  findOrgById,
} from "./donationsData";
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
  const [error, setError] = useState<string | undefined>(undefined);

  if (!donationId) {
    return <div>No donation ID provided in the page URL.</div>;
  }

  const donation = findDonationById(donationsData, donationId);

  if (!donation) {
    return <div>Donation with ID {donationId} not found.</div>;
  }

  const defaultValues = {
    orgId: donation.orgId,
    date: new Date(donation.timestamp),
    amount: donation.amount,
    kind: donation.kind,
    notes: donation.notes,
  };

  const handleEditDonation = (formData: DonationUpsertFields) => {
    setError(undefined);

    if (!donation) return;

    const targetOrg = findOrgById(donationsData, formData.orgId);
    if (!targetOrg) {
      setError("The selected organization no longer exists.");
      return;
    }

    const updatedDonation = editDonation({ ...formData, id: donation.id });
    const newData = donationUpdate(donationsData, updatedDonation);
    if (!newData) {
      setError(
        "Failed to update the donation. Either the donation does not exist, or the organization was not found. Go back to the Home page, reload data, and try again."
      );
      return;
    }

    setDonationsData(newData);
    navigate("/orgs/" + updatedDonation.orgId);
  };

  const handleDeleteDonation = () => {
    const updatedData = donationDelete(donationsData, donationId);
    setDonationsData(updatedData);
    navigate("/orgs/" + donation.orgId);
  };

  return (
    <div>
      {error && <div className="errorBox">{error}</div>}
      <DonationUpsertForm
        defaultValues={defaultValues}
        onSubmit={handleEditDonation}
        onDelete={handleDeleteDonation}
        mode="edit"
        donationsData={donationsData}
      />
    </div>
  );
};

export default DonationEditComponent;
