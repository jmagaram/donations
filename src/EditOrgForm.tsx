import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddOrgFormFieldsSchema } from "./organization";
import type { AddOrgFormFields } from "./organization";

interface EditOrgFormProps {
  organization: AddOrgFormFields;
  onEditOrg: (formData: AddOrgFormFields) => void;
}

const EditOrgForm = ({ organization, onEditOrg }: EditOrgFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddOrgFormFields>({
    resolver: zodResolver(AddOrgFormFieldsSchema),
    defaultValues: organization,
  });

  // If the organization prop changes, update the form values
  // (optional, but good for prop-driven forms)
  React.useEffect(() => {
    reset(organization);
  }, [organization, reset]);

  const onSubmit = (data: AddOrgFormFields) => {
    onEditOrg(data);
  };

  return (
    <div>
      <h1>Edit Organization</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
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

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditOrgForm;
