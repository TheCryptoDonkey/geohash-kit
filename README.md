# geohash-kit

**The modern TypeScript geohash toolkit — encode, decode, cover polygons, and build Nostr filters.**

[![npm](https://img.shields.io/npm/v/geohash-kit)](https://www.npmjs.com/package/geohash-kit)
[![licence](https://img.shields.io/npm/l/geohash-kit)](./LICENCE)
![zero deps](https://img.shields.io/badge/dependencies-0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-native-blue)

## Why geohash-kit?

- **Modern TypeScript** — native types, ESM-only, tree-shakeable subpath exports. A drop-in replacement for `ngeohash`.
- **Polygon coverage** — adaptive threshold subdivision converts any polygon to a multi-precision geohash set. Not brute-force.
- **Nostr filters** — the first library that generates correct multi-precision `g`-tag ladders for publishing and `#g` filter arrays for REQ subscriptions.

## Install

```bash
npm install geohash-kit
```

## Quick Start

```typescript
import {
  encode, decode, neighbours, distance,
  polygonToGeohashes, geohashesToGeoJSON,
  createGTagLadder, createGTagFilter,
} from 'geohash-kit'

// Encode a location
const hash = encode(51.5074, -0.1278)  // 'gcpvj'

// Decode back to coordinates
const { lat, lon, error } = decode(hash)

// Get adjacent cells
const adj = neighbours(hash)  // { n, ne, e, se, s, sw, w, nw }

// Distance between two geohashes
const d = distance('gcpvj', 'u09tu')  // ~340km (London → Paris)

// Cover a polygon with geohashes
const coverage = polygonToGeohashes([
  [-0.15, 51.50], [-0.10, 51.50],
  [-0.10, 51.52], [-0.15, 51.52],
])

// Render coverage on a map
const geojson = geohashesToGeoJSON(coverage)

// Generate Nostr event tags
const tags = createGTagLadder(hash)
// [['g','g'], ['g','gc'], ['g','gcp'], ['g','gcpv'], ['g','gcpvj']]

// Generate Nostr subscription filter
const filter = createGTagFilter(51.5074, -0.1278, 5000)
// { '#g': ['gcpvj', 'gcpvm', ...] }
```

## For Nostr Developers

Nostr relays match `#g` tags by exact equality — there's no prefix matching. An event tagged `["g", "gcpvjb"]` won't match filter `{"#g": ["gcpvj"]}`. The workaround is a **tag ladder**: publish every precision prefix, subscribe at the right precision with neighbour expansion.

### Publishing

```typescript
import { encode } from 'geohash-kit/core'
import { createGTagLadder } from 'geohash-kit/nostr'

const hash = encode(51.5074, -0.1278, 6)
const tags = createGTagLadder(hash)
// Add to your event: [['g','g'], ['g','gc'], ..., ['g','gcpvjb']]
```

### Subscribing

```typescript
import { createGTagFilter, nearbyFilter } from 'geohash-kit/nostr'

// From coordinates + radius
const filter = createGTagFilter(51.5074, -0.1278, 5000)
// { '#g': ['gcpvj', ...neighbours] }

// Or with explicit precision and ring count
const filter2 = nearbyFilter(51.5074, -0.1278, { precision: 4, rings: 2 })
```

### Parsing events

```typescript
import { parseGTags, bestGeohash } from 'geohash-kit/nostr'

const best = bestGeohash(event.tags)  // highest-precision g tag
const all = parseGTags(event.tags)    // [{ geohash, precision }, ...]
```

## API Reference

### `geohash-kit/core`

| Function | Description |
|----------|-------------|
| `encode(lat, lon, precision?)` | Encode coordinates to geohash (default precision 5) |
| `decode(hash)` | Decode to `{ lat, lon, error }` |
| `bounds(hash)` | Bounding rectangle `{ minLat, maxLat, minLon, maxLon }` |
| `children(hash)` | 32 child geohashes at next precision |
| `neighbour(hash, direction)` | Single adjacent cell |
| `neighbours(hash)` | All 8 adjacent cells |
| `contains(a, b)` | Bidirectional prefix containment |
| `matchesAny(hash, candidates)` | Match against multi-precision set |
| `distance(hashA, hashB)` | Haversine distance in metres |
| `distanceFromCoords(lat1, lon1, lat2, lon2)` | Haversine distance in metres |
| `radiusToPrecision(metres)` | Optimal precision for search radius |
| `precisionToRadius(precision)` | Approximate cell radius in metres |

### `geohash-kit/coverage`

| Function | Description |
|----------|-------------|
| `polygonToGeohashes(polygon, options?)` | Adaptive threshold polygon coverage |
| `geohashesToGeoJSON(hashes)` | GeoJSON FeatureCollection for map rendering |
| `geohashesToConvexHull(hashes)` | Convex hull reconstruction |
| `deduplicateGeohashes(hashes)` | Remove redundant ancestors |
| `pointInPolygon(point, polygon)` | Ray-casting point-in-polygon test |
| `boundsOverlapsPolygon(bounds, polygon)` | Bounds–polygon overlap test |
| `boundsFullyInsidePolygon(bounds, polygon)` | Bounds fully inside polygon test |

**`CoverageOptions`:** `{ minPrecision?, maxPrecision?, maxCells?, mergeThreshold? }`

### `geohash-kit/nostr`

| Function | Description |
|----------|-------------|
| `createGTagLadder(geohash, minPrecision?)` | Multi-precision g-tag ladder |
| `createGTagFilter(lat, lon, radiusMetres)` | REQ filter from coordinates |
| `createGTagFilterFromGeohashes(hashes)` | REQ filter from hash set |
| `expandRings(hash, rings?)` | Concentric neighbour rings |
| `nearbyFilter(lat, lon, options?)` | Encode + expand + filter |
| `parseGTags(tags)` | Extract g tags from event |
| `bestGeohash(tags)` | Highest-precision g tag |

## Polygon Coverage Algorithm

`polygonToGeohashes` uses adaptive threshold recursive subdivision:

1. BFS from precision-1 cells that overlap the polygon
2. For each cell: fully inside → emit (if deep enough); at max precision → emit if overlaps; partial → subdivide children
3. `mergeThreshold` controls interior cell granularity: 1.0 = uniform max precision, 0.0 = coarsest fully-inside cells
4. If result exceeds `maxCells`, `maxPrecision` is stepped down until the result fits
5. Post-processing merges complete sibling sets (all 32 children → parent). Result is sorted and deduplicated

## Comparison

| Feature | geohash-kit | ngeohash | geohashing | geohash-poly | nostr-geotags |
|---------|-------------|----------|------------|--------------|---------------|
| TypeScript native | Yes | No | Yes | No | Yes |
| ESM-only | Yes | No | Yes | No | Yes |
| Polygon coverage | Adaptive | No | No | Brute-force | No |
| GeoJSON output | Yes | No | Yes | No | No |
| Convex hull | Yes | No | No | No | No |
| Distance utils | Yes | No | No | No | No |
| Nostr g-tag ladders | Yes | No | No | No | Partial |
| Nostr REQ filters | Yes | No | No | No | No |
| Ring expansion | Yes | No | No | No | No |
| Zero dependencies | Yes | Yes | Yes | No | Yes |

## For AI Assistants

See [llms.txt](./llms.txt) for a concise API summary, or [llms-full.txt](./llms-full.txt) for the complete reference with examples.

## Licence

[MIT](./LICENCE)
