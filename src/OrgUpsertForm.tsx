import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrgAddFormFieldsSchema, defaultFormFields } from "./organization";
import type { OrgAddFormFields } from "./organization";

interface OrgUpsertFormProps {
  onSubmit: (formData: OrgAddFormFields) => void;
  defaultValues?: OrgAddFormFields;
  mode?: "add" | "edit";
}

const OrgUpsertForm = ({
  onSubmit,
  defaultValues = defaultFormFields,
  mode = "add",
}: OrgUpsertFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrgAddFormFields>({
    resolver: zodResolver(OrgAddFormFieldsSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (mode === "edit") {
      reset(defaultValues);
    }
  }, [defaultValues, reset, mode]);

  const handleFormSubmit = (data: OrgAddFormFields) => {
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

        <button type="submit">
          {mode === "edit" ? "Save Changes" : "Add Organization"}
        </button>
      </form>
    </div>
  );
};

export default OrgUpsertForm;
