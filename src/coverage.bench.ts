import { bench, describe } from 'vitest'
import {
  polygonToGeohashes,
  geohashesToGeoJSON,
  geohashesToConvexHull,
  deduplicateGeohashes,
  pointInPolygon,
} from './coverage.ts'
import type { GeoJSONPolygon } from './geojson.ts'

// Small square (~1km²)
const SMALL: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [[[-0.13, 51.5], [-0.12, 51.5], [-0.12, 51.51], [-0.13, 51.51], [-0.13, 51.5]]],
}

// Medium polygon (~10km²)
const MEDIUM: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [[[-0.2, 51.48], [-0.08, 51.48], [-0.08, 51.56], [-0.2, 51.56], [-0.2, 51.48]]],
}

// Large polygon (London rough outline, ~5 vertices)
const LARGE: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [[
    [-0.51, 51.286],
    [0.334, 51.286],
    [0.334, 51.692],
    [-0.51, 51.692],
    [-0.51, 51.286],
  ]],
}

describe('polygonToGeohashes — small polygon', () => {
  bench('precision 6–7', () => polygonToGeohashes(SMALL, { minPrecision: 6, maxPrecision: 7 }))
  bench('precision 6–8', () => polygonToGeohashes(SMALL, { minPrecision: 6, maxPrecision: 8 }))
})

describe('polygonToGeohashes — medium polygon', () => {
  bench('precision 5–7, maxCells 200', () =>
    polygonToGeohashes(MEDIUM, { minPrecision: 5, maxPrecision: 7, maxCells: 200 }),
  )
  bench('precision 5–7, maxCells 500', () =>
    polygonToGeohashes(MEDIUM, { minPrecision: 5, maxPrecision: 7, maxCells: 500 }),
  )
})

describe('polygonToGeohashes — large polygon', () => {
  bench('precision 4–6, maxCells 100', () =>
    polygonToGeohashes(LARGE, { minPrecision: 4, maxPrecision: 6, maxCells: 100 }),
  )
  bench('precision 5–7, maxCells 500', () =>
    polygonToGeohashes(LARGE, { minPrecision: 5, maxPrecision: 7, maxCells: 500 }),
  )
})

describe('geohashesToGeoJSON', () => {
  const hashes50 = polygonToGeohashes(MEDIUM, { minPrecision: 5, maxPrecision: 6, maxCells: 50 })
  bench('~50 hashes', () => geohashesToGeoJSON(hashes50))
})

describe('geohashesToConvexHull', () => {
  const hashes = polygonToGeohashes(MEDIUM, { minPrecision: 5, maxPrecision: 6, maxCells: 100 })
  bench('~100 hashes', () => geohashesToConvexHull(hashes))
})

describe('deduplicateGeohashes', () => {
  const mixed = polygonToGeohashes(MEDIUM, { minPrecision: 4, maxPrecision: 7, maxCells: 300 })
  bench('~300 mixed-precision hashes', () => deduplicateGeohashes(mixed))
})

describe('pointInPolygon', () => {
  bench('inside MEDIUM', () => pointInPolygon([-0.14, 51.52], MEDIUM.coordinates[0]))
  bench('outside MEDIUM', () => pointInPolygon([2.35, 48.85], MEDIUM.coordinates[0]))
})
