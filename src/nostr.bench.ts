import { bench, describe } from 'vitest'
import {
  createGTagLadder,
  parseGTags,
  expandRings,
  createGTagFilter,
  createGTagFilterFromGeohashes,
  nearbyFilter,
} from './nostr.ts'
import { encode } from './core.ts'

const HASH6 = encode(51.5074, -0.1278, 6)

describe('createGTagLadder', () => {
  bench('minPrecision 1', () => createGTagLadder(HASH6, 1))
  bench('minPrecision 3', () => createGTagLadder(HASH6, 3))
})

describe('expandRings', () => {
  bench('1 ring', () => expandRings(HASH6, 1))
  bench('3 rings', () => expandRings(HASH6, 3))
  bench('5 rings', () => expandRings(HASH6, 5))
})

describe('createGTagFilter', () => {
  bench('100m radius', () => createGTagFilter(51.5074, -0.1278, 100))
  bench('1000m radius', () => createGTagFilter(51.5074, -0.1278, 1000))
  bench('10000m radius', () => createGTagFilter(51.5074, -0.1278, 10000))
})

describe('nearbyFilter', () => {
  bench('default options', () => nearbyFilter(51.5074, -0.1278))
})

describe('parseGTags', () => {
  const tags = createGTagLadder(HASH6)
  bench('full ladder', () => parseGTags(tags))
})
