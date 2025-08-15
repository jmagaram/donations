import {
  type CategoryFilter,
  categoryFilterSearchParam,
} from "../categoryFilter";

const NO_FILTER = "__no_filter__";

interface CategoryPickerProps {
  value: CategoryFilter | undefined;
  availableCategories: CategoryFilter[];
  onChange: (value: CategoryFilter | undefined) => void;
  className?: string;
  id?: string;
}

const CategoryPicker = ({
  value,
  availableCategories,
  onChange,
  className,
  id = "category-filter",
}: CategoryPickerProps) => {
  const getCategoryDisplayLabel = (category: CategoryFilter): string => {
    return category === "" ? "No category" : category;
  };

  const getSelectValue = (): string => {
    if (value === undefined) return NO_FILTER;
    const encoded = categoryFilterSearchParam.encode(value);
    return encoded ?? NO_FILTER;
  };

  const handleChange = (selectedValue: string) => {
    if (selectedValue === NO_FILTER) {
      onChange(undefined);
    } else {
      const decoded = categoryFilterSearchParam.parse(selectedValue);
      onChange(decoded);
    }
  };

  // Ensure current value is included in options if it's not already there
  const allCategories = [...availableCategories];
  if (value !== undefined && !availableCategories.includes(value)) {
    allCategories.push(value);
    // Sort to maintain consistent ordering
    allCategories.sort((a, b) => {
      if (a === "") return -1; // "No category" first
      if (b === "") return 1;
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  }

  return (
    <div className={className}>
      <label htmlFor={id}>Category</label>
      <select
        id={id}
        value={getSelectValue()}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option key={NO_FILTER} value={NO_FILTER}>
          All categories
        </option>
        {allCategories
          .map((category) => {
            const encoded = categoryFilterSearchParam.encode(category);
            return encoded !== undefined ? (
              <option key={encoded} value={encoded}>
                {getCategoryDisplayLabel(category)}
              </option>
            ) : null;
          })
          .filter(Boolean)}
      </select>
    </div>
  );
};

export default CategoryPicker;
