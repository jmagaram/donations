import React from "react";
import { Link } from "react-router-dom";
import OrgNameView from "./OrgNameView";
import AmountView from "./AmountView";
import DateView from "./DateView";
import type { Org } from "../organization";
import type { Donation } from "../donation";

export type OrgCardProps = {
  org: Org;
  donations: Pick<Donation, "date" | "amount" | "kind">[];
};

const OrgCard: React.FC<OrgCardProps> = ({ org, donations }) => {
  const sorted = [...donations].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="org-card card-shadow">
      <Link className="org-name" to={`/orgs/${org.id}`}>
        <OrgNameView name={org.name} taxDeductible={org.taxDeductible} />
      </Link>
      <div className="org-card__row org-card__category">
        {org.category && org.category.trim() !== ""
          ? org.category.trim()
          : "(No category)"}
      </div>
      <div className="org-card__donations-grid">
        {sorted.map((d, idx) => (
          <React.Fragment key={idx}>
            <div>
              <DateView date={d.date} />
            </div>
            <div className="grid__col--align-right">
              <AmountView
                type="single"
                amount={d.amount}
                showPennies={false}
                showWarning={false}
                badge={d.kind}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
      {org.notes && org.notes.trim() !== "" && (
        <div className="org-card__row org-card__notes">{org.notes}</div>
      )}
    </div>
  );
};

export default OrgCard;
