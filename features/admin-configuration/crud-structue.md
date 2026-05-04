

## Types (configs.types.ts)

import { LucideIcon } from "lucide-react"

export type ConfigItem = {
  id: string
  label: string
}

export type ConfigGroup = {
  id: string
  key: string
  name: string
  icon: LucideIcon
  items: ConfigItem[]
}

export type ConfigState = {
  entities: Record<string, ConfigGroup>
  loading: boolean
  error?: string
}

- entities keyed by config.key
- Items stay nested (fine unless you need cross-config queries)

## UI becomes something like this
{Object.values(configs).map(config => (
  <Dropdown key={config.key}>
    {config.items.map(item => (
      <ItemRow
        key={item.id}
        label={item.label}
        onEdit={value => editItem(config.key, item.id, value)}
        onDelete={() => deleteItem(config.key, item.id)}
      />
    ))}

    <AddButton onClick={() => addItem(config.key, "New item")} />
  </Dropdown>
))}

## need two states: No temp IDs. No rollbacks. No per-item thunks.
{
  persisted: ConfigState   // last known server truth
  draft: ConfigState       // what user is editing
}


## Redux state shape (clean & obvious)
type ConfigState = {
  entities: Record<string, ConfigGroup>
}

type ConfigSliceState = {
  persisted: ConfigState        // undo source
  draft: ConfigState            // drives the UI
  isDirty: boolean              // controls Save / Undo buttons
}

## Slice (very small, very readable)
const initialState: ConfigSliceState = {
  persisted: { entities: {} },
  draft: { entities: {} },
  isDirty: false
}

const configsSlice = createSlice({
  name: "configs",
  initialState,
  reducers: {
    loadFromServer(state, action: PayloadAction<ConfigState>) {
      state.persisted = action.payload
      state.draft = structuredClone(action.payload)
      state.isDirty = false
    },

    addItem(
      state,
      action: PayloadAction<{ configKey: string; label: string }>
    ) {
      state.draft.entities[action.payload.configKey].items.push({
        id: crypto.randomUUID(),
        label: action.payload.label
      })
      state.isDirty = true
    },

    editItem(
      state,
      action: PayloadAction<{
        configKey: string
        itemId: string
        label: string
      }>
    ) {
      const item =
        state.draft.entities[action.payload.configKey].items.find(
          i => i.id === action.payload.itemId
        )
      if (item) item.label = action.payload.label
      state.isDirty = true
    },

    deleteItem(
      state,
      action: PayloadAction<{ configKey: string; itemId: string }>
    ) {
      state.draft.entities[action.payload.configKey].items =
        state.draft.entities[action.payload.configKey].items.filter(
          i => i.id !== action.payload.itemId
        )
      state.isDirty = true
    },

    undoChanges(state) {
      state.draft = structuredClone(state.persisted)
      state.isDirty = false
    }
  }
})

## Save / Confirm (single backend call) Backend API = one endpoint: PATCH /configs
export const saveConfigs =
  (): AppThunk =>
  async (dispatch, getState) => {
    const { draft } = getState().configs

    await configsApi.saveAll(draft)

    dispatch(loadFromServer(draft))
  }

## UI logic becomes trivial
const isDirty = useSelector(selectIsDirty)

<Button disabled={!isDirty} onClick={saveConfigs}>
  Save
</Button>

<Button disabled={!isDirty} onClick={undoChanges}>
  Undo
</Button>