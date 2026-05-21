Recommended plan (create drawer, in order)

# Schema contract (server + client)

Import from lib/validation/rental-car-create-form-schema.ts in the new client form (stop duplicating the client-page schema for RSC if you want a single source).
Add a clear create input story: e.g. rentalCarCreateInputSchema = rentalCarFormSchema.omit({ id: true }) (or id optional) and in the action merge id: newId after parse, then rentalCarFormValuesToTableItem (or build the row directly).

# createCarAction (Server Action)

safeParse the payload (objects from RHF are fine; avoid trusting shape).
On failure: return { error: parsed.error.flatten() } as in the doc.
On success: append row to your persistence layer, then revalidatePath for /demo-rsc-page (you use React cache() for loaders; path revalidation is the straightforward lever unless you add unstable_cache + tags).
Return { success: true } (and optionally { id } if useful for UX).

# Persistence for the demo

Introduce a small server-only module (e.g. “append to array” or replace with DB later). Today rentalCars is static — you’ll need either a mutable store (document caveats: dev-only / loses on restart) or redirect to a real DB — otherwise create won’t show after refresh.

# CarFormClient (new client module under demo-rsc-page)

Port field UI from car-add-slider-form.tsx (or extract a shared RentalCarFormFields used by client demo + RSC to avoid drift).
Keep: RHF, zodResolver, same Controllers/inputs, formatFieldErrors + toast on client validation (optional: also toast on server hard errors if the action returns a non-field formError).
On submit: startTransition(async () => { const res = await createCarAction(values); … }); map fieldErrors with setError per the doc; on success → toast success + close() from useDrawerActions (URL as source of truth).
Accept isPending from useTransition for disabled inputs / Save label.

# Header + form wiring (per doc)

Define a stable formId (e.g. car-create-form) in the create drawer composition.
Extend RscCarDrawerCreateHeader to accept optional formId and render type="submit" / type="reset" buttons with form={formId}, matching 5. server-forms.md §Steps 2 & HTML comment (287–285).
RscCarDrawerCreateContent: composition only — header + <CarFormClient formId={…} submitAction={createCarAction} /> (no business logic in the shell).

# Edge cases

Double submit: guard with isPending + disabled Save (like client isSubmitting).
Filter options / table: after create, revalidation should refetch; if filter facet counts are cached separately, revalidate the same path or any shared tags you add.
Future (out of scope for “create only”)

Edit drawer: rental-car-edit-form-schema.ts + smaller form.
Optional: extract shared form UI to a feature package to share with demo-client-page without copy-paste.


# just some confirmations:
- these are out schemas features\demo-rsc-page\lib\validation
- place car create action in a new file with proper naming
- return success, id, and model, make, color, year for toast
- do not append, keep it commented out until DB is implemented, also i do not mind losing after restart
- Port field UI from car-add-slider-form.tsx, also toast on server hard errors if the action returns a non-field formError