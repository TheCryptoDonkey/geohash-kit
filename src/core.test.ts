import { describe, it, expect } from 'vitest'
import {
  encode, decode, bounds, children, contains, matchesAny,
  neighbour, neighbours,
  distance, distanceFromCoords, radiusToPrecision, precisionToRadius,
  type GeohashBounds,
} from './core.js'

describe('encode', () => {
  it('encodes London (51.5074, -0.1278) to gcpvj at precision 5', () => {
    expect(encode(51.5074, -0.1278, 5)).toBe('gcpvj')
  })

  it('defaults to precision 5', () => {
    expect(encode(51.5074, -0.1278).length).toBe(5)
  })

  it('respects custom precision', () => {
    const h3 = encode(51.5074, -0.1278, 3)
    const h7 = encode(51.5074, -0.1278, 7)
    expect(h3.length).toBe(3)
    expect(h7.length).toBe(7)
    expect(h7.startsWith(h3)).toBe(true)
  })

  it('encodes equator/prime meridian (0, 0) to s0000', () => {
    expect(encode(0, 0, 5)).toBe('s0000')
  })

  it('encodes extreme coordinates', () => {
    expect(encode(90, -180, 1)).toBe('b')
    expect(encode(-90, 180, 1)).toBe('p')
  })
})

describe('decode', () => {
  it('decodes gcpvj to approximately (51.51, -0.13)', () => {
    const { lat, lon } = decode('gcpvj')
    expect(lat).toBeCloseTo(51.51, 1)
    expect(lon).toBeCloseTo(-0.13, 1)
  })

  it('returns error margins that shrink with precision', () => {
    const d5 = decode('gcpvj')
    const d7 = decode('gcpvjbs')
    expect(d7.error.lat).toBeLessThan(d5.error.lat)
    expect(d7.error.lon).toBeLessThan(d5.error.lon)
  })

  it('decode is inverse of encode (within error margins)', () => {
    const lat = 51.5074
    const lon = -0.1278
    const hash = encode(lat, lon, 7)
    const decoded = decode(hash)
    expect(Math.abs(decoded.lat - lat)).toBeLessThanOrEqual(decoded.error.lat)
    expect(Math.abs(decoded.lon - lon)).toBeLessThanOrEqual(decoded.error.lon)
  })
})

describe('bounds', () => {
  it('returns full world bounds for empty string', () => {
    expect(bounds('')).toEqual({ minLat: -90, maxLat: 90, minLon: -180, maxLon: 180 })
  })

  it('returns correct bounds for precision-1 geohash "g"', () => {
    const b = bounds('g')
    expect(b.minLat).toBeCloseTo(45, 0)
    expect(b.maxLat).toBeCloseTo(90, 0)
    expect(b.minLon).toBeCloseTo(-45, 0)
    expect(b.maxLon).toBeCloseTo(0, 0)
  })

  it('returns narrower bounds at higher precision', () => {
    const b5 = bounds('gcpvj')
    const b3 = bounds('gcp')
    expect(b5.maxLat - b5.minLat).toBeLessThan(b3.maxLat - b3.minLat)
    expect(b5.maxLon - b5.minLon).toBeLessThan(b3.maxLon - b3.minLon)
  })

  it('bounds contain the decoded centre point', () => {
    const b = bounds('gcpvj')
    const { lat, lon } = decode('gcpvj')
    expect(lat).toBeGreaterThanOrEqual(b.minLat)
    expect(lat).toBeLessThanOrEqual(b.maxLat)
    expect(lon).toBeGreaterThanOrEqual(b.minLon)
    expect(lon).toBeLessThanOrEqual(b.maxLon)
  })
})

describe('children', () => {
  it('returns 32 children for any geohash', () => {
    expect(children('g')).toHaveLength(32)
  })

  it('each child starts with the parent', () => {
    for (const child of children('gcp')) {
      expect(child.startsWith('gcp')).toBe(true)
      expect(child).toHaveLength(4)
    }
  })

  it('children are unique', () => {
    const c = children('gc')
    expect(new Set(c).size).toBe(32)
  })

  it('returns 32 top-level geohashes for empty string', () => {
    const c = children('')
    expect(c).toHaveLength(32)
    expect(c).toContain('g')
    expect(c).toContain('0')
    expect(c).toContain('z')
  })
})

describe('contains', () => {
  it('matches exact same geohash', () => {
    expect(contains('gcvdn', 'gcvdn')).toBe(true)
  })

  it('matches when first is a prefix of second', () => {
    expect(contains('gcvd', 'gcvdn')).toBe(true)
  })

  it('matches when second is a prefix of first', () => {
    expect(contains('gcvdn', 'gcvd')).toBe(true)
  })

  it('rejects sibling cells at same precision', () => {
    expect(contains('gcvdn', 'gcvdp')).toBe(false)
  })

  it('handles single-character precision', () => {
    expect(contains('g', 'gcvdn')).toBe(true)
    expect(contains('u', 'gcvdn')).toBe(false)
  })
})

describe('matchesAny', () => {
  it('matches when candidates contain an exact match', () => {
    expect(matchesAny('gcvdn', ['gcpvj', 'gcvdn', 'u10h'])).toBe(true)
  })

  it('matches when a candidate is a prefix', () => {
    expect(matchesAny('gcvdn', ['gcpvj', 'gcvd', 'u10h'])).toBe(true)
  })

  it('matches when the geohash is a prefix of a candidate', () => {
    expect(matchesAny('gcvd', ['gcpvj', 'gcvdn', 'u10h'])).toBe(true)
  })

  it('rejects when no candidate overlaps', () => {
    expect(matchesAny('gcvdn', ['gcpvj', 'u10h', 'gcwe'])).toBe(false)
  })

  it('handles empty candidates list', () => {
    expect(matchesAny('gcvdn', [])).toBe(false)
  })
})

