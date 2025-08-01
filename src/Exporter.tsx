import { useState } from "react";
import Papa from "papaparse";
import StatusBox, { type StatusBoxProps } from "./StatusBox";
import { type DonationsData } from "./types";

interface ExporterProps {
  donationsData: DonationsData;
}

const Exporter = ({ donationsData }: ExporterProps) => {
  const [donationExportStatus, setDonationExportStatus] = useState<
    StatusBoxProps | undefined
  >(undefined);
  const [orgExportStatus, setOrgExportStatus] = useState<
    StatusBoxProps | undefined
  >(undefined);
  const [jsonExportStatus, setJsonExportStatus] = useState<
    StatusBoxProps | undefined
  >(undefined);

  const downloadFile = (content: string, filename: string, mimeType: string) => {
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
    const donationsWithOrgData = donationsData.donations.map((donation) => {
      const org = donationsData.orgs.find((o) => o.id === donation.orgId);
      const year = donation.date.substring(0, 4);

      return {
        donationId: donation.id,
        orgId: donation.orgId,
        orgName: org?.name || "Unknown",
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
    setDonationExportStatus({
      content: `${donationsWithOrgData.length} donations exported to donations-export.csv`,
      kind: "success",
    });
  };

  const handleExportOrganizations = () => {
    const orgsForExport = donationsData.orgs.map((org) => ({
      orgId: org.id,
      name: org.name,
      taxDeductible: org.taxDeductible,
      webSite: org.webSite || "",
      notes: org.notes,
    }));

    const csvContent = Papa.unparse(orgsForExport, {
      header: true,
    });

    downloadFile(csvContent, "organizations-export.csv", "text/csv;charset=utf-8;");
    setOrgExportStatus({
      content: `${orgsForExport.length} organizations exported to organizations-export.csv`,
      kind: "success",
    });
  };

  const handleExportJson = () => {
    const jsonContent = JSON.stringify(donationsData, null, 2);
    
    downloadFile(jsonContent, "donations-data.json", "application/json;charset=utf-8;");
    setJsonExportStatus({
      content: `Complete data exported to donations-data.json (${donationsData.orgs.length} organizations, ${donationsData.donations.length} donations)`,
      kind: "success",
    });
  };

  return (
    <div className="exporter">
      <h1>Export</h1>

      <div>
        <h2>Donations</h2>
        <p>
          Exports all donations with organization details including: donationId,
          orgId, orgName, date, year, amount, kind, donationNotes, taxDeductible
        </p>
        <div className="form-field">
          <button onClick={handleExportDonations}>Export donations</button>
          {donationExportStatus && <StatusBox {...donationExportStatus} />}
        </div>
      </div>
      <div>
        <h2>Organizations</h2>
        <p>
          Exports all organizations including: orgId, name, taxDeductible,
          webSite, notes
        </p>
        <div className="form-field">
          <button onClick={handleExportOrganizations}>
            Export organizations
          </button>
          {orgExportStatus && <StatusBox {...orgExportStatus} />}
        </div>
      </div>
      <div>
        <h2>Complete Data</h2>
        <p>
          Exports everything as JSON including all organizations and donations with full data structure
        </p>
        <div className="form-field">
          <button onClick={handleExportJson}>Export as JSON</button>
          {jsonExportStatus && <StatusBox {...jsonExportStatus} />}
        </div>
      </div>
    </div>
  );
};

export default Exporter;
