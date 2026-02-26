// geohash-kit/coverage — polygon-to-geohash coverage, GeoJSON, convex hull

import { bounds as geohashBounds, children as geohashChildren } from './core.js'
import type { GeohashBounds } from './core.js'

// Re-export GeohashBounds for convenience
export type { GeohashBounds } from './core.js'

// --- Point-in-polygon (ray-casting) ---

/**
 * Ray-casting algorithm: test whether a point [x, y] lies inside a polygon.
 * Polygon is an array of [x, y] vertices (closed automatically).
 */
export function pointInPolygon(
  point: [number, number],
  polygon: [number, number][],
): boolean {
  const [px, py] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

/**
 * Test whether all four corners of bounds lie inside the polygon.
 */
export function boundsFullyInsidePolygon(
  bounds: GeohashBounds,
  polygon: [number, number][],
): boolean {
  const corners: [number, number][] = [
    [bounds.minLon, bounds.minLat],
    [bounds.maxLon, bounds.minLat],
    [bounds.maxLon, bounds.maxLat],
    [bounds.minLon, bounds.maxLat],
  ]
  if (!corners.every((c) => pointInPolygon(c, polygon))) return false

  // For concave polygons, all corners can be inside while the polygon edge
  // cuts through the cell. If any polygon edge intersects a cell edge, the
  // cell is not fully inside.
  const boundsEdges: [[number, number], [number, number]][] = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
  ]
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    for (const be of boundsEdges) {
      if (segmentsIntersect(be[0], be[1], polygon[j], polygon[i])) return false
    }
  }
  return true
}

/**
 * Test whether a bounds rectangle overlaps a polygon at all.
 * Checks: (1) any bounds corner inside polygon, (2) any polygon vertex inside bounds,
 * (3) any edge intersection.
 */
export function boundsOverlapsPolygon(
  bounds: GeohashBounds,
  polygon: [number, number][],
): boolean {
  const corners: [number, number][] = [
    [bounds.minLon, bounds.minLat],
    [bounds.maxLon, bounds.minLat],
    [bounds.maxLon, bounds.maxLat],
    [bounds.minLon, bounds.maxLat],
  ]

  // Any bounds corner inside polygon?
  if (corners.some((c) => pointInPolygon(c, polygon))) return true

  // Any polygon vertex inside bounds?
  for (const [px, py] of polygon) {
    if (px >= bounds.minLon && px <= bounds.maxLon && py >= bounds.minLat && py <= bounds.maxLat) {
      return true
    }
  }

  // Check edge intersections between bounds edges and polygon edges
  const boundsEdges: [[number, number], [number, number]][] = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
  ]

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const polyEdge: [[number, number], [number, number]] = [polygon[j], polygon[i]]
    for (const boundsEdge of boundsEdges) {
      if (segmentsIntersect(boundsEdge[0], boundsEdge[1], polyEdge[0], polyEdge[1])) {
        return true
      }
    }
  }

  return false
}

/** Test whether two line segments (a1->a2) and (b1->b2) intersect. */
function segmentsIntersect(
  a1: [number, number], a2: [number, number],
  b1: [number, number], b2: [number, number],
): boolean {
  const d1 = cross(b1, b2, a1)
  const d2 = cross(b1, b2, a2)
  const d3 = cross(a1, a2, b1)
  const d4 = cross(a1, a2, b2)

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }

  if (d1 === 0 && onSegment(b1, b2, a1)) return true
  if (d2 === 0 && onSegment(b1, b2, a2)) return true
  if (d3 === 0 && onSegment(a1, a2, b1)) return true
  if (d4 === 0 && onSegment(a1, a2, b2)) return true

  return false
}

function cross(a: [number, number], b: [number, number], c: [number, number]): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
}

function onSegment(a: [number, number], b: [number, number], p: [number, number]): boolean {
  return Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) &&
         Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1])
}

// --- polygonToGeohashes — recursive subdivision ---

