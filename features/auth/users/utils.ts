/**
 * Converts a params object to URLSearchParams.
 */
export function buildQueryParams(
  params?: Record<string, unknown>
): URLSearchParams {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") {
        let stringValue: string;
        if (Array.isArray(value)) {
          stringValue = value.join(",");
        } else if (typeof value === "number") {
          stringValue = value.toString();
        } else if (typeof value === "boolean") {
          stringValue = value.toString();
        } else {
          stringValue = String(value);
        }
        queryParams.append(key, stringValue);
      }
    });
  }

  return queryParams;
}
