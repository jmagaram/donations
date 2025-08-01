import { useState } from "react";
import Papa from "papaparse";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  type Donation,
  DonationAmountSchema,
  DonationKindSchema,
  DonationSchema,
  type DonationsData,
  type Org,
  OrgNameSchema,
  OrgNotesSchema,
  OrgSchema,
} from "./types";
import { empty, orgAdd, donationAdd } from "./donationsData";
import { DateIsoSchema } from "./date";

const OrgRowCsvSchema = z.object({
  Organization: OrgNameSchema,
  TaxDeductible: z.enum(["Yes", "yes", "No", "no"]),
  WebSite: z.string().optional().or(z.literal("")),
  Notes: OrgNotesSchema.optional().default(""),
});

type OrgRowCsv = z.infer<typeof OrgRowCsvSchema>;

const DonationRowCsvSchema = z.object({
  Organization: OrgNameSchema,
  Date: DateIsoSchema,
  Amount: z
    .string()
    .transform((val) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed)) {
        throw new Error("Invalid amount format");
      }
      return parsed;
    })
    .pipe(DonationAmountSchema),
  Kind: DonationKindSchema,
  Notes: z.string().optional().default(""),
});

type DonationRowCsv = z.infer<typeof DonationRowCsvSchema>;

const convertDonationRowCsvToDonation = (
  row: DonationRowCsv,
  orgId: string
): Donation => {
  const donation = {
    id: nanoid(),
    orgId: orgId,
    date: row.Date,
    amount: row.Amount,
    kind: row.Kind,
    notes: row.Notes,
  };
  return DonationSchema.parse(donation);
};

const convertOrgRowCsvToOrg = (row: OrgRowCsv): Org => {
  const org = {
    id: nanoid(),
    name: row.Organization,
    taxDeductible: row.TaxDeductible === "Yes" || row.TaxDeductible === "yes",
    webSite: row.WebSite && row.WebSite.length > 0 ? row.WebSite : undefined,
    notes: row.Notes,
  };
  return OrgSchema.parse(org);
};

const createFinalData = (
  validOrgs: Org[],
  validDonations: Donation[],
  orgImportErrors: string[],
  donationImportErrors: string[]
): DonationsData => {
  let newData = empty();

  // Add organizations
  for (const org of validOrgs) {
    const result = orgAdd(newData, org);
    if (result) {
      newData = result;
    } else {
      // This shouldn't happen with our CSV processing, but handle it
      orgImportErrors.push(
        `Failed to add organization: ${org.name} (duplicate or invalid)`
      );
    }
  }

  // Add donations
  for (const donation of validDonations) {
    const result = donationAdd(newData, donation);
    if (result) {
      newData = result;
    } else {
      // This shouldn't happen with our CSV processing, but handle it
      donationImportErrors.push(
        `Failed to add donation for organization ID: ${donation.orgId} (duplicate or invalid)`
      );
    }
  }

  return newData;
};

interface ImportContainerProps {
  setDonationsData: (data: DonationsData) => void;
}

