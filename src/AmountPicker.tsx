import { formatUSD } from "./amount";

interface AmountPickerProps {
  label: string;
  value: number;
  options: number[];
  sort: "smallestFirst" | "biggestFirst";
  onChange: (value: number) => void;
  className?: string;
  id?: string;
}

const AmountPicker = ({
  label,
  value,
  options,
  sort,
  onChange,
  className,
  id,
}: AmountPickerProps) => {
  const sortedOptions = [...options].sort((a, b) => 
    sort === "smallestFirst" ? a - b : b - a
  );

  const handleChange = (selectedValue: string) => {
    const numValue = parseInt(selectedValue);
    onChange(numValue);
  };

  return (
    <div className={className}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      >
        {sortedOptions.map((amount) => (
          <option key={amount} value={amount}>
            {formatUSD(amount, "hidePennies")}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AmountPicker;