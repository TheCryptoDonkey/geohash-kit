# MultiPolygon Validation Gaps — Design

**Date:** 2026-02-26
**Status:** Approved
**Approach:** A — Inline validation in MultiPolygon branch

## Problem

`polygonToGeohashes` enforces antimeridian and degenerate-polygon validation in the single-polygon path but not in the MultiPolygon path:

- **P1:** MultiPolygon children crossing the antimeridian produce hashes instead of throwing, violating the documented unsupported-input contract.
- **P2:** Degenerate MultiPolygon children (`outer.length < 3`) are silently skipped via `continue`, while the single-polygon path throws. Behaviour is inconsistent.
- **P2:** No tests cover these MultiPolygon validation paths.

## Design

### Code changes (`src/coverage.ts`)

In the MultiPolygon branch, after normalising children (line ~235) and before the retry loop, add a validation loop over each child's `outer` ring:

1. **Degenerate check:** If `outer.length < 3`, throw `Error('Polygon must have at least 3 vertices')`.
2. **Antimeridian check:** Walk edges of `outer`; if any edge spans >180 degrees longitude, throw `Error('Polygons crossing the antimeridian (+-180 degrees longitude) are not supported')`.
3. **Remove** the `if (outer.length < 3) continue` guards in both the retry loop and fallback loop, since degenerate children now throw before reaching those loops.

Error messages match the single-polygon path exactly. Fail-fast on first bad child for consistency.

### Test changes (`src/coverage.test.ts`)

Three new test cases:

1. **Antimeridian child throws:** MultiPolygon with one child crossing 170 to -170 longitude throws `/antimeridian/`.
2. **Degenerate child throws:** MultiPolygon with one child having <3 vertices throws `/at least 3 vertices/`.
3. **Mixed valid + invalid:** MultiPolygon where first child is valid but second crosses antimeridian — still throws.

### Scope

- 1 file changed: `src/coverage.ts` (~10 lines added, ~2 removed)
- 1 file changed: `src/coverage.test.ts` (3 new test cases)
- No API changes, no new exports, no new functions
