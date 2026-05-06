# Table cells + outside handler (`columnActions`)

How to add an interactive column (e.g. checkbox) that **renders inside the table config** but **runs logic in the page/container** (mutations, toasts, navigation) without coupling the wrapper to your domain.

## Idea in one sentence

- **`cellRenderer(value, item, columnAction)`** — the third argument is looked up from **`columnActions[column.key]`** on `FilteringWrapper` and passed by the virtualized row.
- Your **table config** only defines UI + “call `columnAction` when the user acts.”
- Your **feature component** passes **`columnActions={{ [columnKey]: handler }}`** and owns API / TanStack / optimistic updates.

## Wiring (three layers)

| Layer | Responsibility |
|--------|-----------------|
| **`FilteringWrapper`** | Prop: `columnActions?: Record<string, (item: T, value: unknown) => void \| Promise<void>>`. Keys must match column **`key`**. Declared in `features/filtering-wrapper-multi-display-clean/filtering-wrapper.tsx`. |
| **Row / cell** | For each column: `const fn = columnActions?.[column.key]` then `column.cellRenderer?.(value, item, fn)`. See `features/filtering-wrapper-multi-display-clean/features/virtualized-table/components/rows/table-row.tsx` (and list/subheadings `table-row.tsx` if you use those views). |
| **Your config + page** | Column defines `cellRenderer`; page passes `columnActions`. |

## Add a new column (checklist)

### 1. Column `key`

Pick a stable string, e.g. `published`, `pinned`. You will use the **same** string in `columnActions`.

### 2. Table config — `cellRenderer` signature

Use the **three-argument** shape so the row can inject the handler:

```ts
cellRenderer: (
  value: YourValueType,
  item?: YourRowType,
  columnAction?: (item: YourRowType, value: unknown) => void | Promise<void>
): React.ReactElement | null => {
  // Derive UI from `value` and `item`
  return (
    /* e.g. Checkbox, Switch, icon button */
    <Checkbox
      checked={/* from value/item */}
      onCheckedChange={async (checked) => {
        if (item && columnAction) {
          await columnAction(item, checked)
        }
      }}
      onClick={(e) => e.stopPropagation()} // avoid firing row `onRowClick`
    />
  )
}
```

**Important:** Always guard with `if (item && columnAction)` so the cell still renders when no handler is passed (tests, storybook, another page reusing columns).

**Example in repo:** `features/admin-panel/default-tasks/config/tasks-table-config.ts` — `status` column (`cellRenderer` + `Checkbox`).

### 3. Page / container — handler + `columnActions`

Define a handler that receives **`(item, value)`** — `value` is whatever your cell passes (boolean for checkbox, string for select, etc.):

```tsx
const handlePublishedChange = (item: TaskType, checked: boolean) => {
  publishedMutation.mutate({ id: item.id, published: checked })
}

<FilteringWrapper<TaskType>
  data={rows}
  columns={columns}
  columnActions={{
    status: handleStatusChange,
    published: handlePublishedChange, // key === column.key
  }}
/>
```

**Example in repo:** `features/admin-panel/default-tasks/components/phase-tasks-content.tsx` — `columnActions={{ status: handleStatusChange }}` with `handleStatusChange` calling `useUpdateTaskStatus().mutate(...)`.

### 4. Mutations / cache (optional)

Keep side effects in **hooks** (`useMutation` with `onMutate` / `onError` rollback / `onSuccess` cache updates), not inside the table config file. Example: `features/admin-panel/default-tasks/api/useUpdateTaskStatus.ts`.

## Pitfalls

1. **Key mismatch** — `columnActions.foo` does nothing if the column `key` is `Foo` or `status` vs `taskStatus`. Keys are case-sensitive and must match exactly.
2. **Row click** — interactive cells should `stopPropagation` on click (or pointer) so `onRowClick` does not open a drawer when toggling a checkbox.
3. **Async** — `cellRenderer` may use `async` `onCheckedChange`; the handler type allows `Promise<void>`.
4. **Reused columns** — if the same column config is used on a page **without** `columnActions`, the control should still render; handler is simply no-op until you pass it.

## Longer reference

More examples (buttons, patterns, troubleshooting) live in:

`features/filtering-wrapper-multi-display-clean/documentation/table-documentation/features/column-actions-feature.md`
