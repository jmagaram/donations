import { type SearchFilter } from "./searchFilter";
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "./useDebounce";

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
  const debouncedInputValue = useDebounce(inputValue, 1000);

  // Use ref to avoid onChange dependency in useEffect, which would cause
  // infinite loops if onChange gets recreated on every parent render
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    onChangeRef.current(debouncedInputValue);
  }, [debouncedInputValue]);

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
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
