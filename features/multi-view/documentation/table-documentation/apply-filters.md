and what is the flow when i click 
"Jan 1, 2025" ,,, how it gets filtered out when we have it UTC etc? 

## Step 1: Filter options generation (TableFilterDropdownOrchestrator, lines 337-340)

// Raw UTC date from data
rawValue = "2026-01-05T14:30:18.219861+00:00"

// Use formatter to convert raw → formatted
const stringValue = extractDisplayValue(value); 
// → Uses formatter: "2026-01-05T14:30:18..." → "Jan 5, 2026"

// Store in optionMap
optionMap.set("Jan 5, 2026", {
  value: "Jan 5, 2026",           // ← Formatted string (used as filter value)
  rawValue: "2026-01-05T14:30:18..." // ← Original UTC date
})

## Step 2: User clicks "Jan 1, 2025" (StandardFilterDropdown, line 293)

onClick={() => onToggleOption(option.value)}
// option.value = "Jan 1, 2025" (formatted string)


## Step 3: Filter value stored (TableFilterDropdownOrchestrator, lines 587-602)

toggleOption("Jan 1, 2025")  // Formatted string
  ↓
pendingSelections = ["Jan 1, 2025"]  // Stored as formatted string
  ↓
onFilterChangeRef.current(columnKey, ["Jan 1, 2025"])
  ↓
filters = { created_at: ["Jan 1, 2025"] }  // Filter stored as formatted string


## Step 4: Filter application (apply-filters.ts, lines 186-187)
rawValue = "2025-01-01T14:30:18.219861+00:00"  // UTC date from data

// Convert raw → formatted using formatter
const stringValue = extractFilterValue(value, column);
// → Uses formatter: "2025-01-01T14:30:18..." → "Jan 1, 2025"

// Compare formatted strings
filterValue = ["Jan 1, 2025"]  // From step 3
stringValue = "Jan 1, 2025"    // From formatter

// Check if match
filterValue.includes(stringValue)  // "Jan 1, 2025" === "Jan 1, 2025" → ✅ MATCH!

Summary
Filter options: raw UTC → formatted via formatter → stored as formatted string
User selection: formatted string stored as filter value
Filtering: raw UTC → formatted via formatter → compared with formatted filter value

Both sides use the same formatter, so formatted strings can be compared directly. The UTC date is not converted back; instead, both the filter value and the data value are formatted and compared as strings.