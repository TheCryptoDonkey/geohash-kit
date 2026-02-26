# Benchmarking geohash-kit

## Overview

geohash-kit includes comprehensive benchmarks for all major functions, co-located with source modules (`*.bench.ts` files). Benchmarks measure real-world performance across varying input sizes and parameters to identify hotspots and track regressions.

**Run benchmarks:**

```bash
npm run bench
```

## Baseline Performance (Apple Silicon, 2024)

All benchmarks run on a modern development machine. Mobile and older devices will be slower (see [Performance on Different Devices](#performance-on-different-devices)).

### Core Functions (src/core.bench.ts)

Very fast — all >5M ops/sec, mostly sub-100µs. These are well-optimized and require no attention.

| Function | Performance | Notes |
|----------|-------------|-------|
| `encode` | 6–14M ops/sec | Faster at lower precision |
| `decode` | 5–6M ops/sec | Straightforward arithmetic |
| `bounds` | 5–7M ops/sec | Simple lookup |
| `neighbours` | 379k–499k ops/sec | Generates 8 adjacent cells |
| `children` | 1M ops/sec | Generates 32 child cells |
| `contains` | 20–21M ops/sec | String prefix check |
| `matchesAny` | 21M ops/sec | Tests 4 candidates (scales linearly) |
| `distanceFromCoords` | 22M ops/sec | Haversine calculation |
| `radiusToPrecision` | 21M ops/sec | Lookup table + logarithm |
| `precisionToRadius` | 22M ops/sec | Simple arithmetic |

### Coverage Functions (src/coverage.bench.ts)

**`polygonToGeohashes`** is the workhorse. Performance scales with polygon size and precision:

| Input | Precision | Ops/Sec | Time/Op | Status |
|-------|-----------|---------|---------|--------|
| Small polygon | 6–7 | 7,230 | 0.14ms | ✓ Good |
| Small polygon | 6–8 | 377 | 2.65ms | ⚠ Expected slowdown |
| Medium polygon (10km²) | 5–7, 200 cells | 1,035 | 0.97ms | ✓ Good |
| Medium polygon | 5–7, 500 cells | 565 | 1.77ms | ⚠ Cell budget pressure |
| Large polygon | 4–6, 100 cells | 1,712 | 0.58ms | ✓ Good |
| Large polygon | 5–7, 500 cells | 282 | 3.55ms | ⚠ Worst case |

**Other coverage functions** are very fast:

| Function | Performance |
|----------|-------------|
| `geohashesToGeoJSON` | 529k ops/sec (~50 hashes) |
| `geohashesToConvexHull` | 86k ops/sec (~100 hashes) |
| `deduplicateGeohashes` | 33k ops/sec (~300 hashes) |
| `pointInPolygon` | 9–10M ops/sec (ray-casting) |

### Nostr Functions (src/nostr.bench.ts)

Fast for typical use cases; ring expansion scales with depth:

| Function | Performance | Notes |
|----------|-------------|-------|
| `createGTagLadder` | 5–11M ops/sec | Builds tag array |
| `expandRings` | 340k–4k ops/sec | Degrades with ring depth |
| `createGTagFilter` | 256k–332k ops/sec | Creates filter from coordinates |
| `nearbyFilter` | 328k ops/sec | Convenience wrapper |
| `parseGTags` | 9M ops/sec | Extracts tags from event |

## Where These Operations Happen

### Desktop (Service Operator Interface)
- **`polygonToGeohashes`** — operator defines service area on a map. One-time operation, not performance-critical. Even 100ms is acceptable.
- **`geohashesToGeoJSON`** — render coverage on map. Fast enough (529k ops/sec).

### Mobile (Rider/Driver Apps)
- **Mobile does NOT calculate coverage.** Apps receive pre-calculated geohashes and just use them.
- **Operations on mobile:** `matchesAny`, `contains`, parsing g-tags from events.
- All of these are >5M ops/sec — no concern.

### Server (Real-time Filtering)
- **`createGTagFilter`**, `expandRings`, `parseGTags` — subscribe to location-based events.
- Acceptable latency: <10ms for user experience to feel responsive.
- Current performance: 256k–328k ops/sec = <4µs per operation, well below concern threshold.

## Interpreting Benchmark Output

Each benchmark reports:
- **hz** — operations per second
- **min/max** — outlier bounds (jitter)
- **mean** — average time per operation
- **p75, p99, p995, p999** — percentiles (e.g., p99 = 99% of operations are faster than this)
- **rme** — relative margin of error (% uncertainty in the measurement)
- **samples** — number of iterations

**Example:**
```
· precision 5–7, maxCells 200  1,035.26  0.8585   1.9708  0.9659  1.0163  1.3699  1.5299   1.9708  ±1.06%      518
```

Means: ~1,000 polygon coverages per second. Average time per operation is 0.97ms. 75% of operations complete in <1.0ms, 99% in <1.4ms. The measurement uncertainty is ±1%.

## Performance Watchlist

### 🔴 Critical (would require optimization)
None currently.

### 🟡 Watch (candidates for future optimization if use case demands)
- **`polygonToGeohashes` at high precision/large polygons** — currently 282–377 ops/sec
  - Algorithmic: adaptive threshold recursive subdivision is inherently O(polygon_perimeter × precision_levels)
  - Practical: acceptable for operator UI (one-time operation, <4ms)
  - Would optimize only if: processing thousands of polygons server-side in real-time

- **`expandRings` at depth 5+** — degrades quadratically with ring count (24x slower for 5 rings)
  - Expected behaviour: 8^n growth in neighbour cells
  - Practical: rarely needed beyond 2–3 rings in Nostr filters
  - Would optimize if: high-precision large-radius searches became common

### ✓ Fine (no optimization needed)
- All core functions (encode, decode, bounds, etc.)
- Coverage helper functions (geohashesToGeoJSON, deduplicateGeohashes, pointInPolygon)
- Most Nostr functions (createGTagLadder, parseGTags, createGTagFilter)

## Performance on Different Devices

These benchmarks run on **Apple Silicon 2024** (high-end development machine). Real-world performance varies significantly:

### Desktop
- **Modern laptop** (2023+): ±10% of benchmark
- **Older laptop** (2019): 30–50% slower
- **Low-end desktop** (budget i3): 40–60% slower

### Mobile
- **Flagship Android** (Snapdragon 8 Gen 3): ~50% slower than desktop
- **Mid-range Android** (Snapdragon 6–7 Gen 2): 60–70% slower
- **Budget Android** (Snapdragon 4): 70–90% slower
- **Modern iPhone** (A17 Pro): ~30% slower than desktop

**Example:** If `polygonToGeohashes` takes 3.5ms on our benchmark machine, expect:
- Mid-range Android: ~10–12ms
- Budget Android: ~15–20ms
- Still acceptable for operator UI if operation is not blocking user interaction.

## Running Benchmarks Locally

### All benchmarks
```bash
npm run bench
```

### Specific benchmark file
```bash
npx vitest bench src/core.bench.ts
```

### Single benchmark suite
```bash
npx vitest bench --reporter=verbose src/core.bench.ts -t "encode"
```

### Filtering tests
```bash
npx vitest bench -t "polygonToGeohashes"
```

## Tracking Regressions

If performance degrades after code changes:

1. **Run benchmarks on the current code** to establish baseline
2. **Make code changes**
3. **Run benchmarks again** and compare
4. **Expected variance:** ±5% is normal jitter; >10% warrants investigation

### Known sources of variance
- **System load** — background processes, other apps running
- **Power settings** — CPU throttling, thermal management
- **Node.js GC** — garbage collection can cause outliers
- **Time of day** — OS scheduling, thermal load varies

For rigorous comparison, run benchmarks multiple times:
```bash
for i in {1..3}; do npm run bench; done
```

## Future Optimizations (if needed)

If profiling shows genuine bottlenecks, candidates in priority order:

1. **`polygonToGeohashes` memoization** — cache intermediate subdivisions if same polygons are processed repeatedly
2. **WASM port** — 2–4x speedup possible, but only matters if processing thousands of polygons server-side
3. **Ring expansion optimization** — pre-compute neighbours at depths 1–3, avoid quadratic growth
4. **Parallel processing** — batch independent polygon operations with Worker threads (Node.js / Web)

These are speculative and should only be pursued if real-world profiling justifies the complexity.

## Integration with CI/CD

Benchmarks are **NOT** part of regular test suite (`npm test`). They are separate and manually triggered:

```bash
npm run bench          # Run all benchmarks
npm test               # Run unit tests only
npm run test:watch    # Watch tests
```

Benchmarks take ~60 seconds to run and are resource-intensive. Include in CI/CD only if you need performance tracking across commits.

## Resources

- [Vitest Benchmarking Docs](https://vitest.dev/guide/features.html#benchmarking)
- [tinybench](https://github.com/tinylibs/tinybench) — the underlying benchmark library
- Geohash algorithm: [Wikipedia](https://en.wikipedia.org/wiki/Geohash)
- Nostr g-tag specification: [NIP-52](https://github.com/nostr-protocol/nips/blob/master/52.md)
