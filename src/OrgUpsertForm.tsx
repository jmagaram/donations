import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrgUpsertFieldsSchema, defaultFields } from "./organization";
import type { OrgUpsertFields } from "./organization";

interface OrgUpsertFormProps {
  onSubmit: (formData: OrgUpsertFields) => void;
  defaultValues?: OrgUpsertFields;
  mode?: "add" | "edit";
}

import { useNavigate } from "react-router-dom";

const OrgUpsertForm = ({
  onSubmit,
  defaultValues = defaultFields,
  mode = "add",
}: OrgUpsertFormProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<OrgUpsertFields>({
    resolver: zodResolver(OrgUpsertFieldsSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (mode === "edit") {
      reset(defaultValues);
    }
  }, [defaultValues, reset, mode]);

  const handleFormSubmit = (data: OrgUpsertFields) => {
    if (mode === "edit" && !isDirty) {
      console.log("No changes made, not submitting.");
      navigate(-1);
      return;
    }
    onSubmit(data);
  };

  return (
    <div>
      <h1>{mode === "edit" ? "Edit Organization" : "Add New Organization"}</h1>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div>
          <label htmlFor="name">Name:</label>
          <input id="name" type="text" {...register("name")} />
          {errors.name && <span>{errors.name.message}</span>}
        </div>
        <div>
          <label htmlFor="taxDeductible">Tax Deductible:</label>
          <input
            id="taxDeductible"
            type="checkbox"
            {...register("taxDeductible")}
          />
        </div>
        <div>
          <label htmlFor="notes">Notes:</label>
          <textarea id="notes" {...register("notes")} />
        </div>
        <div className="item-toolbar">
          <button type="submit">
            {mode === "edit" ? "Save Changes" : "Add Organization"}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrgUpsertForm;
