import { Link } from "react-router-dom";
import type { DonationsData } from "./types";

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
    .sort((a, b) => b.timestamp - a.timestamp);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toISOString().slice(0, 10);
  };

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  return (
    <div className="org-details">
      <h1>{organization.name}</h1>
      <div className="section">
        <div className="header">Tax status</div>
        <div className="content">
          {organization.taxDeductible ? "Tax-deductible" : "NOT tax-deductible"}
        </div>
        {organization.webSite && (
          <>
            <div className="header">Website</div>
            <div className="content">
              <a
                href={organization.webSite}
                target="_blank"
                rel="noopener noreferrer"
              >
                {organization.webSite}
              </a>
            </div>
          </>
        )}
        {organization.notes.trim() !== "" && (
          <>
            <div className="header">Notes</div>
            <div className="content">{organization.notes}</div>
          </>
        )}
      </div>
      <div className="section">
        {donations.length > 0 ? (
          <div className="donation-grid">
            <div className="row header">
              <div>Date</div>
              <div>Amount</div>
              <div>Kind</div>
              <div>Notes</div>
            </div>
            {donations.map((donation) => (
              <div key={donation.id} className="row">
                <div className="date">
                  <Link to={`/donations/${donation.id}/edit`}>
                    {formatDate(donation.timestamp)}
                  </Link>
                </div>
                <div className="amount">
                  {formatAmount(donation.amount)}
                </div>
                <div className="kind">{donation.kind}</div>
                <div className="notes">
                  {donation.notes || "-"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="section">
            <div className="header">Donations</div>
            <div className="content">None</div>
          </div>
        )}
      </div>

      <div className="toolbar">
        <button onClick={() => onAdd(organization.id)}>Add donation</button>
        <button onClick={() => onEdit(organization.id)}>
          Edit organization
        </button>
        <button
          onClick={() => {
            if (window.confirm("Delete org and donations?")) {
              onDelete(organization.id);
            }
          }}
        >
          Delete all
        </button>
      </div>
    </div>
  );
};

export default OrgDetailsView;
