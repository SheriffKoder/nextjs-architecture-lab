# Timeline View Header — Single Pill Rebuild

## Objective

Rebuild the timeline top toolbar into a **single compact pill** that owns navigation, date/time jump, view mode, and zoom — while splitting each control into its own component under `view-header/`. `HeaderWrapper` becomes a thin **orchestrator** only (layout + prop wiring), not a monolithic markup block.

Current source: `components/view-header/header-wrapper.tsx` (three-column stretch: zoom | nav+datetime | view switcher).

Consumer (unchanged state ownership): `timeline-wrapper.tsx` — still owns `selectedView`, `zoomFactors`, `selectedDate`, scroll/today handlers, and `isTodayInRange`.

---

## UI / UX gain

| Today | Target |
|-------|--------|
| Full-width three-zone toolbar; controls compete for horizontal space | One centered (or start-aligned) **pill** — reads as a single control chrome |
| Segmented `ViewSwitcher` / `ZoomSwitcher` take significant width | **Text triggers** (`Month`, `1x`) open compact dropdown menus |
| Native `datetime-local` sits as a wide input beside nav | Same native picker (date **and** time), visually tucked into the pill after a separator |
| Header file mixes all concerns | Clear ownership: **dates** / **mode** / **zoom**; easier to restyle or swap one control |

**Explicit product choices (locked for this plan):**

1. **Date control** — keep the **native** `datetime-local` input (browser date + time). Do **not** swap to the filter-toolbar / `react-date-range` calendar for this pass. Visually it presents as a **calendar icon** (native picker opened on click), not a wide visible text field.
2. **Mode & zoom** — use `@/components/ui/dropdown-menu` **plain text** triggers (not the existing slider switchers; no visible chevron in the reference).
3. **Today** — **icon**, not the word “Today” (crosshair / “locate me” glyph in the reference).
4. **Pill composition** (left → right), matching reference:

```text
[ ← ] [ ◎ ] [ → ]  |  [ 📅 ]  Month  ·  1x
  prev  today  next  sep  calendar  mode  dot zoom
```

5. **Separators** — vertical rule between nav cluster and the rest; middle **dot** between mode and zoom.

**Reference image:** [`docs/assets/view-header-pill-reference.png`](./assets/view-header-pill-reference.png)

---

## Style expectations (from reference)

Global chrome for the whole control:

| Token | Expectation |
|-------|-------------|
| Shape | Stadium / fully rounded pill (`rounded-full`) |
| Size | Compact single row (~32–36px tall); shrink-to-content width (not full-bleed) |
| Surface | Dark charcoal / muted panel (`bg-muted` or similar); works on dark page bg |
| Border | Hairline, low-contrast stroke (`border-border` / `border-foreground/10`) |
| Foreground | Light icons + text; medium sans weight; tight internal gaps |
| Hit targets | Icon buttons stay square-ish with light hover wash; no heavy shadows or focus glow |
| Alignment | Vertically centered; generous outer horizontal padding; tighter gaps inside nav group |

### Per-item style notes

| Item | Component | Style expectation |
|------|-----------|-------------------|
| **Pill shell** | `chrome/pill-shell.tsx` | One continuous capsule. Contents are a horizontal flex row with consistent vertical centering. No internal cards, no segmented “button group” chrome. Parent centers or start-aligns the pill; pill itself does not stretch. |
| **Prev** | `dates/prev-button.tsx` | Icon-only thin **left arrow** (←). Same stroke weight as Next. No label. Quiet hover (`hover:bg-foreground/5`). |
| **Today** | `dates/today-button.tsx` | Icon-only **locate / crosshair** (circle + center dot), *not* the text “Today”. Same optical size as arrows. Disabled (when out of range) drops opacity; title/tooltip still explains “Scroll to today”. |
| **Next** | `dates/next-button.tsx` | Icon-only thin **right arrow** (→). Mirror of Prev. |
| **Vertical separator** | `chrome/pill-separator.tsx` | Thin vertical rule after the nav trio. Does **not** touch top/bottom of the pill (short inset height). Low-contrast gray. Equal breathing room left/right of the rule. |
| **Calendar (date+time)** | `dates/calendar-input.tsx` | Visually a **calendar outline icon** only (reference shows a small calendar glyph). Still backed by native `datetime-local` for date **and** time (e.g. visually hidden / zero-opacity input over the icon, or icon-as-label triggering the picker). Must **not** look like a wide filled input inside the pill. |
| **Mode** | `mode/mode-dropdown.tsx` | Plain text label of current view (`Month`, `Week`, …). No chevron in the resting state (reference). Opens `dropdown-menu` on click. Hover may lightly tint the text/hit area only. |
| **Dot** | `chrome/pill-dot.tsx` | Small centered interpunct (`·`) between mode and zoom. Decorative, not interactive. Same foreground family as text, slightly muted if needed. |
| **Zoom** | `zoom/zoom-dropdown.tsx` | Plain text factor label (`1x`, `0.5x`, …). Same type treatment as Mode. No chevron at rest. Opens `dropdown-menu` on click. |

