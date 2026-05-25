# Decision Log

## ADR-001 — URL as source of truth for filters

Chosen because:

- shareable state
- server-driven fetching
- deterministic navigation

Tradeoff:

- navigation latency

---

## ADR-002 — Separate screens from features

Chosen because:

- pages orchestrate
- features own logic

---

## ADR-003 — Query object normalization

params → normalized query

Chosen because:

- typed server contracts
- future TanStack compatibility

---

## ADR-004 — Split Suspense islands

Chosen because:

- filters
- table
- pagination

stream independently.

---

## ADR-005 — Drawer outside table section

Chosen because:

- global overlay
- reusable architecture

Tradeoff:

- detail fetch complexity