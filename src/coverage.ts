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
 * Edges always subdivide to maxPrecision for a tight boundary. Interior
 * cells use the coarsest precision allowed by mergeThreshold. If the result
 * exceeds maxCells, maxPrecision is stepped down until it fits.
 */
export function polygonToGeohashes(
  polygon: [number, number][],
  options: CoverageOptions = {},
): string[] {
  // Guard: antimeridian-crossing polygons are not supported
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length
    if (Math.abs(polygon[i][0] - polygon[j][0]) > 180) {
      throw new Error('Polygons crossing the antimeridian (±180° longitude) are not supported')
    }
  }

  const { minPrecision: rawMin = 1, maxPrecision: rawMax = 9, maxCells = 500, mergeThreshold: rawThreshold = 1.0 } = options
  const minPrecision = Math.max(1, Math.min(9, Math.round(rawMin)))
  const maxPrecision = Math.max(minPrecision, Math.min(9, Math.round(rawMax)))
  const threshold = Math.max(0, Math.min(1, rawThreshold))

  // Early bailout limit
  const bailout = maxCells * 4

  // Try at requested maxPrecision, stepping down if too many cells
  for (let mp = maxPrecision; mp >= minPrecision; mp--) {
    const result = computeGeohashes(polygon, minPrecision, mp, threshold, bailout)
    if (result !== null && result.length <= maxCells) return result
  }

  // Fallback: minPrecision with threshold=0
  return computeGeohashes(polygon, minPrecision, minPrecision, 0) ?? []
}

/**
 * Compute geohashes covering a polygon via greedy recursive subdivision.
 *
 * - Edges always subdivide to maxPrecision (tight boundary).
 * - Interior cells emit at the coarsest precision allowed by coverageThreshold.
 *   threshold 1.0 → interior at maxPrecision (uniform cells, most cells).
 *   threshold 0.0 → interior at minPrecision (coarsest blocks, fewest cells).
 * - Only fully-inside cells are emitted below maxPrecision, so no blocks
 *   extend outside the polygon boundary.
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

  // Pre-compute polygon AABB for fast rejection.
  let polyMinLon = Infinity, polyMaxLon = -Infinity
  let polyMinLat = Infinity, polyMaxLat = -Infinity
  for (const [lon, lat] of polygon) {
    if (lon < polyMinLon) polyMinLon = lon
    if (lon > polyMaxLon) polyMaxLon = lon
    if (lat < polyMinLat) polyMinLat = lat
    if (lat > polyMaxLat) polyMaxLat = lat
  }

  // Interior cells must reach at least this precision before being emitted.
  // At threshold 1.0 → all cells at maxPrecision (uniform).
  // At threshold 0.0 → interior cells as coarse as minPrecision.
  const interiorMinPrecision = Math.ceil(
    minPrecision + (maxPrecision - minPrecision) * coverageThreshold,
  )

  // Seed: precision-1 cells filtered by AABB then polygon overlap.
  const queue = geohashChildren('').filter((hash) => {
    const b = geohashBounds(hash)
    if (b.maxLon < polyMinLon || b.minLon > polyMaxLon ||
        b.maxLat < polyMinLat || b.minLat > polyMaxLat) return false
    return boundsOverlapsPolygon(b, polygon)
  })

  while (queue.length > 0) {
    const hash = queue.pop()!
    const b = geohashBounds(hash)

    if (boundsFullyInsidePolygon(b, polygon)) {
      if (hash.length >= interiorMinPrecision) {
        result.push(hash)
      } else {
        for (const child of geohashChildren(hash)) {
          queue.push(child)
        }
      }
    } else if (hash.length >= maxPrecision) {
      result.push(hash)
    } else {
      for (const child of geohashChildren(hash)) {
        const cb = geohashBounds(child)
        // Fast AABB rejection before expensive polygon checks
        if (cb.maxLon < polyMinLon || cb.minLon > polyMaxLon ||
            cb.maxLat < polyMinLat || cb.minLat > polyMaxLat) continue
        if (boundsFullyInsidePolygon(cb, polygon)) {
          if (child.length >= interiorMinPrecision) {
            result.push(child)
          } else {
            queue.push(child)
          }
        } else if (boundsOverlapsPolygon(cb, polygon)) {
          queue.push(child)
        }
      }
    }

    if (result.length > limit) return null
  }

  return mergeCompleteSiblings(result, minPrecision).sort()
}

/**
 * Post-processing merge: bottom-up consolidation of complete sibling sets.
 * When all 32 children of a parent are present, replace them with the parent.
 * This is safe because 32 children tile the parent perfectly — coverage is unchanged.
 * Iterates from finest to coarsest so merges can cascade.
 */
function mergeCompleteSiblings(hashes: string[], minPrecision: number): string[] {
  const set = new Set(hashes)
  let maxP = 0
  for (const h of set) {
    if (h.length > maxP) maxP = h.length
  }

  for (let p = maxP; p > minPrecision; p--) {
    const parentCounts = new Map<string, number>()
    for (const h of set) {
      if (h.length === p) {
        const parent = h.slice(0, -1)
        parentCounts.set(parent, (parentCounts.get(parent) ?? 0) + 1)
      }
    }

    for (const [parent, count] of parentCounts) {
      if (count === 32) {
        // All 32 siblings present — replace with parent
        for (const ch of geohashChildren(parent)) {
          set.delete(ch)
        }
        set.add(parent)
      }
    }
  }

  return Array.from(set)
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
 * Remove redundant geohashes and merge complete sibling groups.
 * 1. Remove any geohash whose ancestor (shorter prefix) is already in the set.
 * 2. Merge complete sibling sets (all 32 children → parent) bottom-up.
 * Optimises for the smallest possible array.
 */
export function deduplicateGeohashes(hashes: string[]): string[] {
  // Step 1: remove children when ancestor is present
  const set = new Set(hashes)
  const filtered = Array.from(set).filter((h) => {
    for (let len = 1; len < h.length; len++) {
      if (set.has(h.slice(0, len))) return false
    }
    return true
  })

  // Step 2: merge complete sibling groups bottom-up
  return mergeCompleteSiblings(filtered, 1).sort()
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
