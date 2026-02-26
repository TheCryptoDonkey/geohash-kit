import { describe, it, expect } from 'vitest'
import {
  encode, decode, bounds, children, contains, matchesAny,
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
