# Frontend Implementation Plan: Admin Configuration CRUD

## Overview
This document outlines the complete frontend implementation for the Admin Configuration feature with optimistic updates, Redux state management, and CRUD operations.

## File Structure
```
features/admin-configuration/
├── index.tsx                          # Main page component (updated)
├── admin-configuration-content.tsx    # Content wrapper (updated)
├── components/
│   ├── action-buttons.tsx            # Apply/Cancel buttons (updated)
│   ├── CollapsibleCard.tsx           # Card component (existing)
│   ├── ConfigItemPill.tsx            # NEW: Individual item pill component
│   └── AddItemButton.tsx             # NEW: Add item button component
├── hooks/
│   └── useConfigurations.ts          # NEW: Hook for fetching/config management
├── store/
│   ├── configSlice.ts                # NEW: Redux slice for config state
│   └── configThunks.ts               # NEW: Async thunks for API calls
└── types/
    └── config.types.ts               # NEW: TypeScript type definitions
```

---

## Step 1: Type Definitions (`types/config.types.ts`)

```typescript
import { LucideIcon } from "lucide-react";

/**
 * Individual configuration item (e.g., "Acme Corp", "John's Construction")
 */
export type ConfigItem = {
  id: string;
  label: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Configuration group (e.g., "Company name", "Contractor name")
 */
export type ConfigGroup = {
  id: string;
  key: string; // Unique identifier: 'company_name', 'contractor_name', etc.
  name: string; // Display name: 'Company name', 'Contractor name', etc.
  icon: LucideIcon;
  items: ConfigItem[];
};

/**
 * Complete configuration state structure
 */
export type ConfigState = {
  entities: Record<string, ConfigGroup>; // Keyed by config.key
};

/**
 * Redux slice state with persisted and draft states
 */
export type ConfigSliceState = {
  persisted: ConfigState;  // Last known server truth (for undo)
  draft: ConfigState;       // Current user edits (drives UI)
  isDirty: boolean;        // Controls Apply/Cancel button states
  isLoading: boolean;      // Loading state for API calls
  error: string | null;    // Error message if any
};

/**
 * API response structure
 */
export type ConfigsApiResponse = {
  configs: ConfigGroup[];
};

/**
 * Save request payload
 */
export type SaveConfigsPayload = {
  configs: ConfigGroup[];
};
```

---

## Step 2: Redux Slice (`store/configSlice.ts`)

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConfigSliceState, ConfigState, ConfigGroup } from '../types/config.types';

const initialState: ConfigSliceState = {
  persisted: { entities: {} },
  draft: { entities: {} },
  isDirty: false,
  isLoading: false,
  error: null,
};

