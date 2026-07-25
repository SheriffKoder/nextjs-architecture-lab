# Reset the mental model

RSC is NOT a replacement for:

- ❌ forms
- ❌ validation
- ❌ client interactivity

RSC replaces:

- ✔ data fetching layer
- ✔ server-side mutations (via Server Actions)

## 2. RSC / Server-first (new model)

```text
Client Form (minimal JS)
      ↓
Server Action (form action)
      ↓
DB update
      ↓
revalidatePath / revalidateTag
```

- ✔ simpler data flow
- ✔ secure by default
- ✔ no API layer needed
- ❌ less instant UX (unless enhanced)

## What CAN be used in RSC forms

### 1. Zod

Instead of:

```text
zod → client validation
```

Do:

```text
zod → server validation (authoritative)
```

#### Example

```ts
// server action
export async function createCarAction(formData: FormData) {
  const parsed = carSchema.safeParse({
    name: formData.get('name'),
    price: Number(formData.get('price')),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  // save to DB
}
```

- ✔ more secure
- ✔ no trust on client

### ✅ 2. React Hook Form (YES — but optional)

It can still be used:

- for UX
- for client validation
- for controlled inputs

BUT:

it becomes a UX enhancement, not the source of truth

### ✅ 3. Server Actions (core of RSC forms)

This replaces:

API routes + mutations

#### Example

```tsx
<form action={createCarAction}>
  <input name="name" />
  <button type="submit">Save</button>
</form>
```

### ✅ 4. Cache invalidation (RSC way)

Instead of:

```ts
queryClient.invalidateQueries()
```

Do:

```ts
revalidatePath('/cars') or revalidateTag('cars')
```

### ⚠️ 5. Optimistic updates

❌ Not built-in like TanStack

But this works:

```ts
const [optimisticState, addOptimistic] = useOptimistic()
```

👉 still immature compared to TanStack

## 🧠 So what changes architecturally?

### In TanStack

```text
Form → mutation → cache update
```

### In RSC

```text
Form → server action → revalidate → re-fetch
```

## ⚖️ Tradeoff (important)

| Feature | RSC Forms | TanStack Forms |
|---|---|---|
| Security | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Simplicity | ⭐⭐⭐⭐ | ⭐⭐ |
| UX responsiveness | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Optimistic updates | ⭐ | ⭐⭐⭐⭐⭐ |
| Validation | Server-first | Client-first |

---

## 🧠 In a drawer system

Already in place:

```text
DrawerWrapper (client)
DrawerContent (dynamic)
```

So a form strategy should be:

### 🚀 Recommended Hybrid Pattern

#### Inside Drawer (Client Component)

Use:

- react-hook-form (UX)
- zod (shared schema)

On submit:

```ts
startTransition(() => {
  formRef.submit() // or call server action
})
```

#### Server Action

```ts
export async function createCar(data) {
  validate with zod
  write to DB
  revalidateTag('cars')
}
```

### Result

- ✔ instant UI interaction (client)
- ✔ secure validation (server)
- ✔ RSC refresh for truth

---

## 🧠 Important insight (this is the key)

Don’t choose: RSC vs TanStack

Choose: WHERE does truth live?

### In RSC-first apps

```text
Truth = server
Client = UX layer
```

### In TanStack apps

```text
Truth = client cache (temporarily)
Server = sync target
```

### Use RSC forms when

- simple CRUD
- no heavy interactivity
- internal tools (a typical case 👈)

```text
RSC for data + Server Actions for mutations
+ light client forms (react-hook-form)
```

### Use TanStack forms when

- complex workflows
- optimistic UX matters
- real-time feeling needed

---

Build this properly so:

- RSC today ✅
- Optimistic UX ✅
- TanStack later ✅ (without rewrite)

## 🧱 Target Architecture (Unified)

```text
Drawer (RSC)
  ↓
DrawerContent (RSC decides mode)
  ↓
FormContainer (CLIENT)
  ↓
FormUI (pure UI + react-hook-form)
  ↓
SubmitAdapter (RSC action OR TanStack mutation)
```

---

## Steps

### 1. 🧠 RSC Create Content = composition only

```tsx
// RscCarDrawerCreateContent.tsx (RSC)

import { createCarAction } from '../actions/create-car-action'
import CarFormClient from './car-form-client'

export default function RscCarDrawerCreateContent() {
  return (
    <>
      <RscCarDrawerEditHeader />

      <CarFormClient
        mode="create"
        submitAction={createCarAction}
      />
    </>
  )
}
```

