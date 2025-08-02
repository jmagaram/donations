import { useState } from "react";
import Papa from "papaparse";
import { z } from "zod";
import { nanoid } from "nanoid";
import StatusBox, { type StatusBoxProps } from "./StatusBox";

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
  Category: z.string().optional().default(""),
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
  PaymentMethod: z.string().optional().default(""),
});

type DonationRowCsv = z.infer<typeof DonationRowCsvSchema>;

type OrgParseResult = {
  orgs: Org[];
  orgImportErrors: string[];
};

type DonationParseResult = {
  donations: Donation[];
  errors: string[];
};

type CreateFinalDataResult = {
  donationData: DonationsData | undefined;
  errors: string[];
};

type ProcessImportResult = {
  success: boolean;
  donationData?: DonationsData;
  successMessage?: string;
  errorMessage?: string;
};

const formatZodError = (
  error: z.ZodError,
  lineNumber: number,
  orgName: string,
): string[] => {
  return error.issues.map((issue) => {
    const field = String(issue.path[0] || "unknown");
    const receivedValue =
      "received" in issue && issue.received !== undefined
        ? ` (received: "${issue.received}")`
        : "";
    return `Line ${lineNumber} - ${orgName}: ${field} - ${issue.message}${receivedValue}`;
  });
};

const convertDonationRowCsvToDonation = (
  row: DonationRowCsv,
  orgId: string,
): Donation => {
  const donation = {
    id: nanoid(),
    orgId: orgId,
    date: row.Date,
    amount: row.Amount,
    kind: row.Kind,
    notes: row.Notes,
    paymentMethod: row.PaymentMethod && row.PaymentMethod.trim().length > 0 ? row.PaymentMethod.trim() : undefined,
  };
  return DonationSchema.parse(donation);
};

const convertOrgRowCsvToOrg = (row: OrgRowCsv): Org => {
  const org = {
    id: nanoid(),
    name: row.Organization,
    category: row.Category && row.Category.trim().length > 0 ? row.Category.trim() : undefined,
    taxDeductible: row.TaxDeductible === "Yes" || row.TaxDeductible === "yes",
    webSite: row.WebSite && row.WebSite.length > 0 ? row.WebSite : undefined,
    notes: row.Notes,
  };
  return OrgSchema.parse(org);
};

const parseOrgCsv = (data: unknown[]): OrgParseResult => {
  const orgs: Org[] = [];
  const errors: string[] = [];
  data.forEach((row, index) => {
    try {
      const validatedRow = OrgRowCsvSchema.parse(row);
      const org = convertOrgRowCsvToOrg(validatedRow);
      orgs.push(org);
    } catch (parseError) {
      const rowData = row as Record<string, unknown>;
      const orgName = String(rowData?.Organization || "Unknown");
      const lineNumber = index + 2;
      if (parseError instanceof z.ZodError) {
        errors.push(...formatZodError(parseError, lineNumber, orgName));
      } else {
        errors.push(
          `Line ${lineNumber} - ${orgName}: Unknown validation error`,
        );
      }
    }
  });
  return { orgs: orgs, orgImportErrors: errors };
};

const parseDonationCsv = (
  data: unknown[],
  orgs: Org[],
): DonationParseResult => {
  const validDonations: Donation[] = [];
  const errors: string[] = [];
  data.forEach((row, index) => {
    try {
      const validatedRow = DonationRowCsvSchema.parse(row);
      const matchingOrg = orgs.find(
        (org) =>
          org.name.toLowerCase() === validatedRow.Organization.toLowerCase(),
      );
      if (!matchingOrg) {
        errors.push(
          `Line ${index + 2} - ${
            validatedRow.Organization
          }: Organization not found in organizations list`,
        );
        return;
      }
      const donation = convertDonationRowCsvToDonation(
        validatedRow,
        matchingOrg.id,
      );
      validDonations.push(donation);
    } catch (parseError) {
      const rowData = row as Record<string, unknown>;
      const orgName = String(rowData?.Organization || "Unknown");
      const lineNumber = index + 2;
      if (parseError instanceof z.ZodError) {
        errors.push(...formatZodError(parseError, lineNumber, orgName));
      } else {
        errors.push(
          `Line ${lineNumber} - ${orgName}: Unknown validation error - Raw data: ${JSON.stringify(
            rowData,
          )}`,
        );
      }
    }
  });
  return { donations: validDonations, errors };
};

const processImportData = (
  orgs: Org[],
  donations: Donation[],
  orgImportErrors: string[],
  donationImportErrors: string[],
): ProcessImportResult => {
  const totalValidationErrors = orgImportErrors.length + donationImportErrors.length;
  
  if (totalValidationErrors > 0) {
    return {
      success: false,
      errorMessage: `${totalValidationErrors} validation errors occurred`,
    };
  }
  
  const result = createFinalData(orgs, donations);
  
  if (result.donationData) {
    const successMessage = donations.length > 0
      ? `${orgs.length} organizations and ${donations.length} donations imported`
      : `${orgs.length} organizations imported`;
      
    return {
      success: true,
      donationData: result.donationData,
      successMessage,
    };
  } else {
    return {
      success: false,
      errorMessage: `${result.errors.length} data processing errors occurred`,
    };
  }
};

const parseOrgFile = (file: File): Promise<OrgParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        if (field === "Notes") {
          return value; // preserve line breaks
        }
        return typeof value === "string" ? value.trim() : value;
      },
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          const parseResult = parseOrgCsv(results.data);
          resolve(parseResult);
        } catch {
          resolve({
            orgs: [],
            orgImportErrors: ["Failed to process organizations CSV file"],
          });
        }
      },
      error: () => {
        resolve({
          orgs: [],
          orgImportErrors: ["Failed to read organizations CSV file"],
        });
      },
    });
  });
};

