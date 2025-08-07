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



export type AmountFilter =
  | { kind: "all" }
  | { kind: "moreThan"; min: number }
  | { kind: "lessThan"; max: number }
  | { kind: "between"; min: number; max: number };

export const amountFilterParam: UrlParam<AmountFilter> = {
  parse: (value: string | undefined): AmountFilter => {
    if (value === undefined || value === "" || value === "all")
      return { kind: "all" };

    const parts = value.split("_");
    const type = parts[0];

    switch (type) {
      case "moreThan": {
        if (parts.length !== 2) return { kind: "all" };
        const min = parseFloat(parts[1]);
        return isNaN(min) ? { kind: "all" } : { kind: "moreThan", min };
      }
      case "lessThan": {
        if (parts.length !== 2) return { kind: "all" };
        const max = parseFloat(parts[1]);
        return isNaN(max) ? { kind: "all" } : { kind: "lessThan", max };
      }
      case "between": {
        if (parts.length !== 3) return { kind: "all" };
        const min = parseFloat(parts[1]);
        const max = parseFloat(parts[2]);
        return isNaN(min) || isNaN(max)
          ? { kind: "all" }
          : { kind: "between", min, max };
      }
      default:
        return { kind: "all" }; // Invalid -> default
    }
  },

  encode: (value: AmountFilter): string | undefined => {
    switch (value.kind) {
      case "all":
        return undefined; // Omit default from URL
      case "moreThan":
        return `moreThan_${value.min}`;
      case "lessThan":
        return `lessThan_${value.max}`;
      case "between":
        return `between_${value.min}_${value.max}`;
    }
  },
};
