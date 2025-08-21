import { Link } from "react-router-dom";
import { type Org } from "../organization";
import React, { useState, useEffect } from "react";
import OrgNameView from "./OrgNameView";

type OrgGridProps =
  | {
      orgs: Org[];
      mode: "view";
    }
  | {
      orgs: Org[];
      mode: "select";
      onSelectionChanged: (orgIds: string[]) => void;
      selectedOrgIds?: string[];
    };

const OrgGrid = (props: OrgGridProps) => {
  const { orgs } = props;
  const [selectedOrgIds, setSelectedOrgIds] = useState<Set<string>>(new Set());

  const isSelectMode = props.mode === "select";
  const gridClassName = `grid grid--align-top orgs-grid${isSelectMode ? " orgs-grid--selectable" : ""}`;
  const propsSelectedOrgIds = isSelectMode ? props.selectedOrgIds : undefined;

  // Sync internal state with prop when provided
  useEffect(() => {
    if (isSelectMode && propsSelectedOrgIds !== undefined) {
      setSelectedOrgIds(new Set(propsSelectedOrgIds));
    }
  }, [isSelectMode, propsSelectedOrgIds]);

  const handleSelectionChange = (orgId: string, checked: boolean) => {
    const newSelection = new Set(selectedOrgIds);
    if (checked) {
      newSelection.add(orgId);
    } else {
      newSelection.delete(orgId);
    }
    setSelectedOrgIds(newSelection);
    if (props.mode === "select") {
      props.onSelectionChanged(Array.from(newSelection));
    }
  };

  // Use the orgs in the order they were passed in

  return (
    <div className={gridClassName}>
      {/* Header */}
      {isSelectMode && <div className="grid__header">&nbsp;</div>}
      <div className="grid__header org-name">Name</div>
      <div className="grid__header grid-col--show-medium">Category</div>
      <div className="grid__header grid-col--show-medium">Website</div>
      <div className="grid__header grid-col--show-large">Notes</div>

      {/* Data Rows */}
      {orgs.map((org) => (
        <React.Fragment key={org.id}>
          {isSelectMode && (
            <div className="grid__cell">
              <input
                type="checkbox"
                checked={selectedOrgIds.has(org.id)}
                onChange={(e) =>
                  handleSelectionChange(org.id, e.target.checked)
                }
              />
            </div>
          )}
          <div className="grid__cell org-name">
            {isSelectMode ? (
              <OrgNameView name={org.name} taxDeductible={org.taxDeductible} />
            ) : (
              <Link to={`/orgs/${org.id}`}>
                <OrgNameView
                  name={org.name}
                  taxDeductible={org.taxDeductible}
                />
              </Link>
            )}
          </div>
          <div className="grid__cell grid-col--show-medium">
            {org.category || ""}
          </div>
          <div className="grid__cell grid-col--show-medium">
            {org.webSite && (
              <a href={org.webSite} target="_blank" rel="noopener noreferrer">
                {org.webSite}
              </a>
            )}
          </div>
          <div className="grid__cell grid-col--show-large">{org.notes}</div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default OrgGrid;