export interface CoverageOptions {
  minPrecision?: number
  maxPrecision?: number
  maxCells?: number
  mergeThreshold?: number
}

/**
 * Convert a polygon (array of [lon, lat] vertices) to an efficient set of
 * multi-precision geohash strings using recursive subdivision.
 *
 * Always subdivides to maxPrecision (default 9) for full multi-precision
 * coverage. If the result exceeds maxCells, the threshold is auto-tightened
 * via binary search until it fits, preserving the full precision range.
 */
export function polygonToGeohashes(
  polygon: [number, number][],
  options: CoverageOptions = {},
): string[] {
  const { minPrecision = 1, maxPrecision = 9, maxCells = 500, mergeThreshold: rawThreshold = 1.0 } = options
  const threshold = Math.max(0, Math.min(1, rawThreshold))

  // Early bailout limit
  const bailout = maxCells * 4

  // First attempt with the requested threshold
  const first = computeGeohashes(polygon, minPrecision, maxPrecision, threshold, bailout)
  if (first !== null && first.length <= maxCells) return first

  // Too many cells — binary-search downward on threshold to reduce cell count.
  let lo = 0
  let hi = threshold
  let best: string[] | null = first

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    const attempt = computeGeohashes(polygon, minPrecision, maxPrecision, mid, bailout)
    if (attempt !== null && attempt.length <= maxCells) {
      best = attempt
      lo = mid
    } else {
      hi = mid
    }
    if (hi - lo < 0.005) break
  }

  if (best !== null && best.length <= maxCells) return best

  // Fallback: threshold=0 means any partial overlap triggers inclusion at parent level
  return computeGeohashes(polygon, minPrecision, maxPrecision, 0) ?? []
}

/**
 * Compute geohashes covering a polygon via greedy recursive subdivision.
 *
 * coverageThreshold controls the minimum precision for interior cells:
 *   1.0 → all cells at maxPrecision (tightest)
 *   0.0 → interior cells as coarse as minPrecision (loosest)
 */
function computeGeohashes(
  polygon: [number, number][],
  minPrecision: number,
  maxPrecision: number,
  coverageThreshold: number,
  bailout?: number,
): string[] | null {
  const result: string[] = []
  const limit = bailout ?? Infinity

  // Interior cells must reach at least this precision before being emitted.
  // At threshold 1.0 this equals maxPrecision (subdivide everything).
  // At threshold 0.0 this equals minPrecision (coarsest interior cells).
  const interiorMinPrecision = Math.ceil(
    minPrecision + (maxPrecision - minPrecision) * coverageThreshold,
  )

  // Seed: find all cells at minPrecision that overlap the polygon's bounding box
  const seed = minPrecision <= 1
    ? geohashChildren('')
    : geohashChildren('').flatMap((c) => expandToDepth(c, minPrecision))

  const queue = seed.filter((hash) => {
    const b = geohashBounds(hash)
    return boundsOverlapsPolygon(b, polygon)
  })

  while (queue.length > 0) {
    const hash = queue.pop()!
    const b = geohashBounds(hash)

    if (boundsFullyInsidePolygon(b, polygon)) {
      if (hash.length >= interiorMinPrecision) {
        // At or past target interior precision — emit
        result.push(hash)
      } else {
        // Not deep enough yet — subdivide further
        for (const child of geohashChildren(hash)) {
          queue.push(child)
        }
      }
    } else if (hash.length >= maxPrecision) {
      // At max precision — include any cell that overlaps the polygon.
      result.push(hash)
    } else {
      // Partially overlapping — classify children
      const children = geohashChildren(hash)
      const fullyInside: string[] = []
      const partiallyOverlapping: string[] = []

      for (const child of children) {
        const cb = geohashBounds(child)
        if (boundsFullyInsidePolygon(cb, polygon)) {
          fullyInside.push(child)
        } else if (boundsOverlapsPolygon(cb, polygon)) {
          partiallyOverlapping.push(child)
        }
      }

      // Merge decision: only merge (keep parent) if we're at or past the
      // interior target precision AND enough children are fully covered.
      const effectiveMinCount = Math.max(1, Math.ceil(coverageThreshold * 32))

      if (hash.length >= interiorMinPrecision && fullyInside.length >= effectiveMinCount) {
        // Enough children are fully covered and at target depth — include at this precision
        result.push(hash)
      } else {
        // Not enough coverage or not deep enough — subdivide
        for (const child of fullyInside) {
          queue.push(child)
        }
        for (const child of partiallyOverlapping) {
          queue.push(child)
        }
      }
    }

    if (result.length > limit) return null
  }

  return result.sort()
}

