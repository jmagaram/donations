import {
  paymentKindChoices,
  paymentKindParam,
  type PaymentKindFilterParam,
} from "./donationKindFilter";

interface DonationKindFilterSelectProps {
  value: PaymentKindFilterParam | undefined;
  onChange: (value: PaymentKindFilterParam | undefined) => void;
  className?: string;
  id?: string;
}

const DonationKindFilterSelect = ({
  value,
  onChange,
  className,
  id = "donation-type-filter",
}: DonationKindFilterSelectProps) => {
  const handleChange = (selectedValue: string) => {
    const decoded = paymentKindParam.parse(selectedValue);
    onChange(decoded);
  };

  return (
    <div className={className}>
      <label htmlFor={id}>Kind</label>
      <select
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      >
        {paymentKindChoices.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DonationKindFilterSelect;