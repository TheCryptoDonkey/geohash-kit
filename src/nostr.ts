// geohash-kit/nostr — Nostr g-tag utilities

import { encode, neighbours, radiusToPrecision } from './core.js'

// --- Publishing (event tags) ---

/** Generate multi-precision g-tag ladder for Nostr event publishing. */
export function createGTagLadder(geohash: string, minPrecision = 1): string[][] {
  const tags: string[][] = []
  for (let p = Math.max(1, minPrecision); p <= geohash.length; p++) {
    tags.push(['g', geohash.slice(0, p)])
  }
  return tags
}

// --- Parsing ---

/** Extract and parse g tags from a Nostr event's tag array. */
export function parseGTags(tags: string[][]): Array<{ geohash: string; precision: number }> {
  return tags
    .filter((t) => t[0] === 'g' && t[1] && t[1].length > 0)
    .map((t) => ({ geohash: t[1], precision: t[1].length }))
}

/** Return the highest-precision g tag from an event's tag array. */
export function bestGeohash(tags: string[][]): string | undefined {
  const parsed = parseGTags(tags)
  if (parsed.length === 0) return undefined
  return parsed.reduce((best, curr) => curr.precision > best.precision ? curr : best).geohash
}
