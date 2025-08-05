import { useState } from "react";
import Papa from "papaparse";
import StatusBox, { type StatusBoxProps } from "./StatusBox";
import { type DonationsData } from "./types";

interface ExporterProps {
  donationsData: DonationsData;
}

const Exporter = ({ donationsData }: ExporterProps) => {
  const [exportStatus, setExportStatus] = useState<StatusBoxProps | undefined>(
    undefined
  );

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
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

  const handleExportDonations = () => {
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
        paymentMethod: donation.paymentMethod || "",
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

  const handleExportOrganizations = () => {
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
      "text/csv;charset=utf-8;"
    );
    setExportStatus({
      content: `${orgsForExport.length} organizations exported to organizations-export.csv`,
      kind: "success",
    });
  };

  const handleExportJson = () => {
    setExportStatus(undefined);

    const jsonContent = JSON.stringify(donationsData, null, 2);

    downloadFile(
      jsonContent,
      "donations-data.json",
      "application/json;charset=utf-8;"
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
      <StatusBox
        header="Donations"
        content="All donations are saved to a CSV file with columns for donationId, orgId, orgName, orgCategory, date, year, amount, kind, donationNotes, paymentMethod, and taxDeductible."
        kind="info"
        buttons={[{ caption: "Export", onClick: handleExportDonations }]}
      />
      <StatusBox
        header="Organizations"
        content="All organizations are saved to a CSV file with columns for orgId, name, category, taxDeductible, webSite, and notes."
        kind="info"
        buttons={[{ caption: "Export", onClick: handleExportOrganizations }]}
      />
      <StatusBox
        header="Everything"
        content=" All organizations and donations are saved to a single JSON file. This is a comprehensive backup that can be restored later if needed."
        kind="info"
        buttons={[{ caption: "Export", onClick: handleExportJson }]}
      />
    </div>
  );
};

export default Exporter;
