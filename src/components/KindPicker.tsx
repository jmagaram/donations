import {
  paymentKindChoices,
  paymentKindParam,
  type KindFilterParam,
} from "../kindFilter";

interface KindPickerProps {
  value: KindFilterParam | undefined;
  onChange: (value: KindFilterParam | undefined) => void;
  className?: string;
  id?: string;
}

const KindPicker = ({
  value,
  onChange,
  className,
  id = "donation-type-filter",
}: KindPickerProps) => {
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

export default KindPicker;