**Light theme:** Keep the same structure; map surface/border/foreground to theme tokens so the pill stays a single muted capsule (avoid pure white “card” look).

---

## Target folder structure

```text
components/view-header/
├── header-wrapper.tsx          # orchestrator: pill shell + composition
├── index.ts                    # public barrel
├── dates/
│   ├── index.ts
│   ├── dates-cluster.tsx       # optional cluster orchestrator (prev+today+next+calendar)
│   ├── prev-button.tsx
│   ├── today-button.tsx
│   ├── next-button.tsx
│   └── calendar-input.tsx      # native datetime-local
├── mode/
│   ├── index.ts
│   └── mode-dropdown.tsx       # DropdownMenu of Year | Month | Week | Day
└── zoom/
    ├── index.ts
    └── zoom-dropdown.tsx       # DropdownMenu of 0.5x | 1x | 1.5x | 2x (configurable)
```

Shared chrome (optional, only if it reduces duplication):

```text
components/view-header/
└── chrome/
    ├── pill-shell.tsx          # rounded border / bg / padding for the pill
    ├── pill-separator.tsx      # vertical rule
    └── pill-dot.tsx            # · between mode and zoom
```

Legacy UI left in place until cutover (no delete in early steps):

- `components/ui/view-switcher.tsx`
- `components/ui/ZoomSwitcher.tsx`

---

## Steps

### Step 0 — Scaffold folders and barrels

**Files**

- Create: `components/view-header/dates/index.ts`
- Create: `components/view-header/mode/index.ts`
- Create: `components/view-header/zoom/index.ts`
- Keep: `components/view-header/index.ts` (still exports `HeaderWrapper`)

**Expected outcomes**

- Empty / stub barrels compile.
- No visual change; `timeline-wrapper` still uses current `HeaderWrapper`.

---

### Step 1 — Extract date navigation atoms

**Files**

- Create: `components/view-header/dates/prev-button.tsx`
- Create: `components/view-header/dates/today-button.tsx`
- Create: `components/view-header/dates/next-button.tsx`
- Create: `components/view-header/dates/calendar-input.tsx`
- Update: `components/view-header/dates/index.ts`

**Props (contracts)**

| Component | Props |
|-----------|--------|
| `PrevButton` | `onClick`, optional `disabled` / `className` |
| `TodayButton` | `onClick`, `isTodayInRange`, optional `className` |
| `NextButton` | `onClick`, optional `disabled` / `className` |
| `CalendarInput` | `value`, `onChange` (native `ChangeEvent<HTMLInputElement>`), optional `className` |

**Expected outcomes**

- Each atom is presentational; no timeline refs or scroll logic inside.
- Atom visuals follow **Style expectations**: prev/next thin arrows, today = locate icon, calendar = icon over native `datetime-local` (not a wide input).
- Pill shell / separators / mode+zoom cutover remain later steps; `HeaderWrapper` may still use the three-column layout while wiring these atoms.
- Preferred: wire atoms into current layout in this step so behavior is proven before the pill restyle.

---

### Step 2 — Mode dropdown

**Files**

- Create: `components/view-header/mode/mode-dropdown.tsx`
- Update: `components/view-header/mode/index.ts`
- Reference: `components/ui/dropdown-menu.tsx` (`DropdownMenu`, `Trigger`, `Content`, `Item` / `RadioGroup`)
- Types: re-use `TimelineViewMode` from `header-wrapper.tsx` (or move type to `view-header/mode/types.ts` / shared `view-header/types.ts` if preferred)

**Behavior**

- Trigger shows current mode label as text (e.g. `Month`); **no chevron** in resting state (see style expectations).
- Menu lists `views` from props (subset of Year / Month / Week / Day).
- Selecting an item calls `onViewChange(view)`.
- Active item indicated (check / `DropdownMenuRadioItem`).

**Expected outcomes**

- Drop-in replacement for `ViewSwitcher` API surface used by the header.
- Keyboard / focus behavior comes from Radix dropdown-menu.
- No dependency on `components/ui/view-switcher.tsx`.

---

### Step 3 — Zoom dropdown

**Files**

- Create: `components/view-header/zoom/zoom-dropdown.tsx`
- Update: `components/view-header/zoom/index.ts`
- Reference: `components/ui/dropdown-menu.tsx`
- Options: mirror current `ZoomSwitcher` defaults — `0.5`, `1`, `1.5`, `2` with labels `0.5x` … `2x` (prop-overridable)

**Behavior**

