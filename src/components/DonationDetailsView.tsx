import { Link, useNavigate } from "react-router-dom";
import type { Donation } from "../donation";
import type { Org } from "../organization";
import AmountView from "./AmountView";
import DateView from "./DateView";
import OrgNameView from "./OrgNameView";

interface DonationDetailsViewProps {
  donation: Donation;
  organization: Org;
  onDelete: () => void;
}

const DonationDetailsView = ({
  donation,
  organization,
  onDelete,
}: DonationDetailsViewProps) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/donations/${donation.id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      onDelete();
    }
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
          <Link to={`/orgs/${organization.id}`}>
            <OrgNameView
              name={organization.name}
              taxDeductible={organization.taxDeductible}
            />
          </Link>
        </dd>
        {organization.taxDeductible === false && (
          <>
            <dt>Tax-status</dt>
            <dd>Not tax-deductible</dd>
          </>
        )}
        <dt>Date</dt>
        <dd>
          <DateView date={donation.date} />
        </dd>
        <dt>Amount</dt>
        <dd>
          <AmountView
            type="single"
            amount={donation.amount}
            showPennies={true}
            showWarning={false}
            badge={donation.kind}
          />
        </dd>
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
            <dd className="readable-text">{donation.notes}</dd>
          </>
        )}
      </dl>
      <div className="toolbar">
        <button type="button" onClick={handleEdit}>
          Edit donation
        </button>
        <button type="button" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default DonationDetailsView;