const configSlice = createSlice({
  name: 'configs',
  initialState,
  reducers: {
    /**
     * Load configuration data from server
     * Called after successful fetch or after save
     */
    loadFromServer(state, action: PayloadAction<ConfigState>) {
      state.persisted = action.payload;
      state.draft = structuredClone(action.payload);
      state.isDirty = false;
      state.error = null;
    },

    /**
     * Add a new item to a configuration group
     */
    addItem(
      state,
      action: PayloadAction<{ configKey: string; label: string }>
    ) {
      const group = state.draft.entities[action.payload.configKey];
      if (group) {
        group.items.push({
          id: crypto.randomUUID(),
          label: action.payload.label,
        });
        state.isDirty = true;
        state.error = null;
      }
    },

    /**
     * Edit an existing item's label
     */
    editItem(
      state,
      action: PayloadAction<{
        configKey: string;
        itemId: string;
        label: string;
      }>
    ) {
      const group = state.draft.entities[action.payload.configKey];
      if (group) {
        const item = group.items.find((i) => i.id === action.payload.itemId);
        if (item) {
          item.label = action.payload.label;
          state.isDirty = true;
          state.error = null;
        }
      }
    },

    /**
     * Delete an item from a configuration group
     */
    deleteItem(
      state,
      action: PayloadAction<{ configKey: string; itemId: string }>
    ) {
      const group = state.draft.entities[action.payload.configKey];
      if (group) {
        group.items = group.items.filter(
          (i) => i.id !== action.payload.itemId
        );
        state.isDirty = true;
        state.error = null;
      }
    },

    /**
     * Undo all changes - revert draft to persisted state
     */
    undoChanges(state) {
      state.draft = structuredClone(state.persisted);
      state.isDirty = false;
      state.error = null;
    },

    /**
     * Set loading state
     */
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    /**
     * Set error state
     */
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  loadFromServer,
  addItem,
  editItem,
  deleteItem,
  undoChanges,
  setLoading,
  setError,
} = configSlice.actions;

export default configSlice.reducer;
```

---

## Step 3: Redux Thunks (`store/configThunks.ts`)

```typescript
import { AppDispatch, RootState } from '@/lib/store/store';
import { ConfigState, SaveConfigsPayload } from '../types/config.types';
import {
  loadFromServer,
  setLoading,
  setError,
} from './configSlice';

/**
 * Fetch all configurations from the server
 */
export const fetchConfigs = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // TODO: Replace with actual API call
    const response = await fetch('/api/configs');
    
    if (!response.ok) {
      throw new Error('Failed to fetch configurations');
    }

    const data = await response.json();
    
    // Transform API response to ConfigState format
    const configState: ConfigState = {
      entities: {},
    };

    data.configs.forEach((group: any) => {
      configState.entities[group.key] = group;
    });

    dispatch(loadFromServer(configState));
  } catch (err) {
    dispatch(setError(err instanceof Error ? err.message : 'An error occurred'));
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Save all configuration changes to the server
 * This is the single API call that saves all changes at once
 */
export const saveConfigs = () => async (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  try {
    const { draft } = getState().configs;
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Transform draft state to API payload format
    const payload: SaveConfigsPayload = {
      configs: Object.values(draft.entities),
    };

    // TODO: Replace with actual API call
    const response = await fetch('/api/configs', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save configurations');
    }

    // On success, update persisted state with the saved draft
    dispatch(loadFromServer(draft));
  } catch (err) {
    dispatch(setError(err instanceof Error ? err.message : 'An error occurred'));
  } finally {
    dispatch(setLoading(false));
  }
};
```

---

## Step 4: Update Redux Store (`lib/store/store.ts`)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import configReducer from '@/features/admin-configuration/store/configSlice'; // ADD THIS

export const store = configureStore({
  reducer: {
    user: userReducer,
    role: roleReducer,
    configs: configReducer, // ADD THIS
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Step 5: Custom Hook (`hooks/useConfigurations.ts`)

```typescript
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  addItem,
  editItem,
  deleteItem,
  undoChanges,
} from '../store/configSlice';
import { fetchConfigs, saveConfigs } from '../store/configThunks';
import { ConfigGroup } from '../types/config.types';

export function useConfigurations() {
  const dispatch = useAppDispatch();
  const { draft, persisted, isDirty, isLoading, error } = useAppSelector(
    (state) => state.configs
  );

  // Fetch configurations on mount
  useEffect(() => {
    dispatch(fetchConfigs());
  }, [dispatch]);

  // Get all configuration groups as array
  const configGroups = Object.values(draft.entities) as ConfigGroup[];

  // Get a specific configuration group by key
  const getConfigByKey = (key: string): ConfigGroup | undefined => {
    return draft.entities[key];
  };

  // Add item to a configuration group
  const handleAddItem = (configKey: string, label: string) => {
    dispatch(addItem({ configKey, label }));
  };

  // Edit an item's label
  const handleEditItem = (configKey: string, itemId: string, label: string) => {
    dispatch(editItem({ configKey, itemId, label }));
  };

  // Delete an item
  const handleDeleteItem = (configKey: string, itemId: string) => {
    dispatch(deleteItem({ configKey, itemId }));
  };

  // Undo all changes
  const handleUndo = () => {
    dispatch(undoChanges());
  };

  // Save all changes
  const handleSave = async () => {
    await dispatch(saveConfigs());
  };

  return {
    configGroups,
    getConfigByKey,
    isDirty,
    isLoading,
    error,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleUndo,
    handleSave,
  };
}
```

---

## Step 6: ConfigItemPill Component (`components/ConfigItemPill.tsx`)

```typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { XIcon, Edit2Icon, CheckIcon, X as XCloseIcon } from 'lucide-react';
import { ConfigItem } from '../types/config.types';

interface ConfigItemPillProps {
  item: ConfigItem;
  onDelete: (itemId: string) => void;
  onEdit: (itemId: string, newLabel: string) => void;
}

const ConfigItemPill: React.FC<ConfigItemPillProps> = ({
  item,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(item.label);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== item.label) {
      onEdit(item.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(item.label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="w-fit flex flex-row items-center justify-center gap-1 rounded-full 
        bg-primary/20 text-foreground dark:bg-primary/30 
        pl-3 pr-1 py-1 border border-primary/40 
        transition-all duration-300 ease-in-out">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none text-sm min-w-[80px] max-w-[200px]"
        />
        <button
          onClick={handleSave}
          className="p-1 hover:bg-primary/20 rounded-full transition-colors"
        >
          <CheckIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-primary/20 rounded-full transition-colors"
        >
          <XCloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="w-fit flex flex-row items-center justify-center gap-2 rounded-full 
        bg-tertiary text-background dark:bg-tertiary 
        pl-3 pr-2 py-1 border border-transparent 
        hover:border-primary/20 hover:shadow-md hover:shadow-tertiary/30
        transition-all duration-300 ease-in-out cursor-pointer group"
    >
      <span className="text-sm">{item.label}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className="p-0.5 hover:bg-background/20 rounded transition-colors"
          title="Edit"
        >
          <Edit2Icon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-0.5 hover:bg-background/20 rounded transition-colors"
          title="Delete"
        >
          <XIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ConfigItemPill;
```

---

## Step 7: AddItemButton Component (`components/AddItemButton.tsx`)

```typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, X as XCloseIcon } from 'lucide-react';

interface AddItemButtonProps {
  onAdd: (label: string) => void;
  placeholder?: string;
}

const AddItemButton: React.FC<AddItemButtonProps> = ({
  onAdd,
  placeholder = 'Add new item...',
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isAdding) {
    return (
      <div className="w-fit flex flex-row items-center justify-center gap-1 rounded-full 
        bg-primary/20 text-foreground dark:bg-primary/30 
        pl-3 pr-1 py-1 border border-primary/40 
        transition-all duration-300 ease-in-out">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleAdd}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none text-sm min-w-[120px] max-w-[200px] placeholder:text-foreground/50"
        />
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-primary/20 rounded-full transition-colors"
        >
          <XCloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-fit flex flex-row items-center justify-center gap-2 rounded-full 
        bg-tertiary text-background dark:bg-tertiary 
        px-2 aspect-square border border-transparent 
        hover:border-primary/20 hover:shadow-md hover:shadow-tertiary/30
        transition-all duration-300 ease-in-out cursor-pointer"
      title="Add new item"
    >
      <PlusIcon className="w-4 h-4" />
    </button>
  );
};

export default AddItemButton;
```

---

## Step 8: Update AdminConfigurationContent (`admin-configuration-content.tsx`)

```typescript
'use client';

import React from 'react';
import CollapsibleCard from './components/CollapsibleCard';
import ConfigItemPill from './components/ConfigItemPill';
import AddItemButton from './components/AddItemButton';
import { ChevronDownIcon, LucideIcon } from 'lucide-react';
import { useConfigurations } from './hooks/useConfigurations';
import { ConfigGroup } from './types/config.types';

interface AdminConfigurationContentProps {
  configurationItems: Array<{ name: string; icon: LucideIcon; key: string }>;
}

const AdminConfigurationContent: React.FC<AdminConfigurationContentProps> = ({
  configurationItems,
}) => {
  const {
    getConfigByKey,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
  } = useConfigurations();

  return (
    <div className="p-4 min-h-full flex flex-col gap-4 h-fit">
      {configurationItems.map((configItem) => {
        const configGroup = getConfigByKey(configItem.key);

        if (!configGroup) {
          return null; // Config not loaded yet
        }

        return (
          <CollapsibleCard
            key={configItem.key}
            headerText={configItem.name}
            leftIcon={configItem.icon}
            rightIcon={ChevronDownIcon}
            defaultOpen={false}
          >
            <div className="flex flex-row flex-wrap gap-2">
              {configGroup.items.map((item) => (
                <ConfigItemPill
                  key={item.id}
                  item={item}
                  onDelete={(itemId) => handleDeleteItem(configItem.key, itemId)}
                  onEdit={(itemId, newLabel) =>
                    handleEditItem(configItem.key, itemId, newLabel)
                  }
                />
              ))}

              <AddItemButton
                onAdd={(label) => handleAddItem(configItem.key, label)}
                placeholder={`Add ${configItem.name.toLowerCase()}...`}
              />
            </div>
          </CollapsibleCard>
        );
      })}
    </div>
  );
};

export default AdminConfigurationContent;
```

---

## Step 9: Update index.tsx (`index.tsx`)

```typescript
'use client';

import PageHeader from '@/components/layout/page-header';
import React, { useEffect } from 'react';
import AdminConfigurationContent from './admin-configuration-content';
import ActionButtons from './components/action-buttons';
import {
  Building2,
  Wrench,
  Banknote,
  FileText,
  MapPin,
  User,
  Phone,
  Mail,
  LucideIcon,
} from 'lucide-react';
import { useConfigurations } from './hooks/useConfigurations';

// Configuration items array with keys
const configurationItems: Array<{
  name: string;
  icon: LucideIcon;
  key: string;
}> = [
  { name: 'Company name', icon: Building2, key: 'company_name' },
  { name: 'Contractor name', icon: Wrench, key: 'contractor_name' },
  { name: 'Lender name', icon: Banknote, key: 'lender_name' },
  { name: 'Title company name', icon: FileText, key: 'title_company_name' },
  { name: 'Project name or address', icon: MapPin, key: 'project_name_or_address' },
  { name: 'Realtor name', icon: User, key: 'realtor_name' },
  { name: 'Realtor phone', icon: Phone, key: 'realtor_phone' },
  { name: 'Realtor email', icon: Mail, key: 'realtor_email' },
];

const Index = () => {
  const { isDirty, isLoading, handleSave, handleUndo } = useConfigurations();

  const handleApply = async () => {
    await handleSave();
  };

  const handleCancel = () => {
    handleUndo();
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden relative">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full lg:w-[calc(100%)] flex flex-col md:flex-row gap-4 p-4 border-b border-tertiary/10 items-center justify-between flex-shrink-0 bg-background/20 backdrop-blur-sm z-[50]">
        <PageHeader />
        <ActionButtons
          onApply={handleApply}
          onCancel={handleCancel}
          isDirty={isDirty}
          isLoading={isLoading}
        />
      </header>

      <div className="flex-1 overflow-y-auto flex pb-2 min-w-0 pt-[130px] lg:pt-[100px] w-full">
        {/* Main content */}
        <div className="h-full w-full pr-2 pt-2 min-w-0">
          <AdminConfigurationContent configurationItems={configurationItems} />
        </div>
      </div>
    </div>
  );
};

export default Index;
```

---

## Step 10: Update ActionButtons (`components/action-buttons.tsx`)

```typescript
'use client';

import React from 'react';
import { Check, Undo2 } from 'lucide-react';
import PrimaryButton from '@/components/design/primary-button';

interface ActionButtonsProps {
  onApply: () => void;
  onCancel: () => void;
  isDirty: boolean;
  isLoading: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onApply,
  onCancel,
  isDirty,
  isLoading,
}) => {
  return (
    <div className="flex gap-2">
      <PrimaryButton
        onClick={onCancel}
        disabled={!isDirty || isLoading}
        buttonClassName="bg-primary text-white/90 whitespace-nowrap"
      >
        <Undo2 className="w-4 h-4" />
        Cancel
      </PrimaryButton>

      <PrimaryButton
        onClick={onApply}
        disabled={!isDirty || isLoading}
        buttonClassName="bg-primary text-white/90 whitespace-nowrap"
      >
        <Check className="w-4 h-4" />
        {isLoading ? 'Applying...' : 'Apply'}
      </PrimaryButton>
    </div>
  );
};

export default ActionButtons;
```

---

## Step 11: Mock Data Hook (Temporary - for development)

Create a temporary hook that returns mock data as if it came from an API:

```typescript
// hooks/useMockConfigurations.ts (TEMPORARY - DELETE AFTER API IS READY)
import { ConfigState, ConfigGroup } from '../types/config.types';
import { Building2, Wrench, Banknote, FileText, MapPin, User, Phone, Mail } from 'lucide-react';

export function getMockConfigurations(): ConfigState {
  const mockGroups: ConfigGroup[] = [
    {
      id: '1',
      key: 'company_name',
      name: 'Company name',
      icon: Building2,
      items: [
        { id: '1-1', label: 'Acme Corporation' },
        { id: '1-2', label: 'Tech Solutions Inc' },
      ],
    },
    {
      id: '2',
      key: 'contractor_name',
      name: 'Contractor name',
      icon: Wrench,
      items: [
        { id: '2-1', label: "John's Construction" },
        { id: '2-2', label: 'BuildRight LLC' },
      ],
    },
    // ... add more mock groups
  ];

  const entities: Record<string, ConfigGroup> = {};
  mockGroups.forEach((group) => {
    entities[group.key] = group;
  });

  return { entities };
}
```

Then update `configThunks.ts` to use mock data temporarily:

```typescript
// In fetchConfigs thunk, replace API call with:
import { getMockConfigurations } from '../hooks/useMockConfigurations';

export const fetchConfigs = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // TEMPORARY: Use mock data
    const mockData = getMockConfigurations();
    dispatch(loadFromServer(mockData));

    // TODO: Replace with actual API call
    // const response = await fetch('/api/configs');
    // ...
  } catch (err) {
    // ...
  }
};
```

---

## State Flow Diagram

```
1. Component Mount
   └─> useConfigurations hook
       └─> useEffect triggers fetchConfigs()
           └─> API call (or mock)
               └─> loadFromServer() action
                   └─> Updates both persisted and draft states

2. User Adds/Edits/Deletes Item
   └─> Dispatch addItem/editItem/deleteItem
       └─> Updates draft state only
       └─> Sets isDirty = true

3. User Clicks "Apply"
   └─> saveConfigs() thunk
       └─> API PATCH call with draft state
           └─> On success: loadFromServer(draft)
               └─> Updates persisted = draft
               └─> Sets isDirty = false

4. User Clicks "Cancel"
   └─> undoChanges() action
       └─> draft = structuredClone(persisted)
       └─> Sets isDirty = false
```

---

## Key Implementation Notes

1. **Optimistic Updates**: All CRUD operations update the `draft` state immediately (optimistic). The `persisted` state remains unchanged until "Apply" is clicked.

2. **Single API Call**: All changes are batched and sent in one PATCH request when "Apply" is clicked.

3. **Undo Capability**: "Cancel" reverts `draft` to match `persisted` using `structuredClone` for deep copy.

4. **Type Safety**: All types are defined in `config.types.ts` and used throughout.

5. **Loading States**: `isLoading` is managed in Redux and can be used to show loading indicators.

6. **Error Handling**: Errors are stored in Redux state and can be displayed to the user.

7. **Empty API Requests**: For now, API calls are stubbed with empty implementations. Replace with actual endpoints when backend is ready.

---

## Testing Checklist

- [ ] Add item to a configuration group
- [ ] Edit an existing item's label
- [ ] Delete an item
- [ ] Multiple operations on different groups
- [ ] Click "Apply" - should save and clear isDirty
- [ ] Click "Cancel" - should revert all changes
- [ ] Verify isDirty state updates correctly
- [ ] Verify loading states work
- [ ] Verify error handling works
- [ ] Verify UI updates immediately (optimistic updates)
