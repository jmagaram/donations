import { useSearchParams } from "react-router-dom";

interface UseUrlParamOptions<T> {
  paramName: string;
  parseFromString: (value: string) => T | undefined;
  defaultValue: T;
  noFilterValue: T;
  stringifyValue: (value: T) => string | undefined;
  areEqual?: (a: T, b: T) => boolean;
}

export const useUrlParam = <T>({
  paramName,
  parseFromString,
  defaultValue,
  noFilterValue,
  stringifyValue,
  areEqual,
}: UseUrlParamOptions<T>) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentValue = (() => {
    const paramValue = searchParams.get(paramName);
    if (paramValue === null) return defaultValue;
    const trimmed = paramValue.trim();
    if (trimmed === "") return defaultValue;
    const parsed = parseFromString(trimmed);
    return parsed !== undefined ? parsed : defaultValue;
  })();

  const updateValue = (newValue: T) => {
    const newParams = new URLSearchParams(searchParams);
    const isNoFilter = areEqual
      ? areEqual(newValue, noFilterValue)
      : newValue === noFilterValue;
    if (isNoFilter) {
      newParams.delete(paramName);
    } else {
      const stringValue = stringifyValue(newValue);
      if (stringValue !== undefined) {
        newParams.set(paramName, stringValue);
      } else {
        newParams.delete(paramName);
      }
    }
    setSearchParams(newParams);
  };

  const resetToDefault = () => updateValue(defaultValue);

  return [currentValue, updateValue, resetToDefault] as const;
};
