import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import StatusBox from "./StatusBox";
import { DonationUpsertFieldsSchema, defaultFields } from "./donation";
import type { DonationUpsertFields } from "./donation";
import type { DonationsData } from "./types";
import { findOrgById } from "./donationsData";
import { useSearchParams, useNavigate } from "react-router-dom";

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
  const orgId =
    mode === "edit" ? defaultValues.orgId : searchParams.get("org") || "";
  const formDefaultValues = {
    ...defaultValues,
    orgId,
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<DonationUpsertFields>({
    resolver: zodResolver(DonationUpsertFieldsSchema),
    defaultValues: formDefaultValues,
  });

  React.useEffect(() => {
    if (mode === "edit") {
      reset(defaultValues);
    }
  }, [defaultValues, reset, mode]);

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
          content={`The organization ${orgId} for this donation was not found. Delete the donation and create it from scratch.`}
          kind="error"
        />
      </div>
    );
  }

  return (
    <div>
      <h1>{mode === "edit" ? "Edit donation" : "New donation"}</h1>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-field">
          <label htmlFor="orgId">Organization</label>
          <select id="orgId" {...register("orgId")}>
            <option value="">Select an organization</option>
            {donationsData?.orgs
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
          </select>
          {errors.orgId && <span>{errors.orgId.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && <span>{errors.amount.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="kind">Type</label>
          <select id="kind" {...register("kind")}>
            <option value="idea">Idea</option>
            <option value="pledge">Pledge</option>
            <option value="paid">Paid</option>
            <option value="unknown">Unknown</option>
          </select>
          {errors.kind && <span>{errors.kind.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" {...register("date")} />
          {errors.date && <span>{errors.date.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="paymentMethod">Payment method</label>
          <input
            id="paymentMethod"
            list="paymentMethods"
            {...register("paymentMethod")}
          />
          <div className="form-field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" rows={5} {...register("notes")} />
          </div>
          <datalist id="paymentMethods">
            <option value="Stock" />
            <option value="Amex" />
            <option value="Wells Fargo Credit" />
            <option value="Wells Fargo Check" />
          </datalist>
        </div>
        <div className="toolbar">
          <button type="submit">Save changes</button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          {onDelete && mode === "edit" && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Really want to delete?")) {
                  onDelete();
                }
              }}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DonationUpsertForm;
