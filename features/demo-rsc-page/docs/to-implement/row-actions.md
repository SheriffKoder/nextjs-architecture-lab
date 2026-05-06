Row click


PhaseTasksContent passes onRowClick={handleRowClick} into FilteringWrapper, which ends up on each row’s main strip. In the virtualized table row component, that strip has onClick={handleRowClick}, so any click that bubbles from a cell will open the drawer unless something stops it.

Lines 389-401

        style={{
          height: `${baseRowHeight}px`,
          minHeight: `${baseRowHeight}px`,
          minWidth: totalMinWidth,
        }}
        className={`flex items-stretch group ${
          onRowClick ? 'cursor-pointer hover:bg-primary/10 hover:text-primary' : ''
        } ${isLastRow ? 'border-b border-primary/10' : 'border-b border-primary/10'} ${
          isSelected ? 'bg-primary/50' : ''
        } ${rowStylingClasses ? rowStylingClasses : '0'}`}

table-row.tsx
Status (checkbox)
      <div

        ...

        onClick={handleRowClick}
    cellRenderer: (value, item?: TaskType, columnAction?: (item: TaskType, value: any) => void | Promise<void>): React.ReactElement | null => {
      // Check if status is active (checked) or inactive (unchecked)
      const isChecked = value === TaskStatusEnum.ACTIVE;
      
      return React.createElement('div', {
        className: 'flex items-center justify-center px-4 w-full h-full'
      }, React.createElement(Checkbox, {
        checked: isChecked,
        onCheckedChange: async (checked: boolean) => {
          if (item && columnAction) {
            await columnAction(item, checked);
          }
        },
      >


      }));
    },
The actual mutation comes from columnActions={{ status: handleStatusChange }} in phase-tasks-content.tsx, which is passed through as columnAction into that renderer.
tasks-table-config.ts
Delete (actions column)
The actions column is special-cased in table-row.tsx: it doesn’t use the generic cell path; it renders ActionButton with configs from actionConfigs in tasks-table-config.ts (wired via onActionClick / actionConfigs prop in phase-tasks-content.tsx).
Lines 235-253
Delete doesn’t stop propagation on the cell wrapper, but ActionButton calls e.stopPropagation() on each action button before running onClick:
      ...

        onClick: (e: React.MouseEvent) => {
Lines 52-60
  const handleClick = (e: React.MouseEvent, actionKey: string) => {
    // Prevent event bubbling to avoid triggering row click
    e.stopPropagation();
    
    // Find and call the specific action
    const action = actions.find(a => a.key === actionKey);
    if (action) {
      action.onClick(e);
So: status = column config + checkbox onClick → stopPropagation; delete = dedicated actions column + ActionButton handleClick → stopPropagation before the delete handler runs.


1. **Actions column** (`key: 'actions'`) — special-cased in `table-row.tsx`: renders `ActionButton` with configs from `demo-rsc-row-action-configs.ts`. **`actionMode: 'dropdown'`** in `table-config.ts` → kebab / “more” menu with **View** and **Edit**. Each menu item still calls `handleClick` → **stopPropagation** before `onActionClick`.



2. **Delete column** (`key: 'delete'`) — **table only** (included in `tableColumns` in `columns.ts`). Uses `cellRenderer`: centered **Trash2** button (same layout idea as checkbox: `flex items-center justify-center`), **`stopPropagation`** on the cell wrapper and on the button **before** invoking **`columnActions.delete`**. Wired in `demo-rsc-content.tsx` as:



```ts

columnActions={{ delete: (item) => handleDeleteColumnAction(item) }}

```



which calls `openRowDeleteConfirm` (URL `action=delete` flow).



**Table-only visibility:** `demo-rsc-content.tsx` maps columns so `delete` sets `isHidden: true` when URL `view` is anything other than the default table (`view` absent or `view=table`). Other layouts (list, kanban, …) omit the column.



3. **Row strip click** still opens **view** drawer (`handleRowClick` → `openView`), consistent with viewing details when clicking the row body.





rows-action-buttons.tsx



`handleClick` stops propagation before running the selected action so dropdown / inline actions never trigger row navigation.





References



- `features/demo-rsc-page/config/columns.ts` — `actions` + `delete` column defs  

- `features/demo-rsc-page/config/demo-rsc-row-action-configs.ts` — View / Edit dropdown entries  

- `features/demo-rsc-page/demo-rsc-content.tsx` — `onActionClick`, `columnActions.delete`  

- `features/demo-rsc-page/config/displays/table-config.ts` — `actionMode: 'dropdown'`

