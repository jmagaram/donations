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
    <div>
      <h1>{organization.name}</h1>
      <div className="org-details-section">
        <div className="org-details-header">Tax status</div>
        <div className="org-details-content">
          {organization.taxDeductible ? "Tax-deductible" : "NOT tax-deductible"}
        </div>
        {organization.notes.trim() !== "" && (
          <>
            <div className="org-details-header">Notes</div>
            <div className="org-details-content">{organization.notes}</div>
          </>
        )}
      </div>
      <div className="org-details-section">
        {donations.length > 0 ? (
          <div className="donations-grid">
            <div className="donation-row donation-header">
              <div>Date</div>
              <div>Amount</div>
              <div>Kind</div>
              <div>Notes</div>
            </div>
            {donations.map((donation) => (
              <div key={donation.id} className="donation-row">
                <div className="donation-date">
                  {formatDate(donation.timestamp)}
                </div>
                <div className="donation-amount">
                  {formatAmount(donation.amount)}
                </div>
                <div className="donation-kind">{donation.kind}</div>
                <div className="donation-notes">{donation.notes || "-"}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="org-details-section">
            <div className="org-details-header">Donations</div>
            <div className="org-details-content">None</div>
          </div>
        )}
      </div>

      <div className="org-details-toolbar">
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
