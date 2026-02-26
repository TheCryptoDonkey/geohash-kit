import { describe, it, expect } from 'vitest'
import { createGTagLadder, parseGTags, bestGeohash } from './nostr.js'

describe('createGTagLadder', () => {
  it('generates a ladder from precision 1 to the hash length', () => {
    const ladder = createGTagLadder('gcpvj')
    expect(ladder).toEqual([
      ['g', 'g'],
      ['g', 'gc'],
      ['g', 'gcp'],
      ['g', 'gcpv'],
      ['g', 'gcpvj'],
    ])
  })

  it('respects minPrecision', () => {
    const ladder = createGTagLadder('gcpvj', 3)
    expect(ladder).toEqual([
      ['g', 'gcp'],
      ['g', 'gcpv'],
      ['g', 'gcpvj'],
    ])
  })

  it('returns single tag for precision-1 hash', () => {
    const ladder = createGTagLadder('g')
    expect(ladder).toEqual([['g', 'g']])
  })

  it('returns empty array for empty string', () => {
    expect(createGTagLadder('')).toEqual([])
  })
})

describe('parseGTags', () => {
  it('extracts g tags from a tag array', () => {
    const tags = [['g', 'gcpvj'], ['p', 'abc123'], ['g', 'gcpv'], ['g', 'gcp']]
    const result = parseGTags(tags)
    expect(result).toEqual([
      { geohash: 'gcpvj', precision: 5 },
      { geohash: 'gcpv', precision: 4 },
      { geohash: 'gcp', precision: 3 },
    ])
  })

  it('returns empty array when no g tags present', () => {
    expect(parseGTags([['p', 'abc'], ['e', 'def']])).toEqual([])
  })

  it('handles empty tag array', () => {
    expect(parseGTags([])).toEqual([])
  })

  it('ignores malformed tags', () => {
    const tags = [['g'], ['g', ''], ['g', 'gcpvj']]
    const result = parseGTags(tags)
    expect(result).toEqual([{ geohash: 'gcpvj', precision: 5 }])
  })
})

describe('bestGeohash', () => {
  it('returns the highest-precision g tag', () => {
    const tags = [['g', 'g'], ['g', 'gc'], ['g', 'gcp'], ['g', 'gcpv'], ['g', 'gcpvj']]
    expect(bestGeohash(tags)).toBe('gcpvj')
  })

  it('returns undefined when no g tags present', () => {
    expect(bestGeohash([['p', 'abc']])).toBeUndefined()
  })

  it('returns undefined for empty tag array', () => {
    expect(bestGeohash([])).toBeUndefined()
  })
})
