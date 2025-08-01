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

    downloadCsv(csvContent, "organizations-export.csv");
    setOrgExportStatus({
      content: `${orgsForExport.length} organizations exported to organizations-export.csv`,
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
    </div>
  );
};

export default Exporter;
