/**
 * Rental car status column: label text + semantic palette → `RoundedIconBadge`.
 */

import * as React from "react";
import {
  badgeSemanticPalettes,
  type BadgeSemantic,
  RoundedIconBadge,
  RoundedDotBadge,
  RoundedBadge,
  SemiRoundedBadge,
} from "@/shared/ui/badges";

import {
  RentalCarStatus,
  type RentalCarStatusValue,
} from "@/entities/demo-hybrid-cars/model/rental-car-status";

const rentalCarStatusLabels: Record<RentalCarStatusValue, string> = {
  [RentalCarStatus.AVAILABLE]: "Available",
  [RentalCarStatus.RENTED]: "Rented",
  [RentalCarStatus.MAINTENANCE]: "Maintenance",
  [RentalCarStatus.RESERVED]: "Reserved",
};

const rentalCarStatusSemanticByKey: Record<
  RentalCarStatusValue,
  BadgeSemantic
> = {
  [RentalCarStatus.AVAILABLE]: "high",
  [RentalCarStatus.RENTED]: "info",
  [RentalCarStatus.MAINTENANCE]: "low",
  [RentalCarStatus.RESERVED]: "medium",
};

function rentalCarStatusFormatText(value: unknown): string {
  const key = String(value ?? "");
  return rentalCarStatusLabels[key as RentalCarStatusValue] ?? key;
}

function rentalCarStatusFormatCell(value: unknown): React.ReactElement {
  const key = String(value ?? "");
  const semantic =
    rentalCarStatusSemanticByKey[key as RentalCarStatusValue] ?? "neutral";
  const palette = badgeSemanticPalettes[semantic];
  const label = rentalCarStatusLabels[key as RentalCarStatusValue] ?? key;

  return (
    <RoundedDotBadge palette={palette}>{label}</RoundedDotBadge>
  );
}

/** Single import for the status column: `.text` (formatter) + `.cell` (badge) */
export const rentalCarStatusFormat = {
  text: rentalCarStatusFormatText,
  cell: rentalCarStatusFormatCell,
};
