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
        <div className="form-field form-field--large">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            className="form-control"
            {...register("name")}
          />
          {errors.name && (
            <span className="form-error">{errors.name.message}</span>
          )}
        </div>
        <div className="form-field form-field--medium">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            type="text"
            className="form-control"
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
        <div className="form-field form-field--medium">
          <label htmlFor="taxDeductible">Tax status</label>
          <select
            id="taxDeductible"
            className="form-control"
            {...register("taxDeductible", {
              // Some browsers (notably iOS Safari) may provide the value as a boolean
              // instead of a string. Accept both 'true' (string) and true (boolean).
              setValueAs: (v) => v === true || v === "true",
            })}
          >
            <option value="true">Charity (tax-deductible)</option>
            <option value="false">Not tax-deductible</option>
          </select>
        </div>
        <div className="form-field form-field--large">
          <label htmlFor="webSite">Website</label>
          <input
            id="webSite"
            type="text"
            className="form-control"
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
        <div className="form-field form-field--large">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={5}
            className="form-control form-control--readable"
            {...register("notes")}
          />
        </div>
        {mode === "edit" && (
          <div className="form-field form-field--medium">
            <label htmlFor="archived">
              <input
                id="archived"
                type="checkbox"
                {...register("archived")}
                style={{ marginRight: "0.5em" }}
              />
              Archived
            </label>
          </div>
        )}
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
