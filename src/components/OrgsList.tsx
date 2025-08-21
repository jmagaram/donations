import { Link } from "react-router-dom";
import { type Org } from "../organization";
import React from "react";
import OrgNameView from "./OrgNameView";

type OrgsListProps = {
  orgs: Org[];
  sortBy: string;
  currentTextFilter: string;
};

const OrgsList = (props: OrgsListProps) => {
  const { orgs, sortBy, currentTextFilter } = props;

  const renderOrg = (org: Org) => (
    <div key={org.id} className="org-item">
      <div className="org-name">
        <Link to={`/orgs/${org.id}`}>
          <OrgNameView name={org.name} taxDeductible={org.taxDeductible} />
        </Link>
      </div>
      <div className="category-name">{org.category}</div>
      <div className="website">
        {org.webSite && (
          <a href={org.webSite} target="_blank" rel="noopener noreferrer">
            {org.webSite}
          </a>
        )}
      </div>
      <div className="notes">{org.notes}</div>
    </div>
  );

  const renderGrouped = (orgs: Org[], groupBy: "category" | "tax-status") => {
    const grouped = orgs.reduce(
      (acc, org) => {
        const key =
          groupBy === "category"
            ? org.category || "Uncategorized"
            : org.taxDeductible
              ? "Tax Deductible"
              : "Not Tax Deductible";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(org);
        return acc;
      },
      {} as Record<string, Org[]>
    );

    return Object.entries(grouped).map(([group, orgs]) => (
      <div key={group}>
        <h2>{group}</h2>
        <div className="org-group">
          {orgs.map((org) => (
            <div key={org.id} className="org-item">
              <div className="org-name">
                <Link to={`/orgs/${org.id}`}>
                  <OrgNameView
                    name={org.name}
                    taxDeductible={org.taxDeductible}
                  />
                </Link>
              </div>
              <div className="category-name">{org.category}</div>
              <div className="website">
                {org.webSite && (
                  <a
                    href={org.webSite}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {org.webSite}
                  </a>
                )}
              </div>
              <div className="notes">{org.notes}</div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  if (currentTextFilter.trim() === "" && sortBy === "category") {
    return <>{renderGrouped(orgs, "category")}</>;
  }

  if (currentTextFilter.trim() === "" && sortBy === "tax-status") {
    return <>{renderGrouped(orgs, "tax-status")}</>;
  }

  return <div className="orgs-list">{orgs.map(renderOrg)}</div>;
};

export default OrgsList;