const Importer = ({ setDonationsData }: ImportContainerProps) => {
  const [orgFile, setOrgFile] = useState<File | undefined>(undefined);
  const [donationFile, setDonationFile] = useState<File | undefined>(undefined);
  const [status, setStatus] = useState<string>("");
  const [orgErrors, setOrgErrors] = useState<string[]>([]);
  const [donationErrors, setDonationErrors] = useState<string[]>([]);
  const [isWorking, setIsWorking] = useState(false);

  const handleOrgFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setOrgFile(selectedFile || undefined);
    setStatus("");
    setOrgErrors([]);
    setDonationErrors([]);
  };

  const handleDonationFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    setDonationFile(selectedFile || undefined);
    setStatus("");
    setOrgErrors([]);
    setDonationErrors([]);
  };

  const handleImport = () => {
    if (!orgFile) {
      setStatus("Please select an Organizations CSV file");
      return;
    }

    setIsWorking(true);
    setStatus("Working...");
    setOrgErrors([]);
    setDonationErrors([]);

    Papa.parse(orgFile, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim(),
      complete: (orgResults) => {
        try {
          const validOrgs: Org[] = [];
          const orgImportErrors: string[] = [];

          orgResults.data.forEach((row, index) => {
            try {
              const validatedRow = OrgRowCsvSchema.parse(row);
              const org = convertOrgRowCsvToOrg(validatedRow);
              validOrgs.push(org);
            } catch (parseError) {
              const rowData = row as Record<string, unknown>;
              const orgName = String(rowData?.Organization || "Unknown");
              const lineNumber = index + 2;

              if (parseError instanceof z.ZodError) {
                parseError.issues.forEach((issue) => {
                  const field = String(issue.path[0] || "unknown");
                  const receivedValue =
                    "received" in issue && issue.received !== undefined
                      ? ` (received: "${issue.received}")`
                      : "";
                  orgImportErrors.push(
                    `Line ${lineNumber} - ${orgName}: ${field} - ${issue.message}${receivedValue}`
                  );
                });
              } else {
                orgImportErrors.push(
                  `Line ${lineNumber} - ${orgName}: Unknown validation error`
                );
              }
            }
          });

          setOrgErrors(orgImportErrors);

          if (donationFile && validOrgs.length > 0) {
            Papa.parse(donationFile, {
              header: true,
              skipEmptyLines: true,
              transform: (value, field) => {
                // Don't trim the Notes field to preserve line breaks
                if (field === "Notes") {
                  return value;
                }
                return typeof value === "string" ? value.trim() : value;
              },
              transformHeader: (header) => header.trim(),
              complete: (donationResults) => {
                try {
                  const validDonations: Donation[] = [];
                  const donationImportErrors: string[] = [];

                  donationResults.data.forEach((row, index) => {
                    try {
                      const validatedRow = DonationRowCsvSchema.parse(row);

                      // Find matching organization by name
                      const matchingOrg = validOrgs.find(
                        (org) =>
                          org.name.toLowerCase() ===
                          validatedRow.Organization.toLowerCase()
                      );

                      if (!matchingOrg) {
                        donationImportErrors.push(
                          `Line ${index + 2} - ${
                            validatedRow.Organization
                          }: Organization not found in organizations list`
                        );
                        return;
                      }

                      const donation = convertDonationRowCsvToDonation(
                        validatedRow,
                        matchingOrg.id
                      );
                      validDonations.push(donation);
                    } catch (parseError) {
                      const rowData = row as Record<string, unknown>;
                      const orgName = String(
                        rowData?.Organization || "Unknown"
                      );
                      const lineNumber = index + 2;

                      if (parseError instanceof z.ZodError) {
                        parseError.issues.forEach((issue) => {
                          const field = String(issue.path[0] || "unknown");
                          const receivedValue =
                            "received" in issue && issue.received !== undefined
                              ? ` (received: "${issue.received}")`
                              : "";
                          donationImportErrors.push(
                            `Line ${lineNumber} - ${orgName}: ${field} - ${issue.message}${receivedValue}`
                          );
                        });
                      } else {
                        donationImportErrors.push(
                          `Line ${lineNumber} - ${orgName}: Unknown validation error - Raw data: ${JSON.stringify(
                            rowData
                          )}`
                        );
                      }
                    }
                  });

                  setDonationErrors(donationImportErrors);

                  // Check for any errors before updating data
                  const totalErrors =
                    orgImportErrors.length + donationImportErrors.length;

                  if (totalErrors === 0) {
                    // Only update data if no errors occurred
                    const finalData = createFinalData(
                      validOrgs,
                      validDonations,
                      orgImportErrors,
                      donationImportErrors
                    );
                    setDonationsData(finalData);
                    sessionStorage.setItem(
                      "donationsData",
                      JSON.stringify(finalData)
                    );
                    setStatus(
                      `Success: ${validOrgs.length} organizations and ${validDonations.length} donations imported`
                    );
                  } else {
                    setStatus(
                      `Error: ${totalErrors} validation errors occurred. Import cancelled.`
                    );
                  }

                  setIsWorking(false);
                } catch {
                  setStatus("Error: Failed to process donations CSV file");
                  setIsWorking(false);
                }
              },
              error: () => {
                setStatus("Error: Failed to read donations CSV file");
                setIsWorking(false);
              },
            });
          } else {
            // Only organizations imported (no donations file provided)
            if (orgImportErrors.length === 0) {
              // Only update data if no errors occurred
              const finalData = createFinalData(
                validOrgs,
                [],
                orgImportErrors,
                []
              );
              setDonationsData(finalData);
              sessionStorage.setItem(
                "donationsData",
                JSON.stringify(finalData)
              );
              setStatus(`Success: ${validOrgs.length} organizations imported`);
            } else {
              setStatus(
                `Error: ${orgImportErrors.length} validation errors occurred. Import cancelled - no data was updated.`
              );
            }

            setIsWorking(false);
          }
        } catch {
          setStatus("Error: Failed to process organizations CSV file");
          setIsWorking(false);
        }
      },
      error: () => {
        setStatus("Error: Failed to read organizations CSV file");
        setIsWorking(false);
      },
    });
  };

  return (
    <div className="importer">
      <h1>Import</h1>
      <div>
        <div>
          <label htmlFor="orgCsvFile">Organizations CSV file:</label>
          <input
            id="orgCsvFile"
            type="file"
            accept=".csv"
            onChange={handleOrgFileChange}
            disabled={isWorking}
          />
        </div>
        <div>
          <label htmlFor="donationCsvFile">Donations CSV file:</label>
          <input
            id="donationCsvFile"
            type="file"
            accept=".csv"
            onChange={handleDonationFileChange}
            disabled={isWorking}
          />
        </div>
        <div>
          <button onClick={handleImport} disabled={!orgFile || isWorking}>
            Start import
          </button>
        </div>
        {status && <div className="statusBox">{status}</div>}
        {orgErrors.length > 0 && (
          <div className="errors">
            <h3>Organization Import Errors</h3>
            <ul>
              {orgErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {donationErrors.length > 0 && (
          <div className="errors">
            <h3>Donation Import Errors</h3>
            <ul>
              {donationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <h3>Organizations CSV</h3>
      <ul>
        <li>
          <strong>Organization</strong>: Organization name (required)
        </li>
        <li>
          <strong>TaxDeductible</strong>: "Yes" or "No" (required)
        </li>
        <li>
          <strong>WebSite</strong>: URL, usually start with http:// or https://
          (optional)
        </li>
        <li>
          <strong>Notes</strong>: Any notes (can be multi-line)
        </li>
      </ul>
      <h3>Donations CSV</h3>
      <ul>
        <li>
          <strong>Organization</strong>: Must match organization name exactly
          (required)
        </li>
        <li>
          <strong>Date</strong>: YYYY-MM-DD format (required)
        </li>
        <li>
          <strong>Amount</strong>: Plain number, without currency symbol. Like
          432.33 (required)
        </li>
        <li>
          <strong>Kind</strong>: "idea", "pledge", "paid", or "unknown"
          (required)
        </li>
        <li>
          <strong>Notes</strong>: Any notes about the donation (optional)
        </li>
      </ul>
    </div>
  );
};

export default Importer;
