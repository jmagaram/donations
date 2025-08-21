import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select, { type SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import { fuzzyOrgSearch } from "../fuzzy";
import StatusBox from "./StatusBox";
import { DonationUpsertFieldsSchema, defaultFields } from "../donation";
import type { DonationUpsertFields } from "../donation";
import type { DonationsData } from "../donationsData";
import { findOrgById } from "../donationsData";
import { useSearchParams, useNavigate } from "react-router-dom";
import { parseCurrency } from "../amount";

type KindOption = {
  value: string;
  label: string;
};

const KIND_OPTIONS: KindOption[] = [
  { value: "idea", label: "Idea" },
  { value: "pledge", label: "Pledge" },
  { value: "paid", label: "Paid" },
];

interface DonationUpsertFormProps {
  onSubmit: (formData: DonationUpsertFields) => void;
  onDelete?: () => void;
  defaultValues?: DonationUpsertFields;
  mode?: "add" | "edit";
  donationsData?: DonationsData;
}

const DonationUpsertForm = ({
  onSubmit,
  onDelete,
  defaultValues = defaultFields,
  mode = "add",
  donationsData,
}: DonationUpsertFormProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orgSearchInput, setOrgSearchInput] = React.useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactSelectRef = React.useRef<any>(null);
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const orgId =
    mode === "edit" ? defaultValues.orgId : searchParams.get("org") || "";

  // Get URL parameters for pre-filling form in add mode
  const urlParams =
    mode === "add"
      ? {
          date: searchParams.get("date") || defaultValues.date,
          kind:
            DonationKindSchema.safeParse(searchParams.get("kind")).data ??
            defaultValues.kind,
          amount: searchParams.get("amount")
            ? parseFloat(searchParams.get("amount")!)
            : defaultValues.amount,
          notes: searchParams.get("notes") || defaultValues.notes,
          paymentMethod:
            searchParams.get("paymentMethod") || defaultValues.paymentMethod,
        }
      : {};

  const formDefaultValues = {
    ...defaultValues,
    ...urlParams,
    orgId,
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
    control,
  } = useForm<DonationUpsertFields>({
    resolver: zodResolver(DonationUpsertFieldsSchema),
    defaultValues: formDefaultValues,
  });

  React.useEffect(() => {
    if (mode === "edit") {
      reset(defaultValues);
    }
  }, [defaultValues, reset, mode]);

  React.useEffect(() => {
    if (orgId) {
      dateInputRef.current?.focus();
    } else {
      reactSelectRef.current?.focus();
    }
  }, [orgId]);

  type OrgOption = {
    value: string;
    label: string;
    org: {
      id: string;
      name: string;
      category?: string;
      notes: string;
      taxDeductible: boolean;
      webSite?: string;
    };
  };

  const orgOptions: OrgOption[] = React.useMemo(() => {
    if (!donationsData?.orgs) return [];

    const orgsToUse = orgSearchInput.trim()
      ? fuzzyOrgSearch(donationsData.orgs, orgSearchInput)
      : donationsData.orgs;

    return orgsToUse
      .map((org) => ({
        value: org.id,
        label: org.name,
        org: {
          id: org.id,
          name: org.name,
          category: org.category,
          notes: org.notes,
          taxDeductible: org.taxDeductible,
          webSite: org.webSite,
        },
      }))
      .sort((a, b) =>
        orgSearchInput.trim() ? 0 : a.label.localeCompare(b.label),
      );
  }, [donationsData?.orgs, orgSearchInput]);

  const currentOrgId = watch("orgId");
  const currentPaymentMethod = watch("paymentMethod");
  const currentKind = watch("kind");

  const selectedOrgOption = React.useMemo(() => {
    return orgOptions.find((option) => option.value === currentOrgId) || null;
  }, [orgOptions, currentOrgId]);

  type PaymentMethodOption = {
    value: string;
    label: string;
  };

  const paymentMethodOptions: PaymentMethodOption[] = React.useMemo(() => {
    if (!donationsData?.donations) return [];

    const uniquePaymentMethods = Array.from(
      new Set(
        donationsData.donations
          .map((donation) => donation.paymentMethod)
          .filter((pm): pm is string => pm !== undefined && pm.trim() !== ""),
      ),
    ).sort((a, b) => a.localeCompare(b)); // Sort alphabetically

    return uniquePaymentMethods.map((pm) => ({
      value: pm,
      label: pm,
    }));
  }, [donationsData?.donations]);

  // Find the selected payment method option (or create one for arbitrary text)
  const selectedPaymentMethodOption = React.useMemo(() => {
    if (!currentPaymentMethod) return null;

    const existingOption = paymentMethodOptions.find(
      (option) => option.value === currentPaymentMethod,
    );

    if (existingOption) {
      return existingOption;
    }

    return {
      value: currentPaymentMethod,
      label: currentPaymentMethod,
    };
  }, [paymentMethodOptions, currentPaymentMethod]);

  const selectedKindOption = React.useMemo(() => {
    return KIND_OPTIONS.find((option) => option.value === currentKind) || null;
  }, [currentKind]);

  const filterPaymentMethodOption = (
    option: { data: PaymentMethodOption },
    inputValue: string,
  ) => {
    if (!inputValue.trim()) return true;
    return option.data.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  const filterKindOption = (
    option: { data: KindOption },
    inputValue: string,
  ) => {
    if (!inputValue.trim()) return true;
    return option.data.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  const handleAmountBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    const parsedAmount = parseCurrency(currentValue);
    if (parsedAmount !== undefined) {
      console.log(`Updated: ${parsedAmount}`);
      const formattedValue = parsedAmount.toFixed(2);
      setValue("amount", parsedAmount, { shouldDirty: true });
      event.target.value = formattedValue;
    }
  };

  const handleFormSubmit = (data: DonationUpsertFields) => {
    if (mode === "edit" && !isDirty) {
      navigate(-1);
      return;
    }
    onSubmit(data);
  };

  if (
    mode === "edit" &&
    orgId &&
    donationsData &&
    !findOrgById(donationsData, orgId)
  ) {
    return (
      <div>
        <h1>Edit Donation</h1>
        <StatusBox
          content={`This organization no longer exists. Please delete this donation and create a new one.`}
          kind="error"
        />
      </div>
    );
  }

  return (
    <div>
      <h1>{mode === "edit" ? "Edit donation" : "New donation"}</h1>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-field form-field--large">
          <label htmlFor="orgId">Organization</label>
          <Controller
            name="orgId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                ref={reactSelectRef}
                id="orgId"
                classNamePrefix="react-select-org"
                options={orgOptions}
                value={selectedOrgOption}
                onChange={(selectedOption: SingleValue<OrgOption>) => {
                  field.onChange(selectedOption?.value || "");
                }}
                onBlur={field.onBlur}
                onInputChange={(inputValue: string) => {
                  setOrgSearchInput(inputValue || "");
                }}
                filterOption={() => true}
                placeholder=""
                isClearable
                isSearchable
                noOptionsMessage={({ inputValue }) =>
                  inputValue
                    ? `No organizations match "${inputValue}"`
                    : "No organizations available"
                }
              />
            )}
          />
          {errors.orgId && (
            <span className="form-error">{errors.orgId.message}</span>
          )}
        </div>
        <div className="form-field form-field--small">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            className="form-control"
            {...register("date", {
              setValueAs: (value) => value,
            })}
            ref={(e) => {
              register("date").ref(e);
              dateInputRef.current = e;
            }}
          />
          {errors.date && (
            <span className="form-error">{errors.date.message}</span>
          )}
        </div>
        <div className="form-field form-field--small">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="text"
            className="form-control"
            inputMode="decimal"
            onFocus={() => {
              const currentAmount = watch("amount");
              if (currentAmount === 0) {
                setValue("amount", undefined as unknown as number, {
                  shouldDirty: true,
                });
              }
            }}
            {...register("amount", {
              valueAsNumber: true,
              onBlur: handleAmountBlur,
            })}
          />
          {errors.amount && (
            <span className="form-error">{errors.amount.message}</span>
          )}
        </div>
        <div className="form-field form-field--medium">
          <label htmlFor="kind">Type</label>
          <Controller
            name="kind"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                id="kind"
                classNamePrefix="react-select-kind"
                options={KIND_OPTIONS}
                value={selectedKindOption}
                onChange={(selectedOption: SingleValue<KindOption>) => {
                  field.onChange(selectedOption?.value || "");
                }}
                onBlur={field.onBlur}
                filterOption={filterKindOption}
                placeholder=""
                isClearable={false}
                isSearchable={false}
                noOptionsMessage={() => "No types available"}
              />
            )}
          />
          {errors.kind && (
            <span className="form-error">{errors.kind.message}</span>
          )}
        </div>
        <div className="form-field form-field--large">
          <label htmlFor="paymentMethod">Payment method</label>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <CreatableSelect
                {...field}
                id="paymentMethod"
                classNamePrefix="react-select-payment"
                options={paymentMethodOptions}
                value={selectedPaymentMethodOption}
                onChange={(
                  selectedOption: SingleValue<PaymentMethodOption>,
                ) => {
                  field.onChange(selectedOption?.value || "");
                }}
                onBlur={field.onBlur}
                filterOption={filterPaymentMethodOption}
                placeholder=""
                isClearable
                isSearchable
                createOptionPosition="first"
                formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                noOptionsMessage={({ inputValue }) =>
                  inputValue
                    ? `Type "${inputValue}" to create it`
                    : "Start typing to see options or create new"
                }
              />
            )}
          />
          {errors.paymentMethod && (
            <span className="form-error">{errors.paymentMethod.message}</span>
          )}
        </div>
        <div className="form-field form-field--large">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={5}
            className="form-control form-control--readable"
            {...register("notes")}
          />
        </div>
        <div className="toolbar">
          <button type="submit">Save</button>
          {onDelete && mode === "edit" && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this donation?",
                  )
                ) {
                  onDelete();
                }
              }}
            >
              Delete
            </button>
          )}
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationUpsertForm;

// DONATION EDITOR FORM
// Organization selector - fit content (special control)
// Amount - some number of characters, like 123456.89 (12 characters)
// Type (paid, pledge, idea) - fit content (special control)
// Payment method -
// ORG EDIT FORM
// Organization name - some max characters
// Category selector - regular control with list
// Tax status selector -
// Web site
