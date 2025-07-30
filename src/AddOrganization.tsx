import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddOrgFormSchema } from "./organization";
import type { AddOrgForm } from "./organization";

type AddOrgProps = {
  onAddOrg: (data: AddOrgForm) => void;
};

const AddOrg = ({ onAddOrg: onAddOrganization }: AddOrgProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddOrgForm>({
    resolver: zodResolver(AddOrgFormSchema),
    defaultValues: {
      name: "",
      taxDeductible: false,
      notes: "",
    },
  });

  const onSubmit = (data: AddOrgForm) => {
    onAddOrganization(data);
  };

  return (
    <div>
      <h1>Add New Organization</h1>
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

        <button type="submit">Add Organization</button>
      </form>
    </div>
  );
};

export default AddOrg;
