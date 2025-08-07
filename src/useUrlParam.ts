import { useSearchParams } from "react-router-dom";

export interface UrlParam<T> {
  /**
   * Parse URL parameter value into typed value.
   * @param value - undefined if parameter doesn't exist (e.g., "/donations")
   *                empty string if parameter exists with no value (e.g., "/donations?hideFutureItems")
   *                string value if parameter has explicit value (e.g., "/donations?sortBy=date-asc")
   * @returns parsed value or undefined if parsing should result in omitting the parameter
   */
  parse: (value: string | undefined) => T | undefined;

  /**
   * Encode typed value into URL parameter string.
   * @param value - the typed value to encode
   * @returns string to use as parameter value, or undefined to omit parameter from URL entirely
   */
  encode: (value: T) => string | undefined;
}

export const useUrlParamValue = <T>(
  paramName: string,
  param: Pick<UrlParam<T>, "parse">,
): T | undefined => {
  const [searchParams] = useSearchParams();
  const urlValue = searchParams.get(paramName);
  return param.parse(urlValue ?? undefined);
};
