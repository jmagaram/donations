import { type SearchFilter } from "./searchFilter";

interface SearchFilterBoxProps {
  value: SearchFilter;
  onChange: (value: SearchFilter) => void;
  className?: string;
  id?: string;
  placeholder?: string;
}

const SearchFilterBox = ({
  value,
  onChange,
  className,
  id = "filter",
  placeholder = "Search",
}: SearchFilterBoxProps) => {
  const handleChange = (inputValue: string) => {
    onChange(inputValue);
  };

  return (
    <div className={className}>
      <label htmlFor={id}>Search</label>
      <input
        type="search"
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchFilterBox;