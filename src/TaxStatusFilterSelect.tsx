import {
  taxStatusChoices,
  taxStatusParam,
  type TaxStatusFilter,
} from "./taxStatusFilter";

interface TaxStatusFilterSelectProps {
  value: TaxStatusFilter | undefined;
  onChange: (value: TaxStatusFilter | undefined) => void;
  className?: string;
  id?: string;
}

const TaxStatusFilterSelect = ({
  value,
  onChange,
  className,
  id = "tax-status-filter",
}: TaxStatusFilterSelectProps) => {
  const handleChange = (selectedValue: string) => {
    const decoded = taxStatusParam.parse(selectedValue);
    onChange(decoded);
  };

  return (
    <div className={className}>
      <label htmlFor={id}>Tax status</label>
      <select
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      >
        {taxStatusChoices.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TaxStatusFilterSelect;