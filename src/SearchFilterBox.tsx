import { type SearchFilter } from "./searchFilter";
import { useEffect, useState } from "react";

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
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={className}>
      <label htmlFor={id}>Search</label>
      <div className="search-input-container">
        <input
          type="search"
          id={id}
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default SearchFilterBox;