const parseDonationFile = (
  file: File,
  orgs: Org[],
): Promise<DonationParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        if (field === "Notes") {
          return value; // preserve line breaks
        }
        return typeof value === "string" ? value.trim() : value;
      },
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          const parseResult = parseDonationCsv(results.data, orgs);
          resolve(parseResult);
        } catch {
          resolve({
            donations: [],
            errors: ["Failed to process donations CSV file"],
          });
        }
      },
      error: () => {
        resolve({
          donations: [],
          errors: ["Failed to read donations CSV file"],
        });
      },
    });
  });
};

const createFinalData = (
  orgs: Org[],
  donations: Donation[],
): CreateFinalDataResult => {
  const errors: string[] = [];
  let newData = empty();
  for (const org of orgs) {
    const result = orgAdd(newData, org);
    if (result) {
      newData = result;
    } else {
      errors.push(
        `Failed to add organization: ${org.name} (duplicate or invalid)`,
      );
    }
  }
  for (const donation of donations) {
    const result = donationAdd(newData, donation);
    if (result) {
      newData = result;
    } else {
      errors.push(
        `Failed to add donation for organization ID: ${donation.orgId} (duplicate or invalid)`,
      );
    }
  }
  return {
    donationData: errors.length === 0 ? newData : undefined,
    errors,
  };
};

interface ImportContainerProps {
  setDonationsData: (data: DonationsData) => void;
}

const Importer = ({ setDonationsData }: ImportContainerProps) => {
  const [orgFile, setOrgFile] = useState<File | undefined>(undefined);
  const [donationFile, setDonationFile] = useState<File | undefined>(undefined);
  const [status, setStatus] = useState<StatusBoxProps | undefined>(undefined);
  const [orgErrors, setOrgErrors] = useState<string[]>([]);
  const [donationErrors, setDonationErrors] = useState<string[]>([]);
  const [isWorking, setIsWorking] = useState(false);

  const handleOrgFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setOrgFile(selectedFile || undefined);
    setStatus(undefined);
    setOrgErrors([]);
    setDonationErrors([]);
  };

  const handleDonationFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    setDonationFile(selectedFile || undefined);
    setStatus(undefined);
    setOrgErrors([]);
    setDonationErrors([]);
  };

  const handleImport = async () => {
    if (!orgFile) {
      setStatus({
        content: "Please select an Organizations CSV file",
        kind: "error",
      });
      return;
    }

    setIsWorking(true);
    setStatus({ content: "Working...", kind: "info" });
    setOrgErrors([]);
    setDonationErrors([]);

    const { orgs, orgImportErrors } = await parseOrgFile(orgFile);
    setOrgErrors(orgImportErrors);

    let donationImportErrors: string[] = [];
    let donations: Donation[] = [];
    
    if (donationFile && orgs.length > 0) {
      const donationResult = await parseDonationFile(donationFile, orgs);
      donationImportErrors = donationResult.errors;
      donations = donationResult.donations;
    }
    
    setDonationErrors(donationImportErrors);

    const result = processImportData(
      orgs,
      donations,
      orgImportErrors,
      donationImportErrors,
    );

    if (result.success && result.donationData) {
      setDonationsData(result.donationData);
      sessionStorage.setItem("donationsData", JSON.stringify(result.donationData));
      setStatus({
        header: "Import successful",
        content: result.successMessage || "Import completed",
        kind: "success",
      });
    } else {
      setStatus({
        header: "Import cancelled",
        content: result.errorMessage || "Import failed",
        kind: "error",
      });
    }

    setIsWorking(false);
  };

  return (
    <div className="importer">
      <h1>Import</h1>
      <div>
        <div className="form-field">
          <label htmlFor="orgCsvFile">Organizations CSV file</label>
          <input
            id="orgCsvFile"
            type="file"
            accept=".csv"
            onChange={handleOrgFileChange}
            disabled={isWorking}
          />
        </div>
        <div className="form-field">
          <label htmlFor="donationCsvFile">Donations CSV file</label>
          <input
            id="donationCsvFile"
            type="file"
            accept=".csv"
            onChange={handleDonationFileChange}
            disabled={isWorking}
          />
        </div>
        <button onClick={handleImport} disabled={!orgFile || isWorking}>
          Start import
        </button>
        {status && <StatusBox {...status} />}
        {orgErrors.length > 0 && (
          <StatusBox
            header="Organization import errors"
            content={orgErrors.join("\n")}
            kind="error"
          />
        )}
        {donationErrors.length > 0 && (
          <StatusBox
            header="Donation import errors"
            content={donationErrors.join("\n")}
            kind="error"
          />
        )}
      </div>
      <StatusBox
        header="CSV Format Requirements"
        content={`Organizations CSV
• Organization: Organization name (required)
• Category: Organization category (optional)
• TaxDeductible: "Yes" or "No" (required)
• WebSite: URL, usually start with http:// or https:// (optional)
• Notes: Any notes (can be multi-line)

Donations CSV
• Organization: Must match organization name exactly (required)
• Date: YYYY-MM-DD format (required)
• Amount: Plain number, without currency symbol. Like 432.33 (required)
• Kind: "idea", "pledge", "paid", or "unknown" (required)
• Notes: Any notes about the donation (optional)
• PaymentMethod: Payment method used (optional)`}
        kind="info"
      />
    </div>
  );
};

export default Importer;