👉 IMPORTANT:

- No form logic here
- No hooks
- Just wiring

### 2. 🧩 Client Form Container (THIS is the key layer)

```tsx
'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export default function CarFormClient({
  mode,
  submitAction,
}: {
  mode: 'create' | 'edit'
  submitAction: (data: any) => Promise<any>
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    resolver: zodResolver(rentalCarFormSchema),
    defaultValues: defaultRentalCarFormValues(),
  })

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const res = await submitAction(values)

      if (res?.error) {
        // map server errors to RHF
        Object.entries(res.error.fieldErrors).forEach(([key, value]) => {
          form.setError(key as any, { message: value?.[0] })
        })
        return
      }

      // success UX
      // toast / close drawer (via URL)
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* inputs */}
    </form>
  )
}
```

but for the current case content having header buttons + form

Native HTML Form + form attribute

HTML allows buttons outside the form to submit it:

```tsx
<button type="submit" form="form-id">
```

then in header

```tsx
<button type="submit" form={formId}>
  Save
</button>

<button type="reset" form={formId}>
  Reset
</button>
```

RSC Wrapper

```tsx
export default function RscCarDrawerCreateContent() {
  const formId = 'car-create-form'

  return (
    <>
      <RscCarDrawerHeader formId={formId} />

      <CarFormClient formId={formId} />
    </>
  )
}
```

### 🧠 Why this is the MOST important piece

This component:

- ✔ works with Server Actions today
- ✔ will work with TanStack tomorrow
- ✔ keeps react-hook-form (UX)
- ✔ supports optimistic UX (via useTransition)

### 3. ⚙️ Server Action (RSC mutation layer)

```ts
'use server'

import { revalidateTag } from 'next/cache'

export async function createCarAction(data: any) {
  const parsed = rentalCarFormSchema.safeParse(data)

  if (!parsed.success) {
    return {
      error: parsed.error.flatten(),
    }
  }

  await db.insert(parsed.data)

  revalidateTag('cars')

  return { success: true }
}
```

### 🔁 4. Future: Swap to TanStack (NO rewrite)

Later, replace ONLY this:

```tsx
<CarFormClient submitAction={createCarAction} />
```

with:

```tsx
<CarFormClient submitAction={mutateAsync} />
```

Where:

```ts
const mutation = useCreateCar()
```

💡 That’s it. Same form. Same UI.

### 5. ⚡ Optional: Optimistic UX (RSC style)

Inside CarFormClient:

```ts
startTransition(async () => {
  optimisticAdd(values) // local UI update (optional)

  const res = await submitAction(values)
})
```

👉 not as powerful as TanStack, but good enough

## 🧠 What this achieves

| Concern | Solved |
|---|---|
| RSC compatibility | ✅ |
| Client UX (react-hook-form) | ✅ |
| Server validation (Zod) | ✅ |
| Optimistic UI | ✅ |
| Future TanStack migration | ✅ |
| No duplication | ✅ |

## 🧠 Final Mental Model

```text
RSC decides WHAT to render
Client handles HOW user interacts
Server validates and persists
```

### 🔥 With Server Actions

```tsx
<form id="car-form" action={serverAction}>
```

Header:

```tsx
<button type="submit" form="car-form">
```

✔ no JS needed even

### 🔥 With react-hook-form

```tsx
<form id="car-form" onSubmit={handleSubmit(onSubmit)}>
```

✔ still works

### 🔥 With TanStack later

No change.

---

## Key Learnings

- **RSC is not the form layer** — It replaces data fetching and mutations (Server Actions), not forms, validation, or client interactivity.
- **Server Zod is authoritative** — Client Zod / react-hook-form is UX only, not the source of truth.
- **Truth location is the real choice** — RSC-first: truth on the server; TanStack: temporary truth in the client cache.
- **Hybrid drawer forms** — Client form (RHF + shared Zod) submits into a Server Action, then revalidate refreshes RSC truth.
- **Form container is the swap point** — Same UI can call a Server Action today and a TanStack mutation later without a rewrite.
- **Remote submit via `form={formId}`** — Header Save/Reset can sit outside the scrolling form using the native HTML form attribute.
- **Unified stack** — RSC decides what to render; client handles how the user interacts; server validates and persists.
