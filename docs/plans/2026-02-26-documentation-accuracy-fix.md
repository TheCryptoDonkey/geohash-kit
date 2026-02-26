# Documentation Accuracy Fix

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all factual errors in README.md comparison table, migration guide, and supporting docs (llms.txt, llms-full.txt).

**Architecture:** Pure documentation changes — no code modifications. Each task fixes one category of error.

**Tech Stack:** Markdown only.

---

## Audit Summary

### Verified Correct (no changes needed)

- **Migration guide** — all ngeohash function mappings, return types, and direction formats verified against source
- **API reference tables** — all 26 functions match actual exports in `src/index.ts`
- **llms.txt** — all function signatures correct
- **llms-full.txt** — all types, signatures, examples, and precision table correct
- **Comparison table columns for:** ngeohash (all except Last published), geohash-poly (all except Last published), nostr-geotags (all correct), shape2geohash (all except Weekly downloads)
- **Polygon coverage algorithm description** — accurate
- **Memory considerations section** — accurate

### Errors Found

| # | Location | Claim | Actual | Severity |
|---|----------|-------|--------|----------|
| 1 | README L14 | "717 tests" | 736 tests (verified via `npx vitest run`) | Medium |
| 2 | README L175 | geohashing ESM-only = Yes | Dual CJS+ESM (has both `import` and `require` exports) | High |
| 3 | README L184 | geohashing Neighbours = No | Yes — exports `getNeighborInt/Base32`, `getNeighborsInt/Base32` | High |
| 4 | README L189 | geohashing Weekly downloads ~2k | ~6.8k (week of 19–25 Feb 2026) | Low |
| 5 | README L175 | latlon-geohash ESM-only = No | ESM-only (`"type": "module"` in package.json) | High |
| 6 | README L188 | latlon-geohash Last published = 2022 | Last version published 2019; 2022 was metadata-only | Medium |
| 7 | README L188 | ngeohash Last published = 2022 | Last version (0.6.3) published 2018; 2022 was metadata-only | Medium |
| 8 | README L188 | geohash-poly Last published = 2022 | Last version (0.6.0) published 2019; 2022 was metadata-only | Medium |
| 9 | README L189 | shape2geohash Weekly downloads ~1k | ~500 (week of 19–25 Feb 2026) | Low |

---

## Tasks

### Task 1: Fix test count in README

**Files:**
- Modify: `README.md:14`

**Step 1: Update test count**

Change line 14 from:
```
- **Production-hardened** — input validation on all public APIs, RangeError on invalid/infeasible parameters, 717 tests including fuzz and property-based suites.
```
to:
```
- **Production-hardened** — input validation on all public APIs, RangeError on invalid/infeasible parameters, 736 tests including fuzz and property-based suites.
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: fix test count (736, not 717)"
```

---

### Task 2: Fix comparison table errors

**Files:**
- Modify: `README.md:172-189`

**Step 1: Apply all comparison table fixes**

The corrected table should be:

```markdown
| Feature | geohash-kit | ngeohash | geohashing | latlon-geohash | geohash-poly | shape2geohash | nostr-geotags |
|---------|:-----------:|:--------:|:----------:|:--------------:|:------------:|:-------------:|:-------------:|
| TypeScript native | **Yes** | No | Yes | No | No | No | Yes |
| ESM-only | **Yes** | No | No | Yes | No | No | Yes |
| Zero dependencies | **Yes** | Yes | Yes | Yes | No (10) | No (11) | No (2) |
| Polygon → geohashes | **Multi-precision** | — | — | — | Single-precision | Single-precision | — |
| Multi-precision output | **Yes** | — | — | — | No | No | — |
| maxCells budget | **Yes** | — | — | — | No | No | — |
| GeoJSON output | **Yes** | No | Yes | No | No | No | No |
| Convex hull | **Yes** | No | No | No | No | No | No |
| Deduplication | **Yes** | No | No | No | No | No | No |
| Distance / radius | **Yes** | No | No | No | No | No | No |
| Neighbours / rings | **Yes** | Yes | Yes | Yes | No | No | No |
| Nostr g-tag ladders | **Yes** | No | No | No | No | No | Partial |
| Nostr REQ filters | **Yes** | No | No | No | No | No | No |
| Input validation | **Yes** | No | No | No | No | No | No |
| Last published | 2026 | 2018 | 2024 | 2019 | 2019 | 2022 | 2025 |
| Weekly downloads | — | ~171k | ~7k | ~19k | ~1k | ~500 | <100 |
```

Changes from original:
- geohashing ESM-only: Yes → **No** (dual CJS+ESM)
- geohashing Neighbours: No → **Yes**
- geohashing Weekly downloads: ~2k → **~7k**
- latlon-geohash ESM-only: No → **Yes**
- latlon-geohash Last published: 2022 → **2019**
- ngeohash Last published: 2022 → **2018**
- geohash-poly Last published: 2022 → **2019**
- shape2geohash Weekly downloads: ~1k → **~500**

**Step 2: Run typecheck to confirm no build issues**

Run: `npm run typecheck`
Expected: PASS (docs-only change)

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: fix comparison table inaccuracies

- geohashing: not ESM-only (dual CJS+ESM), has neighbours
- latlon-geohash: is ESM-only, last published 2019 not 2022
- ngeohash: last published 2018 not 2022
- geohash-poly: last published 2019 not 2022
- Updated weekly download figures"
```

---

### Task 3: Verify no stale claims elsewhere

**Files:**
- Check: `llms.txt`, `llms-full.txt`

**Step 1: Confirm llms.txt and llms-full.txt have no test count or comparison claims**

Both files contain only API signatures and examples — no comparison table or test counts. No changes needed.

**Step 2: Done — no commit needed**

---

## Summary of Changes

| File | Changes |
|------|---------|
| `README.md` | Fix test count (717→736), fix 8 cells in comparison table |
| `llms.txt` | None needed |
| `llms-full.txt` | None needed |

Total: 2 commits, 1 file modified.
