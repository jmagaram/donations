import { useSearchParams } from "react-router-dom";

export interface SearchParam<T> {
  parse: (value: string | undefined) => T | undefined;
  encode: (value: T) => string | undefined;
}

// Custom hook to sync a typed value with a URL search parameter
export const useSearchParam = <T>(
  paramName: string,
  param: SearchParam<T>,
): [T | undefined, (value: T | undefined) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlValue = searchParams.get(paramName);
  const currentValue = param.parse(urlValue ?? undefined);
  const setValue = (value: T | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined) {
      const encoded = param.encode(value);
      if (encoded !== undefined) {
        newParams.set(paramName, encoded);
      } else {
        newParams.delete(paramName);
      }
    } else {
      newParams.delete(paramName);
    }
    setSearchParams(newParams);
  };

  return [currentValue, setValue];
};