- Trigger shows current factor label (e.g. `1x`); **no chevron** in resting state (see style expectations).
- Selecting an option calls `onZoomChange(factor: number)`.
- Parent still owns per-view `zoomFactors` map (`timeline-wrapper.tsx`); this control only sees the **current** factor for `selectedView`.

**Expected outcomes**

- Same zoom contract as today (`value` + `onChange(number)`).
- No dependency on `components/ui/ZoomSwitcher.tsx` from the header path.

---

### Step 4 — Dates cluster (optional but recommended)

**Files**

- Create: `components/view-header/dates/dates-cluster.tsx`
- Update: `components/view-header/dates/index.ts`

**Composition**

```text
PrevButton + TodayButton + NextButton  |  CalendarInput
```

**Expected outcomes**

- One import for the left half of the pill.
- Cluster owns only layout of date atoms; handlers still passed from `HeaderWrapper`.

---

### Step 5 — Pill shell + rebuild `HeaderWrapper` as orchestrator

**Files**

- Create (optional): `components/view-header/chrome/pill-shell.tsx`, `pill-separator.tsx`, `pill-dot.tsx`
- Rewrite: `components/view-header/header-wrapper.tsx`
- Keep props interface stable for `timeline-wrapper.tsx` (or document any rename)

**Layout**

```tsx
<PillShell>
  <DatesCluster ... />
  <PillSeparator />
  <CalendarInput ... />   {/* if not already inside DatesCluster */}
  <ModeDropdown ... />
  <PillDot />
  <ZoomDropdown ... />
</PillShell>
```

**Visual targets**

- Match **Style expectations** section and `docs/assets/view-header-pill-reference.png`.
- Single stadium capsule; shrink-to-content; hairline border; muted surface.
- Nav = icon trio (← · locate · →); calendar = icon over native datetime; mode/zoom = plain text; short vertical rule + interpunct separators.
- Hover/focus stay light (`hover:bg-foreground/5`); no heavy focus rings unless a11y requires.

**Expected outcomes**

- Visual match to the agreed pill sketch.
- `HeaderWrapper` file is mostly composition (~30–50 lines), no inline prev/today/next markup.
- `timeline-wrapper.tsx` needs **no logic changes** if props stay the same; only re-render new chrome.

---

### Step 6 — Wire & smoke-check from `timeline-wrapper`

**Files**

- Verify: `timeline-wrapper.tsx` still passes the same props to `HeaderWrapper`
- Manual checks:
  - Prev / next scroll by existing pixel step
  - Today enabled only when `isTodayInRange`; scrolls to today
  - Datetime change still `scrollToDate`
  - Mode change preserves `currentDate` via existing `useEffect`
  - Zoom updates only the active view’s factor; other views retain theirs
  - Dropdowns open above/below without clipping (portal from Radix)

**Expected outcomes**

- Behavior parity with pre-pill header, new chrome only.
- No regressions in timeline scroll / zoom width math.

---

### Step 7 — Cleanup (after visual sign-off)

**Files**

- Decide: leave `ViewSwitcher` / `ZoomSwitcher` for other callers, or delete if unused.
- Grep: confirm no remaining imports from header path.
- Optional: short note in `TIMELINE_UI_STRUCTURE.md` pointing at `view-header/`.

**Expected outcomes**

- Dead code removed or explicitly retained with a one-line comment if still demo’d elsewhere.
- Docs mention the pill header location.

---

## Out of scope (this plan)

- Replacing native datetime with the shared filter calendar / `react-date-range`.
- URL-driving timeline mode/zoom (still local state in `timeline-wrapper`).
- Changing zoom option set or scroll pixel step.
- Mobile-specific pill redesign (default: same pill; wrap only if overflow proven).

---

## Acceptance checklist

- [ ] Pill matches reference: stadium capsule, icon nav, calendar icon, plain `Month` / `1x`, vertical rule + dot
- [ ] Prev / Today / Next / native datetime / mode dropdown / zoom dropdown are separate components under the folders above
- [ ] `HeaderWrapper` only orchestrates
- [ ] Mode & zoom use `components/ui/dropdown-menu` (no resting chevrons)
- [ ] Date+time still via native `datetime-local` (icon presentation)
- [ ] Today is locate icon, not text label
- [ ] `timeline-wrapper` state and scroll/zoom behavior unchanged
- [ ] Plan steps completed in order; Step 7 only after UI sign-off

---

## Implementation order (summary)

1. Scaffold barrels  
2. Date atoms (+ optional early wire)  
3. Mode dropdown  
4. Zoom dropdown  
5. Dates cluster  
6. Pill shell + orchestrator rewrite  
7. Smoke against `timeline-wrapper`  
8. Cleanup unused switchers  

Ready to implement starting at **Step 0** when approved.
