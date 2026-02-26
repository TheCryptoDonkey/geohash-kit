import { bench, describe } from 'vitest'
import {
  encode,
  decode,
  bounds,
  neighbours,
  children,
  contains,
  matchesAny,
  neighbour,
  distanceFromCoords,
  distance,
  radiusToPrecision,
  precisionToRadius,
} from './core.ts'

const LAT = 51.5074
const LON = -0.1278
const HASH5 = 'gcpvj'
const HASH7 = 'gcpvj0s'

describe('encode', () => {
  bench('precision 3', () => encode(LAT, LON, 3))
  bench('precision 5', () => encode(LAT, LON, 5))
  bench('precision 7', () => encode(LAT, LON, 7))
  bench('precision 9', () => encode(LAT, LON, 9))
})

describe('decode', () => {
  bench('precision 5', () => decode(HASH5))
  bench('precision 7', () => decode(HASH7))
})

describe('bounds', () => {
  bench('precision 5', () => bounds(HASH5))
  bench('precision 7', () => bounds(HASH7))
})

describe('neighbours', () => {
  bench('precision 5', () => neighbours(HASH5))
  bench('precision 7', () => neighbours(HASH7))
})

describe('children', () => {
  bench('precision 5 → 6', () => children(HASH5))
})

describe('contains', () => {
  bench('prefix match', () => contains(HASH5, HASH7))
  bench('no match', () => contains('u10', HASH5))
})

describe('matchesAny', () => {
  const candidates = ['gc', 'gcpvj', 'u10', 'ezs4']
  bench('4 candidates', () => matchesAny(HASH7, candidates))
})

describe('distanceFromCoords', () => {
  bench('London → Paris', () => distanceFromCoords(51.5074, -0.1278, 48.8566, 2.3522))
})

describe('radiusToPrecision', () => {
  bench('100m', () => radiusToPrecision(100))
  bench('5000m', () => radiusToPrecision(5000))
})

describe('precisionToRadius', () => {
  bench('precision 5', () => precisionToRadius(5))
  bench('precision 9', () => precisionToRadius(9))
})
