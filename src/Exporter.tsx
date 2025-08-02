import { useState } from "react";
import Papa from "papaparse";
import StatusBox, { type StatusBoxProps } from "./StatusBox";
import { type DonationsData } from "./types";

interface ExporterProps {
  donationsData: DonationsData;
}

type ExportType = "donations" | "organizations" | "everything";

const Exporter = ({ donationsData }: ExporterProps) => {
  const [exportStatus, setExportStatus] = useState<StatusBoxProps | undefined>(
    undefined,
  );

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDonations = (e: React.MouseEvent) => {
    e.preventDefault();
    setExportStatus(undefined);

    const donationsWithOrgData = donationsData.donations.map((donation) => {
      const org = donationsData.orgs.find((o) => o.id === donation.orgId);
      const year = donation.date.substring(0, 4);

      return {
        donationId: donation.id,
        orgId: donation.orgId,
        orgName: org?.name || "Unknown",
        orgCategory: org?.category || "",
        date: donation.date,
        year: year,
        amount: donation.amount,
        kind: donation.kind,
        donationNotes: donation.notes,
        taxDeductible: org?.taxDeductible || false,
      };
    });

    const csvContent = Papa.unparse(donationsWithOrgData, {
      header: true,
    });

    downloadFile(csvContent, "donations-export.csv", "text/csv;charset=utf-8;");
    setExportStatus({
      content: `${donationsWithOrgData.length} donations exported to donations-export.csv`,
      kind: "success",
    });
  };

  const handleExportOrganizations = (e: React.MouseEvent) => {
    e.preventDefault();
    setExportStatus(undefined);

    const orgsForExport = donationsData.orgs.map((org) => ({
      orgId: org.id,
      name: org.name,
      category: org.category || "",
      taxDeductible: org.taxDeductible,
      webSite: org.webSite || "",
      notes: org.notes,
    }));

    const csvContent = Papa.unparse(orgsForExport, {
      header: true,
    });

    downloadFile(
      csvContent,
      "organizations-export.csv",
      "text/csv;charset=utf-8;",
    );
    setExportStatus({
      content: `${orgsForExport.length} organizations exported to organizations-export.csv`,
      kind: "success",
    });
  };

  const handleExportJson = (e: React.MouseEvent) => {
    e.preventDefault();
    setExportStatus(undefined);

    const jsonContent = JSON.stringify(donationsData, null, 2);

    downloadFile(
      jsonContent,
      "donations-data.json",
      "application/json;charset=utf-8;",
    );
    setExportStatus({
      content: `Complete data exported to donations-data.json (${donationsData.orgs.length} organizations, ${donationsData.donations.length} donations)`,
      kind: "success",
    });
  };

  return (
    <div className="exporter">
      <h1>Export</h1>
      {exportStatus && <StatusBox {...exportStatus} />}
      <div className="export-section">
        <a href="#" onClick={handleExportDonations}>
          Donations
        </a>
        <p>
          Exports all donations in CSV format. Includes donationId, orgId,
          orgName, orgCategory, date, year, amount, kind, donationNotes, and taxDeductible.
        </p>
      </div>
      <div className="export-section">
        <a href="#" onClick={handleExportOrganizations}>
          Organizations
        </a>
        <p>
          Exports all organizations in CSV format. Includes orgId, name,
          category, taxDeductible, webSite, and notes.
        </p>
      </div>
      <div className="export-section">
        <a href="#" onClick={handleExportJson}>
          Everything
        </a>
        <p>Exports all organizations and donations in a single JSON file.</p>
      </div>
    </div>
  );
};

export default Exporter;
