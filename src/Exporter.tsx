import { useState } from "react";
import Papa from "papaparse";
import StatusBox, { type StatusBoxProps } from "./StatusBox";
import { type DonationsData } from "./types";

interface ExporterProps {
  donationsData: DonationsData;
}

const Exporter = ({ donationsData }: ExporterProps) => {
  const [status, setStatus] = useState<StatusBoxProps | undefined>(undefined);

  const downloadCsv = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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

    downloadCsv(csvContent, "donations-export.csv");
    setStatus({
      header: "Donations exported",
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

    downloadCsv(csvContent, "organizations-export.csv");
    setStatus({
      header: "Organizations exported",
      content: `${orgsForExport.length} organizations exported to organizations-export.csv`,
      kind: "success",
    });
  };

  return (
    <div className="exporter">
      <h1>Export</h1>
      <div>
        <div className="form-field">
          <button onClick={handleExportDonations}>
            Export donations as CSV
          </button>
          <p>
            Exports all donations with organization details including:
            donationId, orgId, orgName, date, year, amount, kind, donationNotes,
            taxDeductible
          </p>
        </div>
        <div className="form-field">
          <button onClick={handleExportOrganizations}>
            Export organizations as CSV
          </button>
          <p>
            Exports all organizations including: orgId, name, taxDeductible,
            webSite, notes
          </p>
        </div>
        {status && <StatusBox {...status} />}
      </div>
    </div>
  );
};

export default Exporter;
