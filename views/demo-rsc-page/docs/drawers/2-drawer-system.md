# 📂 url-drawer — URL-Driven Drawer System

## 🧠 What It Is

`url-drawer` is a **params-based drawer system** in `platform/url-kit/url-drawer`.

URL is the source of truth for:

- which drawer is open (`drawer`)
- what mode it is in (`mode`)
- which entity (`id`)
- optional secondary action (`action`)

No Zustand / global store for open state. `useDrawerActions` is the imperative API (like store methods), but it only rewrites search params.

Works with **RSC + client**: the shell is client; drawer body can stay a server component fed by page `params`.

---

## 🧱 URL Contract

```text
?drawer=car
&mode=view | edit | create
&id=123
&action=delete   (optional)
```

| Param | Role |
|---|---|
| `drawer` | Entity / drawer key (e.g. `car`) |
| `mode` | `view` \| `edit` \| `create` |
| `id` | Entity id (required for view/edit open) |
| `action` | Secondary UI (today: `delete` confirm modal) |

---

## 🧠 State Model

```ts
type DrawerState = {
  drawer: string | null
  mode: 'view' | 'edit' | 'create'
  id: string | null
  action: 'delete' | null
  isOpen: boolean
}
```

`isOpen` rules (`parseDrawerState`):

- `mode=create` → open (no `id` needed)
- `mode=view` or `mode=edit` **and** `id` → open
- `mode` omitted → drawer shell stays **closed** (allows `drawer` + `id` + `action=delete` for row-delete confirm without mounting drawer content)

Invalid Zod parse → closed safe default.

---

## 🧩 Architecture

```text
URL (search params)
        ↓
Zod schema (drawer-schema.ts)
        ↓
parseDrawerState (drawer-parser.ts)
        ↓
DrawerWrapper / DeleteActionModal / RSC content
        ↑
useDrawerActions (URL transitions)
```

---

## 📁 Package Surface

Location: `platform/url-kit/url-drawer/`

| Piece | File | Role |
|---|---|---|
| Schema | `drawer-schema.ts` | Zod contract + `DrawerState` type |
| Parser | `drawer-parser.ts` | `normalizeRawSearchParams` + `parseDrawerState` |
| Actions | `hooks/use-drawer-actions.ts` | `openCreate` / `openView` / `openEdit` / `close` / delete helpers |
| Shell | `components/drawer-wrapper.tsx` | Client `RightDrawer` gated by `isOpen` |
| Delete UI | `components/delete-action-modal.tsx` | Confirm when `action=delete` + `id` |
| Chrome | `providers/drawer-chrome-context.tsx` | Journey / full-width UI state (not URL) |
| Barrel | `index.ts` | Public exports |

Import from:

```ts
import {
  DrawerWrapper,
  DeleteActionModal,
  useDrawerActions,
  parseDrawerState,
  useDrawerChrome,
} from '@/platform/url-kit/url-drawer'
```

---

## 🔧 `useDrawerActions`

Client hook. Patches only drawer-related keys via `router.replace(..., { scroll: false })`.

| Method | URL effect |
|---|---|
| `openCreate(drawer)` | `drawer`, `mode=create`; clears `id`, `action` |
| `openView(drawer, id)` | `drawer`, `mode=view`, `id`; clears `action` (wrapped in `wrapNavigation` when transition root is present) |
| `openEdit(drawer, id)` | `drawer`, `mode=edit`, `id`; clears `action` |
| `close()` | Removes `drawer`, `mode`, `id`, `action` |
| `triggerDelete()` | Sets `action=delete` (keeps drawer/mode/id) |
| `openRowDeleteConfirm(drawer, id)` | Sets `drawer`, `id`, `action=delete` **without** writing `mode` (drawer can stay closed) |
| `cancelAction()` | Clears `action` only |

👉 Same role as a global store API, but shareable / back-button friendly because state lives in the URL.

---

## 🧱 `DrawerWrapper`

Client gate around `RightDrawer`:

1. Reads `useSearchParams()` → `parseDrawerState`
2. Keeps the shell mounted so exit animation can finish (`isOpen` drives visibility)
3. `onClose` → reset chrome + `close()`
4. When open, provides `DrawerChromeProvider` so children can call `useDrawerChrome()` (e.g. journey expand → `expandToFullScreen`)

Children are whatever the page composes (often an RSC body).

---

## 🔗 Demo RSC Wiring

```text
demo-rsc-index
  → DemoRscDrawerLayer(params)
       → DrawerWrapper (client shell)
            → CarDrawerOrchestrator(params)  // server: create / view / edit
       → CarDrawerDeleteModal (client island)
```

- Page passes normalized `params` so content can `parseDrawerState(params)` without `useSearchParams`
- Drawer key: `DEMO_RSC_CAR_DRAWER_KEY = 'car'`
- View mode Suspense-loads by id (`getRentalCarByIdAction`) — see `6-row-fetch` / `6-2-rsc-bottleneck-by-id-prefetch`
- Drawer URL keys are UI-only for list/facet cache — see `6-1-rsc-bottleneck-drawer-cache`
- Journey / full-width chrome — see `7-drawer-expaned-view`

---

## ✅ Why This Shape

- ✔ Type-safe URL parsing (Zod)
- ✔ Explicit open/close rules in one parser
- ✔ Works in RSC + client
- ✔ No global drawer store required
- ✔ Scales to multiple drawer keys (`drawer=car`, `drawer=…`)
- ✔ Shareable links + back/forward
- ✔ Easy to extend (`action`, modes)

---

## Key Learnings

- **URL is the drawer store** — `drawer` / `mode` / `id` / `action` replace Zustand for open state.
- **Parse once, branch everywhere** — `parseDrawerState` is the single open/close + mode contract for shell, modal, and RSC body.
- **Actions only rewrite URL** — `useDrawerActions` is the imperative API; UI reacts to params.
- **Shell is client; body can be RSC** — `DrawerWrapper` + server children via page `params`.
- **`action` is secondary UI** — e.g. delete confirm can open without mounting the drawer when `mode` is omitted.
- **Chrome context is UI-only** — Journey expand is not in the URL; it resets when the drawer closes.
