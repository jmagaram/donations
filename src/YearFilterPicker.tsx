import {
  type YearFilter,
  yearFilterSearchParam,
  getYearDisplayLabel,
} from "./yearFilter";

const NO_FILTER = "__no_filter__";

interface YearFilterPickerProps {
  value: YearFilter | undefined;
  onChange: (value: YearFilter | undefined) => void;
  minYear: number;
  maxYear: number;
  lastYearOptions?: number[];
  className?: string;
  id?: string;
}

const YearFilterPicker = ({
  value,
  onChange,
  minYear,
  maxYear,
  lastYearOptions = [2, 3, 4, 5],
  className,
  id = "year-filter",
}: YearFilterPickerProps) => {
  const getSelectValue = (): string => {
    if (value === undefined) return NO_FILTER;
    const encoded = yearFilterSearchParam.encode(value);
    return encoded ?? NO_FILTER;
  };

  const handleChange = (selectedValue: string) => {
    if (selectedValue === NO_FILTER) {
      onChange(undefined);
    } else {
      const decoded = yearFilterSearchParam.parse(selectedValue);
      onChange(decoded);
    }
  };

  const getYearOptions = (): YearFilter[] => {
    const options: YearFilter[] = [{ kind: "current" }, { kind: "previous" }];

    // Add "last N years" options based on prop
    for (const count of lastYearOptions) {
      options.push({ kind: "last", count });
    }
    const individualYears: number[] = [];
    for (let year = maxYear; year >= minYear; year--) {
      individualYears.push(year);
    }
    if (value?.kind === "other" && !individualYears.includes(value.value)) {
      individualYears.push(value.value);
      individualYears.sort((a, b) => b - a); // Descending
    }
    for (const year of individualYears) {
      options.push({ kind: "other", value: year });
    }
    return options;
  };

  const yearOptions = getYearOptions();

  return (
    <div className={className}>
      <label htmlFor={id}>Years</label>
      <select
        id={id}
        value={getSelectValue()}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option key={NO_FILTER} value={NO_FILTER}>
          All years
        </option>
        {yearOptions
          .map((filter) => {
            const encoded = yearFilterSearchParam.encode(filter);
            return encoded !== undefined ? (
              <option key={encoded} value={encoded}>
                {getYearDisplayLabel(filter)}
              </option>
            ) : null;
          })
          .filter(Boolean)}
      </select>
    </div>
  );
};

export default YearFilterPicker;
