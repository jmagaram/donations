import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DonationUpsertFieldsSchema, defaultFields } from "./donation";
import type { DonationUpsertFields } from "./donation";

import type { DonationsData } from "./types";

interface DonationUpsertFormProps {
  onSubmit: (formData: DonationUpsertFields) => void;
  onDelete?: () => void;
  defaultValues?: DonationUpsertFields;
  mode?: "add" | "edit";
  donationsData?: DonationsData;
}

import { useSearchParams, useNavigate } from "react-router-dom";

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
  const orgName = donationsData?.orgs.find((o) => o.id === orgId)?.name;
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

  if (!orgId || !orgName) {
    return (
      <div>
        <h1>{mode === "edit" ? "Edit Donation" : "Add New Donation"}</h1>
        <div style={{ color: "red", margin: "1em 0" }}>
          The organization {orgId || "(none)"} was not found.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>{mode === "edit" ? "Edit donation" : "New donation"}</h1>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <input type="hidden" {...register("orgId")} />
        <div className="form-field">
          <label htmlFor="name">Organization</label>
          <div>
            <strong>{orgName}</strong>
          </div>
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
          </select>
          {errors.kind && <span>{errors.kind.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="date">Date</label>
          <input id="date" type="date" {...register("date")} />
          {errors.date && <span>{errors.date.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" rows={5} {...register("notes")} />
        </div>
        <div className="item-toolbar">
          <button type="submit">
            {mode === "edit" ? "Save Changes" : "Add Donation"}
          </button>
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
              style={{ marginLeft: "0.5em" }}
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
