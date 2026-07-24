/**
 * Rental car location — option rows like `{ value, label }` from an API.
 * `value` is what is stored on `RentalCarTableItem.location` (must match filter / server fields).
 *
 * Implemented as `.ts` (React.createElement, no JSX) so `columns.ts` resolves this module
 * reliably under TypeScript `moduleResolution: "bundler"`.
 */

import * as React from "react";
import { MapPin } from "lucide-react";
import type { DropdownOption } from "@/widgets/multi-view/types/dropdown";
import { RoundedIconBadge, type BadgePalette } from "@/shared/ui/badges";

export type RentalCarLocationOption = {
  value: string;
  label: string;
};

/** Inherits surrounding text color (table + dropdown rows); no semantic fills. */
const RENTAL_CAR_LOCATION_BADGE_PALETTE: BadgePalette = {
  bg: "bg-transparent",
  border: "border-transparent",
  text: "text-inherit",
  icon: "text-inherit group-hover:fill-transparent",
};

const BADGE_CLASS = "min-w-0 max-w-full truncate";

function rentalCarLocationBadgeElement(label: string): React.ReactElement {
  const props = {
    palette: RENTAL_CAR_LOCATION_BADGE_PALETTE,
    icon: MapPin,
    className: BADGE_CLASS,
  };
  // React typings require `children` on props; `createElement(C, props, child)` is valid at runtime.
  return React.createElement(RoundedIconBadge, props as never, label);
}

/**
 * Demo / stand-in for fetched location enum. Extend when seed data adds cities.
 */
export const rentalCarLocationOptions: RentalCarLocationOption[] = [
  { value: "New York, NY", label: "New York, NY" },
  { value: "Los Angeles, CA", label: "Los Angeles, CA" },
  { value: "Chicago, IL", label: "Chicago, IL" },
  { value: "Miami, FL", label: "Miami, FL" },
  { value: "Seattle, WA", label: "Seattle, WA" },
];

/** For `TableColumn.dropdownOptions` / `EditableCell`. */
export const rentalCarLocationDropdownOptions: DropdownOption[] =
  rentalCarLocationOptions.map((o) => ({
    value: o.value,
    label: o.label,
  }));

/** Column keys that use inline editing (keep table / list / subheadings configs in sync). */
export const demoRscEditableColumnKeys: string[] = ["location"];

export function formatRentalCarLocationValue(value: unknown): string {
  const key = String(value ?? "");
  const opt = rentalCarLocationOptions.find((o) => o.value === key);
  if (opt) return opt.label;
  return key || String(value ?? "");
}

export function rentalCarLocationDropdownFormatter(
  option: DropdownOption,
): React.ReactElement {
  return rentalCarLocationBadgeElement(option.label);
}

export function rentalCarLocationFormatCell(value: unknown): React.ReactElement {
  return rentalCarLocationBadgeElement(formatRentalCarLocationValue(value));
}

export const rentalCarLocationFormat = {
  text: formatRentalCarLocationValue,
  cell: rentalCarLocationFormatCell,
};
