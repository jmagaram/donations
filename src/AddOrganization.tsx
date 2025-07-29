import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const AddOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  taxDeductible: z.boolean(),
  notes: z.string(),
});

type AddOrganizationForm = z.infer<typeof AddOrganizationSchema>;

const AddOrganization = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddOrganizationForm>({
    resolver: zodResolver(AddOrganizationSchema),
    defaultValues: {
      name: "",
      taxDeductible: false,
      notes: "",
    },
  });

  const onSubmit = (data: AddOrganizationForm) => {
    console.log("Form data:", data);
    // TODO: Handle form submission
  };

  return (
    <div>
      <h1>Add New Organization</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            {...register("name")}
          />
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
          <textarea
            id="notes"
            {...register("notes")}
          />
        </div>

        <button type="submit">Add Organization</button>
      </form>
    </div>
  );
};

export default AddOrganization;