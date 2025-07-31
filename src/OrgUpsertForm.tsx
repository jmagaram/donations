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
      <h1>{mode === "edit" ? "Edit organization" : "New organization"}</h1>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" {...register("name")} />
          {errors.name && <span>{errors.name.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="taxDeductible">Tax status</label>
          <select
            id="taxDeductible"
            {...register("taxDeductible", { setValueAs: (v) => v === "true" })}
            defaultValue={defaultValues.taxDeductible ? "true" : "false"}
          >
            <option value="true">Tax-deductible</option>
            <option value="false">Not tax-deductible</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="webSite">Website</label>
          <input id="webSite" type="text" {...register("webSite")} />
          {errors.webSite && <span>{errors.webSite.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" rows={5} {...register("notes")} />
        </div>
        <div className="toolbar">
          <button type="submit">Save</button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrgUpsertForm;
