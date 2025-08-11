import { type SearchFilter } from "./searchFilter";
import { useRef, useEffect, useState } from "react";

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
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const REQUIRED_IDLE_MS = 750;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
      setIsSearching(false);
    }, REQUIRED_IDLE_MS);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    if (newValue !== value) {
      setIsSearching(true);
    }
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
        {isSearching && <div className="search-animation-overlay" />}
      </div>
    </div>
  );
};

export default SearchFilterBox;
