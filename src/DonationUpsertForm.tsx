import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DonationUpsertFieldsSchema, defaultFields } from "./donation";
import type { DonationUpsertFields } from "./donation";

import type { DonationsData } from "./types";

interface DonationUpsertFormProps {
  onSubmit: (formData: DonationUpsertFields) => void;
  defaultValues?: DonationUpsertFields;
  mode?: "add" | "edit";
  donationsData?: DonationsData;
}

import { useSearchParams } from "react-router-dom";

const DonationUpsertForm = ({
  onSubmit,
  defaultValues = defaultFields,
  mode = "add",
  donationsData,
}: DonationUpsertFormProps) => {
  const [searchParams] = useSearchParams();
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
    formState: { errors },
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
    console.log("Submitting donation form with data:", data);
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
      <h1>{mode === "edit" ? "Edit Donation" : "Add New Donation"}</h1>
      <div style={{ marginBottom: "1em" }}>
        <strong>Organization:</strong> {orgName}
      </div>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <input type="hidden" {...register("orgId")} />
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && <span>{errors.amount.message}</span>}
        </div>

        <div>
          <label htmlFor="kind">Type:</label>
          <select id="kind" {...register("kind")}>
            <option value="idea">Idea</option>
            <option value="pledge">Pledge</option>
            <option value="paid">Paid</option>
          </select>
          {errors.kind && <span>{errors.kind.message}</span>}
        </div>

        <div>
          <label htmlFor="date">Date:</label>
          <input id="date" type="date" {...register("date")} />
          {errors.date && <span>{errors.date.message}</span>}
        </div>

        <div>
          <label htmlFor="notes">Notes:</label>
          <textarea id="notes" {...register("notes")} />
        </div>

        <button type="submit">
          {mode === "edit" ? "Save Changes" : "Add Donation"}
        </button>
      </form>
    </div>
  );
};

export default DonationUpsertForm;
