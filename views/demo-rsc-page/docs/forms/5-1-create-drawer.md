# How to Construct a Create Drawer (RSC + Server Action)

A repeatable recipe for building a **URL-driven create drawer** like the demo RSC “Add car” flow.

Companion mental model: `5-server-forms.md`.  
Drawer shell / URL contract: `2-drawer-system.md` (`platform/url-kit/url-drawer`).

---

## 🎯 Goal

```text
openCreate(drawerKey)
  → mode=create in URL
  → sticky header (Save / Reset) outside the scrolling form
  → client form (RHF + Zod UX)
  → Server Action (authoritative Zod)
  → toast + close() on success
```

Server validation is the source of truth. Client Zod / RHF is UX only.

---

## 🧱 Pieces to Build

| Layer | Responsibility | Demo location |
|---|---|---|
| Schema | Shared Zod contract + defaults + row mapper | `entities/cars-rsc/validation/rental-car-create-form-schema.ts` |
| Server Action | `safeParse` → persist (or stub) → result union | `entities/cars-rsc/actions/create-rental-car-action.ts` |
| Drawer branch | `mode=create` → create content | `ui/drawer/car-drawer-orchestrator.tsx` |
| Composition shell | `formId` + `useTransition` + header + form | `ui/drawer/modes/create/create-content.tsx` |
| Sticky header | Submit/reset via `form={formId}` | `ui/drawer/chrome/sticky-header.tsx` → `RscCarDrawerCreateHeader` |
| Client form | Fields, submit pipeline, toasts, `close()` | `ui/drawer/forms/create-form.tsx` |

---

## 1. Schema contract (entity)

One Zod schema shared by RHF (`zodResolver`) and the Server Action.

```ts
// entities/.../validation/<entity>-create-form-schema.ts
export const rentalCarFormSchema = z.object({ /* fields */ })
export type RentalCarFormValues = z.infer<typeof rentalCarFormSchema>

export function defaultRentalCarFormValues(): RentalCarFormValues { ... }
export function rentalCarFormValuesToTableItem(values): RentalCarTableItem { ... }
```

Rules:

- Do **not** duplicate the schema in the view
- Action assigns `id` (e.g. `randomUUID`) — client `id` is not trusted
- Keep mappers next to the schema so create/edit stay aligned later

---

## 2. Server Action (entity)

```ts
'use server'

export async function createRentalCarAction(
  data: unknown
): Promise<CreateRentalCarActionResult> {
  const parsed = rentalCarFormSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  try {
    const id = randomUUID()
    const row = rentalCarFormValuesToTableItem({ ...parsed.data, id })

    // When DB exists:
    // await db.insert(...)
    // revalidatePath('/demo-rsc-page')

    return {
      success: true,
      id: row.id,
      model: row.model,
      make: row.make,
      color: row.color,
      year: row.year,
    }
  } catch (e) {
    return {
      success: false,
      formError: e instanceof Error ? e.message : 'Something went wrong.',
    }
  }
}
```

Result union (what the client branches on):

| Shape | Client behavior |
|---|---|
| `{ success: true, id, model, make, color, year }` | Success toast → `close()` |
| `{ success: false, error: flatten }` | `setError` per field + optional form errors |
| `{ success: false, formError }` | Hard-error toast (non-field) |

👉 Return a **small success payload for toasts**, not the full row, unless UX needs it.

---

## 3. Open the drawer (URL)

```ts
const { openCreate } = useDrawerActions()
openCreate('car') // → ?drawer=car&mode=create
```

`parseDrawerState` opens create without an `id`. Branch in the RSC/client drawer body:

```ts
if (state.mode === 'create') {
  return <RscCarDrawerCreateContent />
}
```

---

## 4. Composition shell (view)

Keep the create shell **thin**: transition + `formId` + header + form. No field logic here.

```tsx
const RSC_CAR_CREATE_FORM_ID = 'rsc-car-create-form'

export default function RscCarDrawerCreateContent() {
  const [isPending, startTransition] = useTransition()
  const resetFormRef = useRef<(() => void) | null>(null)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <RscCarDrawerCreateHeader
        formId={RSC_CAR_CREATE_FORM_ID}
        isSubmitting={isPending}
        onResetForm={() => resetFormRef.current?.()}
      />
      <RscCarCreateFormClient
        formId={RSC_CAR_CREATE_FORM_ID}
        startTransition={startTransition}
        onRegisterActions={({ resetForm }) => {
          resetFormRef.current = resetForm
        }}
      />
    </div>
  )
}
```

Why:

- Header Save can sit **outside** the scrolling `<form>` via HTML `form={formId}`
- One `useTransition` drives both header `isPending` and action submit
- Reset uses RHF `reset` (native `type="reset"` does not sync controlled fields)

---

## 5. Sticky header ↔ form association

```tsx
<button type="submit" form={formId} disabled={isSubmitting}>Save</button>
<button type="button" onClick={onResetForm} disabled={isSubmitting}>Reset</button>
```

```tsx
<form id={formId} onSubmit={handleSubmit(onValid, onInvalid)}>...</form>
```

---

## 6. Client form submit pipeline

```ts
startTransition(() => {
  void (async () => {
    const res = await createRentalCarAction(values)

    if (res.success) {
      showSuccess(/* id, make, model, color, year */)
      close() // useDrawerActions — clears URL drawer params
      return
    }

    if ('formError' in res && res.formError) {
      showError(res.formError)
      return
    }

    if ('error' in res && res.error) {
      applyServerFieldErrors(res.error.fieldErrors, setError)
      // optional: toast formErrors
    }
  })()
})
```

Rules:

- Call the action with a **plain object** from RHF (not only `FormData`) — still `safeParse` on the server
- Guard double submit with `isPending` / disabled Save
- On client validation failure, toast consolidated field messages (UX); server still re-validates

---

## 7. Persistence & revalidation

Today (demo):

- Persistence insert is **commented out** until a DB/repository exists
- Success still returns toast fields so UX can be exercised
- Optional demo failure simulation can sit after Zod passes (remove for production)

When DB exists:

```ts
await db.insert(...)
revalidatePath('/your-page')
// or revalidateTag(...) if loaders use tagged unstable_cache
```

👉 List/facet caches must be invalidated the same way the page loads data — otherwise create succeeds but the table looks stale.

---

## ✅ Checklist (new entity)

1. [ ] Zod schema + defaults + mapper in `entities/<entity>/validation`
2. [ ] Server Action with discriminated result in `entities/<entity>/actions`
3. [ ] `openCreate(drawerKey)` from a button / toolbar
4. [ ] Drawer content branches on `mode=create`
5. [ ] Shell: shared `formId` + `useTransition` + create header + form client
6. [ ] Header Save uses `type="submit" form={formId}`; Reset uses RHF reset
7. [ ] Submit maps success / `formError` / `fieldErrors`; success calls `close()`
8. [ ] Wire `revalidatePath` / tags when persistence is real

---

## Key Learnings

- **Construct create as layers** — schema → action → URL open → shell → header/form — not one mega component.
- **Server Action owns truth** — client Zod is optional UX; always `safeParse` on the server.
- **Shell stays dumb** — composition + transition + `formId`; fields live in the form client.
- **Associate remote submit** — sticky Save outside the scroll region via `form={formId}`.
- **Return toast-sized success** — `id` + display fields; close the drawer via URL (`close()`).
- **Revalidate when you persist** — without path/tag revalidation, RSC list islands stay stale.
