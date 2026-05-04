# Filter Options Button Group Visualization

## Button Mode (isDropdown={false})

### Multi-Select Example
```
Department: [ Engineering ] [ Marketing ] [ Sales ] [ HR ]
              ^active         ^active
```

### Single-Select Example
```
Status: [ Active ] [ Inactive ] [ Pending ]
         ^active
```

### Visual Layout
```
┌─────────────────────────────────────────────────────────┐
│ Department:                                              │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Engineering │  │ Marketing   │  │ Sales       │      │
│  │   (12)      │  │   (8)       │  │   (15)      │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│  ^active (bg-tertiary)                                   │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │ HR          │  │ Finance     │                      │
│  │   (5)       │  │   (3)       │                      │
│  └─────────────┘  └─────────────┘                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Active vs Inactive States
```
Active Button:
┌─────────────────┐
│ Engineering (12)│  bg-tertiary, text-background
└─────────────────┘

Inactive Button:
┌─────────────────┐
│ Marketing (8)   │  bg-muted, text-foreground, hover:bg-muted/80
└─────────────────┘
```

## Dropdown Mode (isDropdown={true})

### Visual Layout
```
┌─────────────────────────────┐
│ Department (2)        ▼     │  ← Button showing count
└─────────────────────────────┘
         │
         ▼ (when open)
┌─────────────────────────────┐
│ Department                   │
├─────────────────────────────┤
│ ☑ Engineering      (12)     │  ← Checkbox for multi-select
│ ☑ Marketing        (8)      │
│ ☐ Sales            (15)     │
│ ☐ HR               (5)      │
│ ☐ Finance          (3)      │
└─────────────────────────────┘
```

### Single-Select Dropdown
```
┌─────────────────────────────┐
│ Status: Active         ▼     │
└─────────────────────────────┘
         │
         ▼ (when open)
┌─────────────────────────────┐
│ Status                       │
├─────────────────────────────┤
│ ⦿ Active            (45)    │  ← Radio button
│ ○ Inactive          (12)     │
│ ○ Pending           (8)      │
└─────────────────────────────┘
```

## Responsive Behavior

### Desktop (lg+)
```
Department: [ Engineering ] [ Marketing ] [ Sales ] [ HR ] [ Finance ]
```

### Mobile
```
Department:
[ Engineering ]
[ Marketing ]
[ Sales ]
[ HR ]
[ Finance ]
```

## Component Structure

```
FilterOptionsButtons
├── Label: "Department:"
├── Mode: Button Row OR Dropdown
│   ├── Button Row:
│   │   ├── Button (Engineering) [active]
│   │   ├── Button (Marketing) [active]
│   │   ├── Button (Sales)
│   │   └── Button (HR)
│   │
│   └── Dropdown:
│       ├── Trigger Button: "Department (2)"
│       └── Dropdown Menu:
│           ├── Option (Engineering) [checked]
│           ├── Option (Marketing) [checked]
│           ├── Option (Sales)
│           └── Option (HR)
└── Count Badges: (12), (8), etc.
```

## State Flow

### Multi-Select Button Click
```
User clicks "Sales" button
  ↓
Check if "Sales" in selected array
  ↓
If yes: Remove from array (toggleListValue)
If no: Add to array (toggleListValue)
  ↓
URL updates: ?department=Engineering,Marketing,Sales
  ↓
Component re-renders with new active state
```

### Single-Select Button Click
```
User clicks "Active" button
  ↓
Check if "Active" is current value
  ↓
If yes: Remove filter (remove)
If no: Set filter (set)
  ↓
URL updates: ?status=Active
  ↓
Component re-renders with new active state
```
