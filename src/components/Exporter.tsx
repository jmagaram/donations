import { useState } from "react";
import Papa from "papaparse";
import StatusBox, { type StatusBoxProps } from "./StatusBox";
import { type DonationsData } from "../donationsData";
import {
  OrgRowCsvSchema,
  type OrgRowCsv,
  DonationRowExportCsvSchema,
  type DonationRowExportCsv,
} from "../csvSchemas";
import { extractYear } from "../date";

interface ExporterProps {
  donationsData: DonationsData;
}

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

  const handleExportDonations = () => {
    setExportStatus(undefined);

    const donationsForExport: DonationRowExportCsv[] =
      donationsData.donations.map((donation) => {
        const org = donationsData.orgs.find((o) => o.id === donation.orgId);
        const orgName = org === undefined ? "Missing Org" : org.name;
        const orgCategory =
          org === undefined ? "Missing Org" : org.category || "";
        const orgTaxDeductible =
          org === undefined || org.taxDeductible ? "Yes" : "No";
        const csvRow: DonationRowExportCsv = {
          Name: orgName,
          Category: orgCategory,
          TaxDeductible: orgTaxDeductible,
          Date: donation.date,
          Year: extractYear(donation.date).toString(),
          Amount: donation.amount,
          Kind: donation.kind,
          PaymentMethod: donation.paymentMethod || "",
          Notes: donation.notes,
        };
        return DonationRowExportCsvSchema.parse(csvRow);
      });

    const csvContent = Papa.unparse(donationsForExport, {
      header: true,
    });

    downloadFile(csvContent, "donations-export.csv", "text/csv;charset=utf-8;");
    setExportStatus({
      content: `${donationsForExport.length} donations exported to donations-export.csv`,
      kind: "success",
    });
  };

  const handleExportOrganizations = () => {
    setExportStatus(undefined);

    const orgsForExport: OrgRowCsv[] = donationsData.orgs.map((org) => {
      const csvRow: OrgRowCsv = {
        OrgName: org.name,
        Category: org.category || "",
        TaxDeductible: (org.taxDeductible ? "Yes" : "No") as "Yes" | "No",
        WebSite: org.webSite || "",
        Notes: org.notes,
      };
      return OrgRowCsvSchema.parse(csvRow);
    });

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

  const handleExportJson = () => {
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
      <section>
        <div>
          <h2>Donations</h2>
          <button onClick={handleExportDonations}>Export</button>
        </div>
        <p className="readable-text">
          All donations are saved to a CSV file with columns for Name, Category,
          TaxDeductible, Date, Year, Amount, Kind, PaymentMethod, and Notes.
        </p>
      </section>
      <section>
        <div>
          <h2>Organizations</h2>
          <button onClick={handleExportOrganizations}>Export</button>
        </div>
        <p className="readable-text">
          All organizations are saved to a CSV file with columns for OrgName,
          Category, TaxDeductible, WebSite, and Notes.
        </p>
      </section>
      <section>
        <div>
          <h2>Everything</h2>
          <button onClick={handleExportJson}>Export</button>
        </div>
        <p className="readable-text">
          All organizations and donations are saved to a single JSON file. This
          is a <strong>comprehensive backup</strong> that can be restored later
          if needed.
        </p>
      </section>
    </div>
  );
};

export default Exporter;
