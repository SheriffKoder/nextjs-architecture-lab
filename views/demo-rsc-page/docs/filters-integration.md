
// Target
if we checked features\demo-rsc-page\demo-rsc-index.tsx
we will find that we are getting data by
const cars = await getRentalCarsData()

we have a header and a DemoRscContent

i want to place above the DemoRscContent the filters and below the DemoRscContent  the pagination.

// Reference
we should take this page as a model 
features\filters\page-server-layout\page.tsx

so what we have there
get data logic before return.
return
- some filters
- table
- pagination

// What to do
1- create a filters-header component matching this
@page.tsx (47-111)  in features\filters

2- create a pagination-footer component matching this @page.tsx (120-126) in features\filters

3- create a filter-config file in features\demo-rsc-page\config like the features\filters\page-client\feature-config\employee-filter-config.ts to use on this demo-rsc-index but to match this demo rsc page's data.

4- update features\demo-rsc-page\utils\server\get-rental-cars-data.ts to handle filters like features\filters\page-server\utils\get-page-data.ts
i have already copied the backend-simulate folder to use in the utils/server they are here features\demo-rsc-page\utils\server\backend-simulate

5- also create a get-filter-options-server.ts

import in the demo-rsc-index.

expected output for RSC index.:
fetch data to pass to the following layers
[Filters]
[Content component data={data}]
[Pagination]



Implementation Plan
1. Create Filters Header Component
File: features/filters/components/filters-header.tsx
Extract the filter rows (lines 47-111) from the reference page
Accept props: filters, searchConfig, paginationConfig
Include all 4 rows: Search+FiltersBar, PillFilter+DateFilter, DropdownSearchBar+DropdownFilters, FilterOptionsButtons
2. Create Pagination Footer Component
File: features/filters/components/pagination-footer.tsx
Extract pagination section (lines 120-126)
Accept props: totalItems, config
3. Create Filter Config for Rental Cars
File: features/demo-rsc-page/config/rental-car-filter-config.ts
Based on RentalCarTableItem fields:
status (multi-select): "available", "rented", "maintenance", "reserved"
make (multi-select): "Toyota", "Honda", "Ford", etc.
location (multi-select): "New York, NY", "Los Angeles, CA"
year (number-range): 2021-2024
pricePerDay (number-range): price range
mileage (number-range): mileage range
rentalStartDate (date-range): rental start date
Include: fieldMap, baseFilters, searchConfig, sortConfig, paginationConfig, queryBuilderFields, icons
4. Update get-rental-cars-data.ts
File: features/demo-rsc-page/utils/server/get-rental-cars-data.ts
Follow the pattern from get-page-data.ts:
Step 1: Filter cars based on searchParams
Step 2: Apply sorting
Step 3: Parse pagination
Step 4: Apply pagination slice
Step 5: Return { cars, pagination }
Use backend-simulate/filter-employees.ts as a template (create filter-rental-cars.ts)
5. Create get-filter-options-server.ts
File: features/demo-rsc-page/utils/server/get-filter-options-server.ts
Follow the pattern from features/filters/page-server/utils/get-filter-options-server.ts
Use rental car data and field map
Return populated filter configs with options
6. Update demo-rsc-index.tsx
Accept searchParams prop (Next.js 15 format)
Call getFilterOptionsServer and getRentalCarsData with searchParams
Render: <FiltersHeader />, <DemoRscContent />, <PaginationFooter />
File Structure
features/├── filters/│   └── components/│       ├── filters-header.tsx          # NEW│       └── pagination-footer.tsx        # NEW└── demo-rsc-page/    ├── config/    │   └── rental-car-filter-config.ts # NEW    ├── utils/    │   └── server/    │       ├── backend-simulate/    │       │   ├── filter-rental-cars.ts        # NEW (copy from filter-employees.ts)    │       │   └── get-filter-options.ts       # Already exists    │       ├── get-rental-cars-data.ts          # UPDATE    │       └── get-filter-options-server.ts    # NEW    └── demo-rsc-index.tsx                       # UPDATE
Expected Output Structure
// demo-rsc-index.tsxexport default async function DemoRscIndex({  searchParams}: {  searchParams: Promise<{ [key: string]: string | string[] | undefined }>}) {  const params = await searchParams  const filters = await getFilterOptionsServer(rentalCarBaseFilters, params)  const { cars, pagination } = await getRentalCarsData(params)    return (    <>      <FiltersHeader filters={filters} ... />      <DemoRscContent cars={cars} />      <PaginationFooter totalItems={pagination.totalItems} ... />    </>  )}
Notes
Filter fields to support:
status (multi-select)
make (multi-select)
location (multi-select)
year (number-range)
pricePerDay (number-range)
mileage (number-range)
rentalStartDate (date-range)
Search fields: model, make, location, licensePlate
Sort fields: model, make, year, status, pricePerDay, mileage
Backend simulate: Copy filter-employees.ts pattern and adapt for rental cars