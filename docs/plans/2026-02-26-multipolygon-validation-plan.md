# MultiPolygon Validation Gaps — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add antimeridian and degenerate-polygon validation to the MultiPolygon branch of `polygonToGeohashes`, matching the single-polygon path's behaviour.

**Architecture:** Inline validation loop added after child normalisation, before the compute retry loop. No new functions or abstractions — mirrors the existing single-polygon guards.

**Tech Stack:** TypeScript, vitest

---

### Task 1: Write failing tests for MultiPolygon validation

**Files:**
- Modify: `src/coverage.test.ts:748` (insert before the closing `})` of the MultiPolygon describe block)

**Step 1: Write three failing tests**

Insert these tests at `src/coverage.test.ts:748`, just before the `})` that closes the `polygonToGeohashes — MultiPolygon global maxCells` describe block:

```typescript
  it('throws for MultiPolygon child crossing the antimeridian', () => {
    const crossingMulti = {
      type: 'MultiPolygon' as const,
      coordinates: [
        [[[170, -10], [-170, -10], [-170, 10], [170, 10], [170, -10]]],
      ],
    }
    expect(() => polygonToGeohashes(crossingMulti)).toThrow(/antimeridian/)
  })

  it('throws for MultiPolygon child with fewer than 3 vertices', () => {
    const degenerateMulti = {
      type: 'MultiPolygon' as const,
      coordinates: [
        [[[0, 0], [1, 1]]],
      ],
    }
    expect(() => polygonToGeohashes(degenerateMulti)).toThrow(/at least 3 vertices/)
  })

  it('throws when second child crosses antimeridian (first child valid)', () => {
    const mixedMulti = {
      type: 'MultiPolygon' as const,
      coordinates: [
        // Valid: London
        [[[-0.15, 51.49], [-0.05, 51.49], [-0.05, 51.54], [-0.15, 51.54], [-0.15, 51.49]]],
        // Invalid: crosses antimeridian
        [[[170, -10], [-170, -10], [-170, 10], [170, 10], [170, -10]]],
      ],
    }
    expect(() => polygonToGeohashes(mixedMulti)).toThrow(/antimeridian/)
  })
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --reporter=verbose 2>&1 | grep -E '(FAIL|✓|×|MultiPolygon)'`

Expected: All three new tests FAIL (the antimeridian ones return hashes instead of throwing; the degenerate one is silently skipped).

**Step 3: Commit**

```bash
git add src/coverage.test.ts
git commit -m "test: add failing tests for MultiPolygon validation gaps"
```

---

### Task 2: Add validation loop to MultiPolygon branch

**Files:**
- Modify: `src/coverage.ts:235-236` (insert validation after normalisation)

**Step 1: Add validation loop after child normalisation**

In `src/coverage.ts`, after line 235 (the closing `)` of the `children` map), insert:

```typescript

    // Validate all children before computing
    for (const { outer } of children) {
      if (outer.length < 3) {
        throw new Error('Polygon must have at least 3 vertices')
      }
      for (let i = 0; i < outer.length; i++) {
        const j = (i + 1) % outer.length
        if (Math.abs(outer[i][0] - outer[j][0]) > 180) {
          throw new Error('Polygons crossing the antimeridian (\u00b1180\u00b0 longitude) are not supported')
        }
      }
    }
```

**Step 2: Run tests to verify the three new tests pass**

Run: `npm test -- --reporter=verbose 2>&1 | grep -E '(FAIL|✓|×|MultiPolygon)'`

Expected: All three new tests PASS. All existing tests still PASS.

**Step 3: Commit**

```bash
git add src/coverage.ts
git commit -m "fix: add antimeridian and degenerate validation to MultiPolygon path"
```

---

### Task 3: Remove dead `continue` guards

**Files:**
- Modify: `src/coverage.ts:243` and `src/coverage.ts:256` (remove the `if (outer.length < 3) continue` lines)

**Step 1: Remove the two dead guards**

In `src/coverage.ts`, remove these two lines (they are now unreachable since degenerate children throw in the validation loop):

Line ~253 (retry loop): `if (outer.length < 3) continue`
Line ~266 (fallback loop): `if (outer.length < 3) continue`

**Step 2: Run full test suite**

Run: `npm test`

Expected: All 736 tests pass (733 existing + 3 new).

**Step 3: Run typecheck**

Run: `npm run typecheck`

Expected: No errors.

**Step 4: Commit**

```bash
git add src/coverage.ts
git commit -m "refactor: remove unreachable degenerate guards in MultiPolygon loops"
```
