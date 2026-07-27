# `config/mocks` — responsibility map

Temporary stand-in data. Anything here must eventually come from a real loader, facet API, or entity action. Keep formatters and chrome in `ui/`; keep query/cache policy in `data/`.

## Files

| File | What it mocks | Wired today | Replace with |
|------|---------------|-------------|--------------|
| `form-option-mocks.ts` | Make / status / location `DropdownItem` lists for the create drawer | `ui/drawer-forms/rsc-car-create-form-client.tsx` (`items={MOCK_CAR_*}`) | Facet options from `getFilters` / a dedicated lookup (same `DropdownItem` or map from `FilterConfig.options`). Prefer server-provided values so create form stays aligned with list filters. |
| `location-options-mock.ts` | Location `{ value, label }` enum for inline editable cells | `ui/cells/rental-car-location-options.ts` → `columns.ts` / table editable dropdown | Same location facet or `/locations` lookup. Keep `value` equal to `RentalCarTableItem.location` (and filter URL values). |
| `timeline-journey-mocks.ts` | Static journey timeline events (not per-car) | `ui/drawer/modes/view/sections/sections-layout.tsx` → `TimelineJourney` `data` prop | Per-car history endpoint (e.g. `getRentalCarJourney(id)` on drawer open). Pass real `TimelineJourneyItem[]` into `TimelineJourney`. |

## How to wire real data

1. **Find the consumer** in the table above (or grep `MOCK_` / `config/mocks`).
2. **Load real data** at the nearest server boundary (RSC section, cached loader, or client fetch after open).
3. **Pass props** into the form / cell / timeline instead of importing from `config/mocks`.
4. **Delete** the mock export once nothing imports it; update this file.

## Dependency rule

- View / `ui/` may import mocks while demos are stand-ins.
- `contract/` and `data/` must not depend on mocks (real query config stays real).
- Mocks may import **types** from entities or view UI; they must not import runtime fetchers.

## Not in this folder

| Concern | Where it lives |
|---------|----------------|
| In-memory `rentalCars` seed store | `entities/cars-rsc/server/data-source.ts` (entity mock store, not view config) |
| Map lat/lng hash fallbacks | `ui/displays/map-config.ts` (display adapter until rows have coordinates) |
| Calendar/timeline date field keys | `ui/displays/*-config.ts` (field mapping; dates already on the row type) |
