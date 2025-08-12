import { useState } from "react";
import Papa from "papaparse";
import StatusBox, { type StatusBoxProps } from "./StatusBox";
import { type DonationsData } from "./donationsData";

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
      <section>
        <div>
          <h2>Donations</h2>
          <button onClick={handleExportDonations}>Export</button>
        </div>
        <p>
          All donations are saved to a CSV file with columns for donationId,
          orgId, orgName, orgCategory, date, year, amount, kind, donationNotes,
          paymentMethod, and taxDeductible.
        </p>
      </section>
      <section>
        <div>
          <h2>Organizations</h2>
          <button onClick={handleExportOrganizations}>Export</button>
        </div>
        <p>
          All organizations are saved to a CSV file with columns for orgId,
          name, category, taxDeductible, webSite, and notes.
        </p>
      </section>
      <section>
        <div>
          <h2>Everything</h2>
          <button onClick={handleExportJson}>Export</button>
        </div>
        <p>
          All organizations and donations are saved to a single JSON file. This
          is a <strong>comprehensive backup</strong> that can be restored later
          if needed.
        </p>
      </section>
    </div>
  );
};

export default Exporter;
