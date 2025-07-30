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
      <div>
        <strong>Tax Deductible:</strong>{" "}
        {organization.taxDeductible ? "Yes" : "No"}
      </div>
      <div>
        <strong>Notes:</strong> {organization.notes || "-"}
      </div>

      <div style={{ marginTop: "2em" }}>
        <h2>Donations</h2>
        {donations.length > 0 ? (
          <div className="donations-grid">
            <div className="donations-header">
              <div>Date</div>
              <div>Amount</div>
              <div>Type</div>
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
          <p>No donations yet.</p>
        )}
      </div>

      <div style={{ marginTop: "1em" }}>
        <button onClick={() => onAdd(organization.id)}>Add Donation</button>
        <button
          onClick={() => onEdit(organization.id)}
          style={{ marginLeft: "0.5em" }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(organization.id)}
          style={{ marginLeft: "0.5em", color: "red" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default OrgDetailsView;
