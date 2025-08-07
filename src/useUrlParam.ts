import { useSearchParams } from "react-router-dom";

interface UseUrlParamOptions<T> {
  /** The URL parameter name */
  paramName: string;
  /** Parse URL parameter string into typed value. Return undefined if invalid. */
  parseFromString: (value: string) => T | undefined;
  /** 
   * Value to use when URL parameter is missing/empty/invalid (initial state)
   * AND value representing "no filter applied" - when set, URL parameter is removed
   */
  defaultValue: T;
  /** 
   * Convert typed value to URL parameter string. 
   * Return undefined to remove parameter from URL (equivalent to defaultValue behavior)
   */
  stringifyValue: (value: T) => string | undefined;
  /** Optional equality function for comparing values (needed for object types) */
  areEqual?: (a: T, b: T) => boolean;
}

export const useUrlParam = <T>({
  paramName,
  parseFromString,
  defaultValue,
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
      ? areEqual(newValue, defaultValue)
      : newValue === defaultValue;
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

  const resetToDefault = () => {
    updateValue(defaultValue);
  };

  return [currentValue, updateValue, resetToDefault] as const;
};
