import { Link } from "react-router-dom";
import type { DonationsData } from "./types";
import { compareDatesDesc } from "./date";
import { formatUSD as formatAmount } from "./amount";

interface OrgDetailsViewProps {
  donationsData: DonationsData;
  orgId: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: (orgId: string) => void;
}

const OrgDetailsView = ({
  donationsData,
  orgId,
  onDelete,
  onEdit,
  onAdd,
}: OrgDetailsViewProps) => {
  const organization = donationsData.orgs.find((org) => org.id === orgId);
  const donations = donationsData.donations
    .filter((donation) => donation.orgId === orgId)
    .sort((a, b) => compareDatesDesc(a.date, b.date));

  const Toolbar = () => (
    <div className="toolbar">
      <button onClick={() => onAdd(organization!.id)}>Add donation</button>
      <button onClick={() => onEdit(organization!.id)}>
        Edit organization
      </button>
      <button
        onClick={() => {
          if (window.confirm("Delete organization and all donations?")) {
            onDelete(organization!.id);
          }
        }}
      >
        Delete all
      </button>
    </div>
  );

  const formatDate = (timestamp: string): string => {
    return timestamp;
  };

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  const showCategory =
    organization.category && organization.category.trim() !== "";

  const showNotes = organization.notes.trim() !== "";

  return (
    <div className="org-details">
      <h1>{organization.name}</h1>
      {donations.length > 8 && <Toolbar />}
      <dl>
        {showCategory && (
          <>
            <dd>{organization.category}</dd>
          </>
        )}
        <dd>{organization.taxDeductible ? "Charity" : "Not tax-deductible"}</dd>
        {organization.webSite && (
          <>
            <dd>
              <a
                href={organization.webSite}
                target="_blank"
                rel="noopener noreferrer"
              >
                {organization.webSite}
              </a>
            </dd>
          </>
        )}
        {showNotes && (
          <>
            <dd>{organization.notes}</dd>
          </>
        )}
      </dl>
      <div className="section">
        {donations.length > 0 ? (
          <div className="donation-grid">
            <div className="row header">
              <div>Date</div>
              <div>Amount</div>
              <div>Kind</div>
              <div className="medium-screen">Paid by</div>
              <div className="large-screen">Notes</div>
            </div>
            {donations.map((donation) => (
              <div key={donation.id} className="row">
                <div className="date">{formatDate(donation.date)}</div>
                <div className="amount">
                  <Link to={`/donations/${donation.id}`}>
                    {formatAmount(donation.amount)}
                  </Link>
                </div>
                <div className="kind">{donation.kind}</div>
                <div className="payment-method medium-screen">
                  {donation.paymentMethod || ""}
                </div>
                <div className="notes large-screen">{donation.notes || ""}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="section">
            <div className="header">Donations</div>
            <div className="content">No donations</div>
          </div>
        )}
      </div>
      <Toolbar />
    </div>
  );
};

export default OrgDetailsView;
