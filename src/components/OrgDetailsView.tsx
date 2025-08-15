import type { DonationsData } from "../donationsData";
import { compareDatesDesc } from "../date";
import { formatUSD as formatAmount } from "../amount";
import { type DonationDisplay } from "./DonationsView";
import DonationsGrid from "./DonationsGrid";

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

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  const donationsForDisplay: DonationDisplay[] = donations.map((d) => ({
    id: d.id,
    date: d.date,
    amount: formatAmount(d.amount),
    orgId: d.orgId,
    orgName: organization.name,
    kind: d.kind,
    notes: d.notes,
    paymentMethod: d.paymentMethod,
  }));

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
            <dd className="instructions">{organization.notes}</dd>
          </>
        )}
      </dl>
      <div className="section">
        {donations.length > 0 ? (
          <DonationsGrid donations={donationsForDisplay} showOrgName={false} />
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
