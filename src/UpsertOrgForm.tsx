import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddOrgFormFieldsSchema, defaultFormFields } from "./organization";
import type { AddOrgFormFields } from "./organization";

interface UpsertOrgFormProps {
  onSubmit: (formData: AddOrgFormFields) => void;
  defaultValues?: AddOrgFormFields;
  mode?: "add" | "edit";
}

const UpsertOrgForm = ({
  onSubmit,
  defaultValues = defaultFormFields,
  mode = "add",
}: UpsertOrgFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddOrgFormFields>({
    resolver: zodResolver(AddOrgFormFieldsSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (mode === "edit") {
      reset(defaultValues);
    }
  }, [defaultValues, reset, mode]);

  const handleFormSubmit = (data: AddOrgFormFields) => {
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

export default UpsertOrgForm;
