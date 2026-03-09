# Android Compatibility Contract

This document defines the cross-language contract for Android/Kotlin integrations that implement `geohash-kit` behavior without importing this TypeScript package directly.

## Goal

- Keep TS and Kotlin implementations aligned for core geohash and Nostr helper outputs.
- Use checked test vectors as the source of truth for parity.

## Contract Sources

- Vector schema: `vectors/schema.json`
- Versioned vectors:
  - `vectors/core.encode.v1.json`
  - `vectors/core.decode.v1.json`
  - `vectors/core.neighbours.v1.json`
  - `vectors/nostr.createGTagLadder.v1.json`
  - `vectors/nostr.nearbyFilter.v1.json`

## Behavioral Rules To Match

### `core.encode(lat, lon, precision?)`

- Latitude must be finite and in `[-90, 90]`.
- Longitude must be finite and in `[-180, 180]`.
- Precision must be finite, rounded to nearest integer, min `1`, max `12`.
- Invalid input throws `RangeError`.

### `core.decode(hash)`

- Empty hash throws `TypeError`.
- Non-base32 characters throw `TypeError`.
- Returns center point and half-cell error:
  - `{ lat, lon, error: { lat, lon } }`

### `core.neighbours(hash)`

- Returns eight directions as keys: `n ne e se s sw w nw`.
- Longitude wraps across the antimeridian (`>180` wraps to `-180+`, `<-180` wraps to `180-`).
- Latitude does not wrap; it is clamped to `[-89.99999, 89.99999]`.

### `nostr.createGTagLadder(geohash, minPrecision?)`

- Emits `["g", prefix]` for each precision from `max(1, minPrecision)` to `geohash.length`.
- Empty geohash returns `[]`.

### `nostr.nearbyFilter(lat, lon, options?)`

- Defaults: `precision=5`, `rings=1`.
- Produces `{ "#g": string[] }` from center hash plus ring expansion.
- Output is de-duplicated while preserving insertion order.

## CI and Change Control

- `npm run vectors:check` validates stored vectors against current implementation.
- CI runs this check and fails on output drift.
- If drift is intentional:
  - update affected vector file(s),
  - add a `CHANGELOG.md` note describing the compatibility-impacting change.
