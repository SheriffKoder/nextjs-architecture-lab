import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RoleEnum } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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

function roleKey(
  user: { role?: { role?: { key?: string } } | null } | null
) {
  return user?.role?.role?.key;
}

export function isInternalAdminOrUser(
  user: { role?: { role?: { key?: string } } | null } | null
) {
  const key = roleKey(user);
  return key === RoleEnum.ADMIN || key === RoleEnum.USER;
}

export function isInternalAdmin(
  user: { role?: { role?: { key?: string } } | null } | null
) {
  return roleKey(user) === RoleEnum.ADMIN;
}
