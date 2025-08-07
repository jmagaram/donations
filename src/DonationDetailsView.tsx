import { Link, useNavigate } from "react-router-dom";
import { formatUSD } from "./amount";
import type { Donation, Org } from "./types";

interface DonationDetailsViewProps {
  donation: Donation;
  organization: Org;
}

const DonationDetailsView = ({
  donation,
  organization,
}: DonationDetailsViewProps) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/donations/${donation.id}/edit`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const showNotes = donation.notes.trim() != "";
  const showPaymentMethod =
    donation.paymentMethod !== undefined &&
    donation.paymentMethod.trim() !== "";

  return (
    <div className="donation-details">
      <h2>Donation Details</h2>
      <dl>
        <dt>Organization</dt>
        <dd>
          <Link to={`/orgs/${organization.id}`}>{organization.name}</Link>
        </dd>
        {organization.taxDeductible === false && (
          <>
            <dt>Tax-status</dt>
            <dd>Not tax-deductible</dd>
          </>
        )}
        <dt>Date</dt>
        <dd>{donation.date}</dd>
        <dt>Amount</dt>
        <dd>{formatUSD(donation.amount)}</dd>
        <dt>Type</dt>
        <dd className="kind">{donation.kind}</dd>
        {showPaymentMethod && (
          <>
            <dt>Payment method</dt>
            <dd>{donation.paymentMethod}</dd>
          </>
        )}
        {showNotes && (
          <>
            <dt>Notes</dt>
            <dd>{donation.notes}</dd>
          </>
        )}
      </dl>
      <div className="toolbar">
        <button type="button" onClick={handleEdit}>
          Edit donation
        </button>
        <button type="button" onClick={handleBack}>
          Done
        </button>
      </div>
    </div>
  );
};

export default DonationDetailsView;