describe('neighbour', () => {
  it('returns the north neighbour of gcpvj', () => {
    const n = neighbour('gcpvj', 'n')
    expect(n.length).toBe(5)
    expect(n).not.toBe('gcpvj')
    // North neighbour's south boundary should equal gcpvj's north boundary
    const original = bounds('gcpvj')
    const adj = bounds(n)
    expect(adj.minLat).toBeCloseTo(original.maxLat, 10)
  })

  it('returns the east neighbour of gcpvj', () => {
    const e = neighbour('gcpvj', 'e')
    const original = bounds('gcpvj')
    const adj = bounds(e)
    expect(adj.minLon).toBeCloseTo(original.maxLon, 10)
  })

  it('handles precision 1', () => {
    const n = neighbour('s', 'n')
    expect(n.length).toBe(1)
    expect(n).not.toBe('s')
  })

  it('handles antimeridian wrapping (east of z-column)', () => {
    // A geohash near lon 180 should wrap to near lon -180
    const hash = encode(0, 179.99, 3)
    const e = neighbour(hash, 'e')
    const eBounds = bounds(e)
    // The east neighbour should be near -180 (wrapped)
    expect(eBounds.minLon).toBeLessThan(-170)
  })
})

describe('neighbours', () => {
  it('returns 8 distinct neighbours', () => {
    const n = neighbours('gcpvj')
    const values = Object.values(n)
    expect(values).toHaveLength(8)
    expect(new Set(values).size).toBe(8)
    // None should be the original hash
    expect(values).not.toContain('gcpvj')
  })

  it('has correct keys', () => {
    const n = neighbours('gcpvj')
    expect(Object.keys(n).sort()).toEqual(['e', 'n', 'ne', 'nw', 's', 'se', 'sw', 'w'])
  })

  it('north neighbour bounds are adjacent', () => {
    const n = neighbours('gcpvj')
    const original = bounds('gcpvj')
    const northBounds = bounds(n.n)
    expect(northBounds.minLat).toBeCloseTo(original.maxLat, 10)
  })

  it('all neighbours have the same precision', () => {
    const n = neighbours('gcpvj')
    for (const v of Object.values(n)) {
      expect(v.length).toBe(5)
    }
  })
})

describe('distanceFromCoords', () => {
  it('returns 0 for same point', () => {
    expect(distanceFromCoords(51.5074, -0.1278, 51.5074, -0.1278)).toBe(0)
  })

  it('calculates London to Paris (~340km)', () => {
    const d = distanceFromCoords(51.5074, -0.1278, 48.8566, 2.3522)
    expect(d).toBeGreaterThan(330_000)
    expect(d).toBeLessThan(350_000)
  })

  it('calculates equator distance (1 degree ~111km)', () => {
    const d = distanceFromCoords(0, 0, 0, 1)
    expect(d).toBeGreaterThan(110_000)
    expect(d).toBeLessThan(112_000)
  })
})

describe('distance', () => {
  it('returns distance between two geohash cell centres', () => {
    const d = distance('gcpvj', 'u09tu') // London to Paris
    expect(d).toBeGreaterThan(300_000)
    expect(d).toBeLessThan(400_000)
  })

  it('returns 0 for same geohash', () => {
    expect(distance('gcpvj', 'gcpvj')).toBe(0)
  })

  it('returns small distance for adjacent cells', () => {
    const n = neighbour('gcpvj', 'n')
    const d = distance('gcpvj', n)
    // Adjacent precision-5 cells should be within ~5km
    expect(d).toBeLessThan(10_000)
    expect(d).toBeGreaterThan(0)
  })
})

describe('radiusToPrecision', () => {
  it('returns 1 for very large radius (>2500km)', () => {
    expect(radiusToPrecision(5_000_000)).toBe(1)
  })

  it('returns 5 for ~2.5km radius', () => {
    expect(radiusToPrecision(2_500)).toBe(5)
  })

  it('returns 7 for ~80m radius', () => {
    expect(radiusToPrecision(80)).toBe(7)
  })

  it('returns 9 for very small radius (<3m)', () => {
    expect(radiusToPrecision(2)).toBe(9)
  })

  it('monotonically increases with decreasing radius', () => {
    const radii = [5_000_000, 500_000, 50_000, 5_000, 500, 50, 5]
    const precisions = radii.map(radiusToPrecision)
    for (let i = 1; i < precisions.length; i++) {
      expect(precisions[i]).toBeGreaterThanOrEqual(precisions[i - 1])
    }
  })
})

describe('precisionToRadius', () => {
  it('returns large radius for precision 1', () => {
    expect(precisionToRadius(1)).toBeGreaterThan(2_000_000)
  })

  it('returns ~2.4km for precision 5', () => {
    const r = precisionToRadius(5)
    expect(r).toBeGreaterThan(2_000)
    expect(r).toBeLessThan(3_000)
  })

  it('returns small radius for precision 9', () => {
    expect(precisionToRadius(9)).toBeLessThan(5)
  })

  it('is approximate inverse of radiusToPrecision', () => {
    for (let p = 1; p <= 9; p++) {
      const radius = precisionToRadius(p)
      const recovered = radiusToPrecision(radius)
      expect(recovered).toBe(p)
    }
  })
})
