import {
  taxStatusChoices,
  taxStatusParam,
  type TaxStatusFilter,
} from "../taxStatusFilter";

interface TaxStatusPickerProps {
  value: TaxStatusFilter | undefined;
  onChange: (value: TaxStatusFilter | undefined) => void;
  className?: string;
  id?: string;
}

const TaxStatusPicker = ({
  value,
  onChange,
  className,
  id = "tax-status-filter",
}: TaxStatusPickerProps) => {
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

export default TaxStatusPicker;