function expandToDepth(hash: string, targetLength: number): string[] {
  if (hash.length >= targetLength) return [hash]
  return geohashChildren(hash).flatMap((c) => expandToDepth(c, targetLength))
}

// --- geohashesToConvexHull — reconstruct editable polygon ---

/** 2D cross product of vectors OA and OB where O is the origin. */
function cross2D(o: [number, number], a: [number, number], b: [number, number]): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
}

/**
 * Compute a convex hull polygon from an array of geohash strings.
 * Collects all unique cell corners, then builds the hull using
 * Andrew's monotone chain algorithm.
 * Returns `[lon, lat][]`.
 */
export function geohashesToConvexHull(hashes: string[]): [number, number][] {
  if (hashes.length === 0) return []

  // Collect unique corners from all geohash bounding boxes
  const seen = new Set<string>()
  const points: [number, number][] = []

  for (const hash of hashes) {
    const b = geohashBounds(hash)
    const corners: [number, number][] = [
      [b.minLon, b.minLat],
      [b.maxLon, b.minLat],
      [b.maxLon, b.maxLat],
      [b.minLon, b.maxLat],
    ]
    for (const c of corners) {
      const key = `${c[0]},${c[1]}`
      if (!seen.has(key)) {
        seen.add(key)
        points.push(c)
      }
    }
  }

  if (points.length < 3) return points

  // Sort by x then y
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1])

  // Andrew's monotone chain — lower hull
  const lower: [number, number][] = []
  for (const p of points) {
    while (lower.length >= 2 && cross2D(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop()
    }
    lower.push(p)
  }

  // Upper hull
  const upper: [number, number][] = []
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i]
    while (upper.length >= 2 && cross2D(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop()
    }
    upper.push(p)
  }

  // Remove last point of each half because it's repeated
  lower.pop()
  upper.pop()

  return [...lower, ...upper]
}

// --- deduplicateGeohashes ---

/**
 * Remove redundant geohashes from a combined multi-precision set.
 * Any geohash whose ancestor (shorter prefix) is also in the set is redundant.
 */
export function deduplicateGeohashes(hashes: string[]): string[] {
  const set = new Set(hashes)
  return Array.from(set).filter((h) => {
    for (let len = 1; len < h.length; len++) {
      if (set.has(h.slice(0, len))) return false
    }
    return true
  }).sort()
}

// --- geohashesToGeoJSON ---

export interface GeohashGeoJSON {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    geometry: { type: 'Polygon'; coordinates: [number, number][][] }
    properties: { geohash: string; precision: number }
  }[]
}

/**
 * Convert an array of geohash strings to a GeoJSON FeatureCollection
 * of polygon rectangles, suitable for rendering on a MapLibre map.
 */
export function geohashesToGeoJSON(hashes: string[]): GeohashGeoJSON {
  return {
    type: 'FeatureCollection',
    features: hashes.map((hash) => {
      const b = geohashBounds(hash)
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [b.minLon, b.minLat],
            [b.maxLon, b.minLat],
            [b.maxLon, b.maxLat],
            [b.minLon, b.maxLat],
            [b.minLon, b.minLat],
          ]],
        },
        properties: { geohash: hash, precision: hash.length },
      }
    }),
  }
}
