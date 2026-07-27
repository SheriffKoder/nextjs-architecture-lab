# Search placeholder marquee

Optional UX feature for narrow search fields (especially mobile toolbar): when the
placeholder text is wider than the input, it scrolls horizontally so users can read
the full hint.

Native `<input placeholder>` cannot animate, so this module renders a **faux
placeholder overlay** that sits above the input while it is empty and unfocused.

## How it works

```
SearchBar
├── <input />              ← real field; aria-label when marquee is on
└── ScrollingPlaceholderOverlay
      ├── overflow measure (ResizeObserver)
      └── CSS transform animation (GPU, no JS timers)
```

Animation runs only when:

- `placeholderMarquee` is enabled
- input is empty and not focused
- measured text width exceeds the visible clip area
- user has not requested reduced motion

Each cycle: **hold at start → scroll forward → hold at end → soft fade → snap to start → ease back to full opacity → …**
Reset uses a gentle opacity dip (~55%) instead of fading out completely.

## Usage

```tsx
import { SearchBar } from '@/platform/url-kit/filters/feature-filtering/components/search-bar'

<SearchBar
  config={searchConfig}
  placeholderMarquee
/>

// or with options
<SearchBar
  config={searchConfig}
  placeholderMarquee={{ cycleMs: 8000 }}
/>
```

### FilterToolbar (desktop / mobile / both / none)

Pass `placeholderMarquee` on `<FilterToolbar />`. The orchestrator resolves per shell:

```tsx
// both
placeholderMarquee

// mobile only
placeholderMarquee={{ mobile: true }}

// desktop only
placeholderMarquee={{ desktop: true }}

// both with shared timing
placeholderMarquee={{ cycleMs: 12000 }}

// per-shell
placeholderMarquee={{
  desktop: true,
  mobile: { cycleMs: 8000 },
}}

// off — omit the prop (or pass false)
```

Demo page config: `views/demo-rsc-page/config/ui/demo-rsc-filter-toolbar-config.ts`

```ts
export const DEMO_RSC_PLACEHOLDER_MARQUEE = {
  desktop: true,
  mobile: true,
}
```

## Config

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholderMarquee` | `boolean \| PlaceholderMarqueeConfig \| { desktop?, mobile? }` | off | Enable overlay; viewport object picks shell |
| `cycleMs` | `number` | `10000` | Full cycle (~25% hold start, ~25% scroll, ~25% hold end, ~25% reset/hold) |

## Files

| File | Responsibility |
|------|----------------|
| `types.ts` | Config types + normalizer |
| `use-scrolling-placeholder.ts` | Overflow measure + visibility gates |
| `scrolling-placeholder-overlay.tsx` | Overlay UI |
| `placeholder-marquee.css` | Keyframe animation (co-located) |
| `index.ts` | Public barrel |

## Integration points (outside this folder)

These are the **only** external touch points:

1. `components/search-bar.tsx` — optional prop + overlay mount
2. `filter-toolbar/ui/search-control/search-control.tsx` — passes prop through
3. `filter-toolbar/model/types.ts` + `ui/filter-toolbar.tsx` — `placeholderMarquee` prop; resolves per desktop/mobile shell
4. Page config (optional) — e.g. `demo-rsc-filter-toolbar-config.ts` → `<FilterToolbar placeholderMarquee={…} />`

## Removing this feature

1. Delete this folder:
   `platform/url-kit/filters/feature-filtering/features/placeholder-marquee/`
2. In `components/search-bar.tsx`:
   - Remove the import from `../features/placeholder-marquee`
   - Remove `placeholderMarquee` from props
   - Remove overlay JSX and restore a plain `placeholder={...}` on `<Input />`
3. In `filter-toolbar/ui/search-control/search-control.tsx`:
   - Remove `placeholderMarquee` prop and pass-through
4. In `filter-toolbar/model/types.ts` + `ui/filter-toolbar.tsx` + layout props:
   - Remove `placeholderMarquee` + `resolvePlaceholderMarqueeForViewport` usage
5. Remove page config / prop passes (e.g. `DEMO_RSC_PLACEHOLDER_MARQUEE`)

No data-layer or URL changes are required.
