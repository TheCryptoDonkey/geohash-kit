// geohash-kit/core — encode, decode, bounds, children, contains, matchesAny

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'
const BASE32_DECODE: Record<string, number> = {}
for (let i = 0; i < BASE32.length; i++) BASE32_DECODE[BASE32[i]] = i

// --- Types ---

export interface GeohashBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

export type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

// --- Encoding ---

/** Encode latitude/longitude to a geohash string. Default precision 5 (~4.9km). */
export function encode(lat: number, lon: number, precision = 5): string {
  let latMin = -90, latMax = 90
  let lonMin = -180, lonMax = 180
  let hash = ''
  let bit = 0
  let ch = 0
  let isLon = true

  while (hash.length < precision) {
    if (isLon) {
      const mid = (lonMin + lonMax) / 2
      if (lon >= mid) { ch |= 1 << (4 - bit); lonMin = mid } else { lonMax = mid }
    } else {
      const mid = (latMin + latMax) / 2
      if (lat >= mid) { ch |= 1 << (4 - bit); latMin = mid } else { latMax = mid }
    }
    isLon = !isLon
    bit++
    if (bit === 5) { hash += BASE32[ch]; bit = 0; ch = 0 }
  }
  return hash
}

/** Decode a geohash to its centre point with error margins. */
export function decode(hash: string): { lat: number; lon: number; error: { lat: number; lon: number } } {
  const b = bounds(hash)
  return {
    lat: (b.minLat + b.maxLat) / 2,
    lon: (b.minLon + b.maxLon) / 2,
    error: {
      lat: (b.maxLat - b.minLat) / 2,
      lon: (b.maxLon - b.minLon) / 2,
    },
  }
}

/** Get the bounding rectangle of a geohash cell. */
export function bounds(hash: string): GeohashBounds {
  let minLat = -90, maxLat = 90
  let minLon = -180, maxLon = 180
  let isLon = true

  for (const ch of hash) {
    const bits = BASE32_DECODE[ch]
    for (let bit = 4; bit >= 0; bit--) {
      if (isLon) {
        const mid = (minLon + maxLon) / 2
        if ((bits >> bit) & 1) minLon = mid; else maxLon = mid
      } else {
        const mid = (minLat + maxLat) / 2
        if ((bits >> bit) & 1) minLat = mid; else maxLat = mid
      }
      isLon = !isLon
    }
  }
  return { minLat, maxLat, minLon, maxLon }
}

/** Get the 32 children of a geohash at the next precision level. */
export function children(hash: string): string[] {
  return Array.from(BASE32, (ch) => hash + ch)
}

// --- Matching ---

/** Check if two geohashes overlap (bidirectional prefix containment). */
export function contains(a: string, b: string): boolean {
  return a.startsWith(b) || b.startsWith(a)
}

/** Check if a geohash matches any candidate in a multi-precision set. */
export function matchesAny(hash: string, candidates: string[]): boolean {
  return candidates.some(c => contains(hash, c))
}

// --- Neighbours ---

/** Get a single adjacent geohash cell in the given direction. */
export function neighbour(hash: string, direction: Direction): string {
  const b = bounds(hash)
  const latHeight = b.maxLat - b.minLat
  const lonWidth = b.maxLon - b.minLon
  const centreLat = (b.minLat + b.maxLat) / 2
  const centreLon = (b.minLon + b.maxLon) / 2

  let dLat = 0
  let dLon = 0

  if (direction.includes('n')) dLat = latHeight
  if (direction.includes('s')) dLat = -latHeight
  if (direction.includes('e')) dLon = lonWidth
  if (direction.includes('w')) dLon = -lonWidth

  let newLat = centreLat + dLat
  let newLon = centreLon + dLon

  // Wrap longitude around the antimeridian
  if (newLon > 180) newLon -= 360
  if (newLon < -180) newLon += 360

  // Clamp latitude at poles (no wrapping)
  newLat = Math.max(-89.99999, Math.min(89.99999, newLat))

  return encode(newLat, newLon, hash.length)
}

/** Get all 8 adjacent geohash cells. */
export function neighbours(hash: string): Record<Direction, string> {
  return {
    n: neighbour(hash, 'n'),
    ne: neighbour(hash, 'ne'),
    e: neighbour(hash, 'e'),
    se: neighbour(hash, 'se'),
    s: neighbour(hash, 's'),
    sw: neighbour(hash, 'sw'),
    w: neighbour(hash, 'w'),
    nw: neighbour(hash, 'nw'),
  }
}

// --- Distance ---

const EARTH_RADIUS_M = 6_371_000 // Earth mean radius in metres

/** Haversine distance in metres between two coordinate pairs. */
export function distanceFromCoords(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Haversine distance in metres between centres of two geohash cells. */
export function distance(hashA: string, hashB: string): number {
  const a = decode(hashA)
  const b = decode(hashB)
  return distanceFromCoords(a.lat, a.lon, b.lat, b.lon)
}

// --- Precision ↔ Radius ---

// Approximate cell half-diagonal in metres at each precision level (equator).
const PRECISION_RADIUS_M: number[] = [
  /* 0 (unused) */ 0,
  /* 1 */ 2_500_000,
  /* 2 */ 630_000,
  /* 3 */ 78_000,
  /* 4 */ 20_000,
  /* 5 */ 2_400,
  /* 6 */ 610,
  /* 7 */ 76,
  /* 8 */ 19,
  /* 9 */ 2.4,
]

/** Optimal geohash precision for a given search radius in metres. */
export function radiusToPrecision(metres: number): number {
  for (let p = 1; p <= 9; p++) {
    if (PRECISION_RADIUS_M[p] <= metres) return p
  }
  return 9
}

/** Approximate cell radius in metres for a given precision level. */
export function precisionToRadius(precision: number): number {
  const p = Math.max(1, Math.min(9, Math.round(precision)))
  return PRECISION_RADIUS_M[p]
}
