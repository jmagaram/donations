import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrgUpsertFieldsSchema, defaultFields } from "../organization";
import type { OrgUpsertFields } from "../organization";
import { OrgWebSiteSchema } from "../organization";

interface OrgUpsertFormProps {
  onSubmit: (formData: OrgUpsertFields) => void;
  defaultValues?: OrgUpsertFields;
  mode?: "add" | "edit";
  categories?: string[];
}

import { useNavigate } from "react-router-dom";

const OrgUpsertForm = ({
  onSubmit,
  defaultValues = defaultFields,
  mode = "add",
  categories = [],
}: OrgUpsertFormProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    getValues,
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
      navigate(-1);
      return;
    }
    onSubmit(data);
  };

  const handleWebSiteBlur = () => {
    const currentValue = getValues("webSite");
    if (!currentValue) return;

    const result = OrgWebSiteSchema.safeParse(currentValue);
    if (result.success && result.data !== currentValue) {
      setValue("webSite", result.data, { shouldDirty: true });
    }
  };

  return (
    <div>
      <h1>{mode === "edit" ? "Edit organization" : "New organization"}</h1>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" {...register("name")} />
          {errors.name && (
            <span className="form-error">{errors.name.message}</span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            type="text"
            list="categories"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            onKeyDown={(e) => {
              if (e.altKey && e.key === "ArrowDown") {
                e.preventDefault();
                try {
                  e.currentTarget.showPicker();
                } catch {
                  // If showPicker is not supported, do nothing
                }
              }
            }}
            {...register("category", {
              setValueAs: (value) =>
                typeof value === "string" ? value.trim() : value,
            })}
          />
          <datalist id="categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
        <div className="form-field">
          <label htmlFor="taxDeductible">Tax status</label>
          <select
            id="taxDeductible"
            {...register("taxDeductible", { setValueAs: (v) => v === "true" })}
            defaultValue={defaultValues.taxDeductible ? "true" : "false"}
          >
            <option value="true">Charity (tax-deductible)</option>
            <option value="false">Not tax-deductible</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="webSite">Website</label>
          <input
            id="webSite"
            type="text"
            {...register("webSite")}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            onBlur={handleWebSiteBlur}
          />
          {errors.webSite && (
            <span className="form-error">{errors.webSite.message}</span>
          )}
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
