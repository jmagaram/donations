import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DonationUpsertForm from "./DonationUpsertForm";
import StatusBox from "./StatusBox";
import type { DonationsData } from "../donationsData";
import {
  donationDelete,
  donationUpdate,
  donationAdd,
  findDonationById,
  findOrgById,
} from "../donationsData";
import { makeId } from "../nanoId";
import type { DonationUpsertFields } from "../donation";

interface DonationUpsertContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationUpsertContainer = ({
  donationsData,
  setDonationsData,
}: DonationUpsertContainerProps) => {
  const { donationId } = useParams<{ donationId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>(undefined);

  const isEditMode = Boolean(donationId);
  const donation = isEditMode
    ? findDonationById(donationsData, donationId!)
    : undefined;

  if (isEditMode && !donation) {
    return (
      <StatusBox
        kind="error"
        content={`Donation with ID ${donationId} not found.`}
      />
    );
  }

  const defaultValues = donation ? { ...donation } : undefined;

  const handleUpsertDonation = (formData: DonationUpsertFields) => {
    setError(undefined);

    const targetOrg = findOrgById(donationsData, formData.orgId);
    if (!targetOrg) {
      setError("The selected organization no longer exists.");
      return;
    }

    if (isEditMode) {
      if (!donation) return;
      const updatedDonation = { ...formData, id: donation.id };
      const newData = donationUpdate(donationsData, updatedDonation);
      if (!newData) {
        setError(
          "Failed to update the donation. Either the donation does not exist, or the organization was not found. Go back to the Home page, reload data, and try again."
        );
        return;
      }
      setDonationsData(newData);
      navigate(-1);
    } else {
      const newDonation = { ...formData, id: makeId() };
      const updatedData = donationAdd(donationsData, newDonation);
      if (!updatedData) {
        setError("Failed to add donation");
        return;
      }
      setDonationsData(updatedData);
      navigate(-1);
    }
  };

  const handleDeleteDonation = () => {
    if (!donation || !donationId) return;
    const updatedData = donationDelete(donationsData, donationId);
    setDonationsData(updatedData);
    navigate("/orgs/" + donation.orgId);
  };

  return (
    <div>
      {error && <StatusBox content={error} kind="error" />}
      <DonationUpsertForm
        defaultValues={defaultValues}
        onSubmit={handleUpsertDonation}
        onDelete={isEditMode ? handleDeleteDonation : undefined}
        mode={isEditMode ? "edit" : "add"}
        donationsData={donationsData}
      />
    </div>
  );
};

export default DonationUpsertContainer;
