# 1.0.0 (2026-03-15)


### Bug Fixes

* add antimeridian and degenerate validation to MultiPolygon path ([6dd2361](https://github.com/TheCryptoDonkey/geohash-kit/commit/6dd2361b1fb53e080cc66d222f96ecd7c8e91cf4))
* add build step to release job and bundle lib for demo ([2d2c44f](https://github.com/TheCryptoDonkey/geohash-kit/commit/2d2c44f2a0e5f2576719b79424171e15acd52f0b))
* add id-token:write permission for OIDC trusted publishing ([0489ea8](https://github.com/TheCryptoDonkey/geohash-kit/commit/0489ea808a271947b3b747c907b53aa2f00c6f71))
* add support section to README ([765dcc1](https://github.com/TheCryptoDonkey/geohash-kit/commit/765dcc1dbfff538110f8a810a5828ea206ab1123))
* address code review findings (input validation, seed explosion, antimeridian guard) ([ff19c49](https://github.com/TheCryptoDonkey/geohash-kit/commit/ff19c49493ebe5a24ceecbde0ffd0220c68b1fb8))
* address code review findings (maxCells cap, input validation, hull safety) ([2446534](https://github.com/TheCryptoDonkey/geohash-kit/commit/24465342235b7f2cab5bd2b14353590f7c39748b))
* coarse interior cells + fine edges only controlled by threshold ([5cbcdde](https://github.com/TheCryptoDonkey/geohash-kit/commit/5cbcdde2ebe171332b5ead527fa75866d157c002))
* coverage module correctness — holes, MultiPolygon maxCells, antimeridian guard ([6e8a5d5](https://github.com/TheCryptoDonkey/geohash-kit/commit/6e8a5d55cedb2779aad829329e956e8e3a3be353))
* deduplicate BASE32, tighten tests, update AI discoverability ([0eacd0f](https://github.com/TheCryptoDonkey/geohash-kit/commit/0eacd0f46cc78ef6695051202b66e3b8752c02f2))
* enlarge Leaflet.draw icons and improve polygon clear UX ([6262185](https://github.com/TheCryptoDonkey/geohash-kit/commit/62621853ba34be1f5fa9a3746a60f6c3d239463d))
* exclude bench files from TypeScript compilation, add validation to core APIs ([c376e6f](https://github.com/TheCryptoDonkey/geohash-kit/commit/c376e6ff9ead575c01f3ebc8a68ef73c8533e88a))
* grant write permissions to release job for semantic-release ([3537931](https://github.com/TheCryptoDonkey/geohash-kit/commit/353793148a601460880e4a2466442a903993e7fe))
* handle concave polygons in boundsFullyInsidePolygon ([601686e](https://github.com/TheCryptoDonkey/geohash-kit/commit/601686e3b5fdaace05e9d53949c68b1f8728e787))
* harden against prototype pollution, add input validation, cap ring expansion ([2dda26b](https://github.com/TheCryptoDonkey/geohash-kit/commit/2dda26b9de760aca41c7e750af213caf20a303aa))
* include LICENSE file in npm package ([a5d6885](https://github.com/TheCryptoDonkey/geohash-kit/commit/a5d68854e164ad25f49402b4b4984cfb4e66e24c))
* make deduplicateGeohashes exact by default, add lossy option ([4b44796](https://github.com/TheCryptoDonkey/geohash-kit/commit/4b44796206c7f45b325afea73d92a2e0e704419c))
* make mergeThreshold control interior cell precision depth ([91272b3](https://github.com/TheCryptoDonkey/geohash-kit/commit/91272b3ab5af8a3032e5c80447a701e18936a785))
* normalise repository URL in package.json ([c320920](https://github.com/TheCryptoDonkey/geohash-kit/commit/c320920e7d1401452dd4e1d14cf24d2b30c1efcc))
* remove depth-dependent threshold scaling from polygonToGeohashes ([c2d0632](https://github.com/TheCryptoDonkey/geohash-kit/commit/c2d06324a53554bdcbf3a93f290e88c6cb476d6a))
* remove merge path — only fully-inside cells below maxPrecision ([2de18fb](https://github.com/TheCryptoDonkey/geohash-kit/commit/2de18fbe1d38e92359d37ed1e347f07e899073ed))
* remove merge path, edges always subdivide to maxPrecision ([60b77d0](https://github.com/TheCryptoDonkey/geohash-kit/commit/60b77d090c769648a643065f2565868e74f2bda5))
* replace Leaflet.draw with click-to-draw polygon ([97928ff](https://github.com/TheCryptoDonkey/geohash-kit/commit/97928ff8dfe43f3ed203a8e1802f5b82ac61ff54))
* throw on antimeridian hull input, validate precisionToRadius ([eebf0f0](https://github.com/TheCryptoDonkey/geohash-kit/commit/eebf0f0d195bf08c032d6a0d592f1f73253f1d23))
* use absolute GitHub URLs for LICENSE links ([4db534c](https://github.com/TheCryptoDonkey/geohash-kit/commit/4db534cbe82ff37c59c53d818a419d3ec9033ae3))
* use Node 22 for semantic-release (requires >=22.14.0) ([3d7675e](https://github.com/TheCryptoDonkey/geohash-kit/commit/3d7675e8f4128f7d9638c9e77f497547ace61959))
* validate coverage options, throw on infeasible maxCells, update docs ([8252601](https://github.com/TheCryptoDonkey/geohash-kit/commit/82526012e72ba09a6891b93af9ea33ffce31ab34))
* validate geohash input in createGTagFilterFromGeohashes ([de10ef8](https://github.com/TheCryptoDonkey/geohash-kit/commit/de10ef8a398f280a93ed5270732ace05362848fd))


### Features

* add android compatibility vectors and CI check ([7c307b3](https://github.com/TheCryptoDonkey/geohash-kit/commit/7c307b3595c28b141ed6c21caf1cc0c6e925ce41))
* add benchmarking infrastructure and documentation ([69bf9c6](https://github.com/TheCryptoDonkey/geohash-kit/commit/69bf9c60809f8afefb9ace799bef8e7d19ce88d4))
* add circleToPolygon and getDestinationPoint for geodesic circle approximation ([e0a05de](https://github.com/TheCryptoDonkey/geohash-kit/commit/e0a05dee27d70eef3d43399b25f2aaaf5516672d))
* add GeoJSON Polygon/MultiPolygon type definitions ([76cc19d](https://github.com/TheCryptoDonkey/geohash-kit/commit/76cc19d58355db763e900249451059d9f5f71326))
* add midpoint, midpointFromCoords, midpointFromCoordsMulti ([2c236b0](https://github.com/TheCryptoDonkey/geohash-kit/commit/2c236b0174f925ffd68c3883c90fee9cd4636905))
* add post-processing merge for complete sibling groups ([1b2945e](https://github.com/TheCryptoDonkey/geohash-kit/commit/1b2945ed8727c4334decdf6d3a92c8825db5dc9c))
* core module — distance, distanceFromCoords, radiusToPrecision, precisionToRadius ([6ad164a](https://github.com/TheCryptoDonkey/geohash-kit/commit/6ad164a98e18c8ef3daf4ee768c8611ba76fcfa5))
* core module — encode, decode, bounds, children, contains, matchesAny ([9d8da26](https://github.com/TheCryptoDonkey/geohash-kit/commit/9d8da26c9a2b91d21fb54c39945729b027f7dc97))
* core module — neighbour and neighbours ([0fdc6bb](https://github.com/TheCryptoDonkey/geohash-kit/commit/0fdc6bbbd72eb98ab67e31247592adbb9d779bea))
* coverage module — polygon coverage, GeoJSON, convex hull, deduplication ([2f3fc62](https://github.com/TheCryptoDonkey/geohash-kit/commit/2f3fc62a11dd010196f21fe9322b43791d2636b4))
* export GeoJSON types from barrel and coverage subpath ([cdb0387](https://github.com/TheCryptoDonkey/geohash-kit/commit/cdb03877df92edf7f62255a0f6f285fdf959090b))
* extract convexHull(points) coordinate-based primitive ([49d318b](https://github.com/TheCryptoDonkey/geohash-kit/commit/49d318b3737671a28252253817c3b3e9658275c8))
* make mergeThreshold control merge aggressiveness ([444328b](https://github.com/TheCryptoDonkey/geohash-kit/commit/444328bf482620785b7a465623983b5420b764a7))
* nostr module — createGTagLadder, parseGTags, bestGeohash ([1f7a8f1](https://github.com/TheCryptoDonkey/geohash-kit/commit/1f7a8f17eb7860f522388006a57bfdbdd0f9a8be))
* nostr module — expandRings, createGTagFilter, nearbyFilter ([e757810](https://github.com/TheCryptoDonkey/geohash-kit/commit/e757810945dc16408e221bf752b104cffd1527d3))
* polygonToGeohashes accepts GeoJSON Polygon input ([e4e5911](https://github.com/TheCryptoDonkey/geohash-kit/commit/e4e59111ff0aaf83ab73d52b77a8f0c691254c6f))
* project scaffolding ([5535d24](https://github.com/TheCryptoDonkey/geohash-kit/commit/5535d2477a21479c2cb26e3f7364e8c36776d30f))
* relax merge threshold to 30/32 siblings for smaller output arrays ([7540262](https://github.com/TheCryptoDonkey/geohash-kit/commit/75402622a5ae64d1294f57b5a295a3b1c5247f57))
* showcase all geohash-kit features in demo page ([43a0b0c](https://github.com/TheCryptoDonkey/geohash-kit/commit/43a0b0cf25fab82082fb9f0d2d4a0fc8e99d1a6e))


### Performance Improvements

* add AABB pre-filter to skip cells outside polygon bounding box ([f77d03f](https://github.com/TheCryptoDonkey/geohash-kit/commit/f77d03fe2b6e5201f5d47ea6783a26c472a21de7))

# 1.0.0 (2026-03-13)


### Bug Fixes

* add antimeridian and degenerate validation to MultiPolygon path ([6dd2361](https://github.com/TheCryptoDonkey/geohash-kit/commit/6dd2361b1fb53e080cc66d222f96ecd7c8e91cf4))
* add build step to release job and bundle lib for demo ([2d2c44f](https://github.com/TheCryptoDonkey/geohash-kit/commit/2d2c44f2a0e5f2576719b79424171e15acd52f0b))
* add id-token:write permission for OIDC trusted publishing ([0489ea8](https://github.com/TheCryptoDonkey/geohash-kit/commit/0489ea808a271947b3b747c907b53aa2f00c6f71))
* add support section to README ([765dcc1](https://github.com/TheCryptoDonkey/geohash-kit/commit/765dcc1dbfff538110f8a810a5828ea206ab1123))
* address code review findings (input validation, seed explosion, antimeridian guard) ([ff19c49](https://github.com/TheCryptoDonkey/geohash-kit/commit/ff19c49493ebe5a24ceecbde0ffd0220c68b1fb8))
* address code review findings (maxCells cap, input validation, hull safety) ([2446534](https://github.com/TheCryptoDonkey/geohash-kit/commit/24465342235b7f2cab5bd2b14353590f7c39748b))
* coarse interior cells + fine edges only controlled by threshold ([5cbcdde](https://github.com/TheCryptoDonkey/geohash-kit/commit/5cbcdde2ebe171332b5ead527fa75866d157c002))
* coverage module correctness — holes, MultiPolygon maxCells, antimeridian guard ([6e8a5d5](https://github.com/TheCryptoDonkey/geohash-kit/commit/6e8a5d55cedb2779aad829329e956e8e3a3be353))
* deduplicate BASE32, tighten tests, update AI discoverability ([0eacd0f](https://github.com/TheCryptoDonkey/geohash-kit/commit/0eacd0f46cc78ef6695051202b66e3b8752c02f2))
* enlarge Leaflet.draw icons and improve polygon clear UX ([6262185](https://github.com/TheCryptoDonkey/geohash-kit/commit/62621853ba34be1f5fa9a3746a60f6c3d239463d))
* exclude bench files from TypeScript compilation, add validation to core APIs ([c376e6f](https://github.com/TheCryptoDonkey/geohash-kit/commit/c376e6ff9ead575c01f3ebc8a68ef73c8533e88a))
* grant write permissions to release job for semantic-release ([3537931](https://github.com/TheCryptoDonkey/geohash-kit/commit/353793148a601460880e4a2466442a903993e7fe))
* handle concave polygons in boundsFullyInsidePolygon ([601686e](https://github.com/TheCryptoDonkey/geohash-kit/commit/601686e3b5fdaace05e9d53949c68b1f8728e787))
* harden against prototype pollution, add input validation, cap ring expansion ([2dda26b](https://github.com/TheCryptoDonkey/geohash-kit/commit/2dda26b9de760aca41c7e750af213caf20a303aa))
* include LICENSE file in npm package ([a5d6885](https://github.com/TheCryptoDonkey/geohash-kit/commit/a5d68854e164ad25f49402b4b4984cfb4e66e24c))
* make deduplicateGeohashes exact by default, add lossy option ([4b44796](https://github.com/TheCryptoDonkey/geohash-kit/commit/4b44796206c7f45b325afea73d92a2e0e704419c))
* make mergeThreshold control interior cell precision depth ([91272b3](https://github.com/TheCryptoDonkey/geohash-kit/commit/91272b3ab5af8a3032e5c80447a701e18936a785))
* normalise repository URL in package.json ([c320920](https://github.com/TheCryptoDonkey/geohash-kit/commit/c320920e7d1401452dd4e1d14cf24d2b30c1efcc))
* remove depth-dependent threshold scaling from polygonToGeohashes ([c2d0632](https://github.com/TheCryptoDonkey/geohash-kit/commit/c2d06324a53554bdcbf3a93f290e88c6cb476d6a))
* remove merge path — only fully-inside cells below maxPrecision ([2de18fb](https://github.com/TheCryptoDonkey/geohash-kit/commit/2de18fbe1d38e92359d37ed1e347f07e899073ed))
* remove merge path, edges always subdivide to maxPrecision ([60b77d0](https://github.com/TheCryptoDonkey/geohash-kit/commit/60b77d090c769648a643065f2565868e74f2bda5))
* replace Leaflet.draw with click-to-draw polygon ([97928ff](https://github.com/TheCryptoDonkey/geohash-kit/commit/97928ff8dfe43f3ed203a8e1802f5b82ac61ff54))
* throw on antimeridian hull input, validate precisionToRadius ([eebf0f0](https://github.com/TheCryptoDonkey/geohash-kit/commit/eebf0f0d195bf08c032d6a0d592f1f73253f1d23))
* use absolute GitHub URLs for LICENSE links ([4db534c](https://github.com/TheCryptoDonkey/geohash-kit/commit/4db534cbe82ff37c59c53d818a419d3ec9033ae3))
* use Node 22 for semantic-release (requires >=22.14.0) ([3d7675e](https://github.com/TheCryptoDonkey/geohash-kit/commit/3d7675e8f4128f7d9638c9e77f497547ace61959))
* validate coverage options, throw on infeasible maxCells, update docs ([8252601](https://github.com/TheCryptoDonkey/geohash-kit/commit/82526012e72ba09a6891b93af9ea33ffce31ab34))
* validate geohash input in createGTagFilterFromGeohashes ([de10ef8](https://github.com/TheCryptoDonkey/geohash-kit/commit/de10ef8a398f280a93ed5270732ace05362848fd))


### Features

* add android compatibility vectors and CI check ([7c307b3](https://github.com/TheCryptoDonkey/geohash-kit/commit/7c307b3595c28b141ed6c21caf1cc0c6e925ce41))
* add benchmarking infrastructure and documentation ([69bf9c6](https://github.com/TheCryptoDonkey/geohash-kit/commit/69bf9c60809f8afefb9ace799bef8e7d19ce88d4))
* add circleToPolygon and getDestinationPoint for geodesic circle approximation ([e0a05de](https://github.com/TheCryptoDonkey/geohash-kit/commit/e0a05dee27d70eef3d43399b25f2aaaf5516672d))
* add GeoJSON Polygon/MultiPolygon type definitions ([76cc19d](https://github.com/TheCryptoDonkey/geohash-kit/commit/76cc19d58355db763e900249451059d9f5f71326))
* add midpoint, midpointFromCoords, midpointFromCoordsMulti ([2c236b0](https://github.com/TheCryptoDonkey/geohash-kit/commit/2c236b0174f925ffd68c3883c90fee9cd4636905))
* add post-processing merge for complete sibling groups ([1b2945e](https://github.com/TheCryptoDonkey/geohash-kit/commit/1b2945ed8727c4334decdf6d3a92c8825db5dc9c))
* core module — distance, distanceFromCoords, radiusToPrecision, precisionToRadius ([6ad164a](https://github.com/TheCryptoDonkey/geohash-kit/commit/6ad164a98e18c8ef3daf4ee768c8611ba76fcfa5))
* core module — encode, decode, bounds, children, contains, matchesAny ([9d8da26](https://github.com/TheCryptoDonkey/geohash-kit/commit/9d8da26c9a2b91d21fb54c39945729b027f7dc97))
* core module — neighbour and neighbours ([0fdc6bb](https://github.com/TheCryptoDonkey/geohash-kit/commit/0fdc6bbbd72eb98ab67e31247592adbb9d779bea))
* coverage module — polygon coverage, GeoJSON, convex hull, deduplication ([2f3fc62](https://github.com/TheCryptoDonkey/geohash-kit/commit/2f3fc62a11dd010196f21fe9322b43791d2636b4))
* export GeoJSON types from barrel and coverage subpath ([cdb0387](https://github.com/TheCryptoDonkey/geohash-kit/commit/cdb03877df92edf7f62255a0f6f285fdf959090b))
* extract convexHull(points) coordinate-based primitive ([49d318b](https://github.com/TheCryptoDonkey/geohash-kit/commit/49d318b3737671a28252253817c3b3e9658275c8))
* make mergeThreshold control merge aggressiveness ([444328b](https://github.com/TheCryptoDonkey/geohash-kit/commit/444328bf482620785b7a465623983b5420b764a7))
* nostr module — createGTagLadder, parseGTags, bestGeohash ([1f7a8f1](https://github.com/TheCryptoDonkey/geohash-kit/commit/1f7a8f17eb7860f522388006a57bfdbdd0f9a8be))
* nostr module — expandRings, createGTagFilter, nearbyFilter ([e757810](https://github.com/TheCryptoDonkey/geohash-kit/commit/e757810945dc16408e221bf752b104cffd1527d3))
* polygonToGeohashes accepts GeoJSON Polygon input ([e4e5911](https://github.com/TheCryptoDonkey/geohash-kit/commit/e4e59111ff0aaf83ab73d52b77a8f0c691254c6f))
* project scaffolding ([5535d24](https://github.com/TheCryptoDonkey/geohash-kit/commit/5535d2477a21479c2cb26e3f7364e8c36776d30f))
* relax merge threshold to 30/32 siblings for smaller output arrays ([7540262](https://github.com/TheCryptoDonkey/geohash-kit/commit/75402622a5ae64d1294f57b5a295a3b1c5247f57))
* showcase all geohash-kit features in demo page ([43a0b0c](https://github.com/TheCryptoDonkey/geohash-kit/commit/43a0b0cf25fab82082fb9f0d2d4a0fc8e99d1a6e))


### Performance Improvements

* add AABB pre-filter to skip cells outside polygon bounding box ([f77d03f](https://github.com/TheCryptoDonkey/geohash-kit/commit/f77d03fe2b6e5201f5d47ea6783a26c472a21de7))

## [1.5.1](https://github.com/TheCryptoDonkey/geohash-kit/compare/v1.5.0...v1.5.1) (2026-03-12)


### Bug Fixes

* harden against prototype pollution, add input validation, cap ring expansion ([5297db9](https://github.com/TheCryptoDonkey/geohash-kit/commit/5297db98154935e301957c6a3606b25b43444046))
* validate geohash input in createGTagFilterFromGeohashes ([844329a](https://github.com/TheCryptoDonkey/geohash-kit/commit/844329a06313b2171b349a749a84a11659e9b7cb))

# [1.5.0](https://github.com/TheCryptoDonkey/geohash-kit/compare/v1.4.2...v1.5.0) (2026-03-09)


### Features

* add android compatibility vectors and CI check ([fe6a015](https://github.com/TheCryptoDonkey/geohash-kit/commit/fe6a0153f9ad54f8206631f08f3e72136355c8bb))

## [1.4.2](https://github.com/TheCryptoDonkey/geohash-kit/compare/v1.4.1...v1.4.2) (2026-03-06)


### Bug Fixes

* deduplicate BASE32, tighten tests, update AI discoverability ([d21366b](https://github.com/TheCryptoDonkey/geohash-kit/commit/d21366ba2f3f35d0f32654b7d000e1dcba61fae9))

## [1.4.1](https://github.com/TheCryptoDonkey/geohash-kit/compare/v1.4.0...v1.4.1) (2026-03-05)


### Bug Fixes

* normalise repository URL in package.json ([a1ebe66](https://github.com/TheCryptoDonkey/geohash-kit/commit/a1ebe6660f617149c6cd0d84927d9a66fd2d1215))

# [1.4.0](https://github.com/TheCryptoDonkey/geohash-kit/compare/v1.3.0...v1.4.0) (2026-03-05)


### Features

* extract convexHull(points) coordinate-based primitive ([96b4179](https://github.com/TheCryptoDonkey/geohash-kit/commit/96b4179cbdb99bc67785e3980cadf870fe49af81))

# [1.3.0](https://github.com/TheCryptoDonkey/geohash-kit/compare/v1.2.0...v1.3.0) (2026-02-27)


### Features

* add circleToPolygon and getDestinationPoint for geodesic circle approximation ([952fe79](https://github.com/TheCryptoDonkey/geohash-kit/commit/952fe79f29dd2ce4dcc8a79ad3bf2554c718a887))

# [1.2.0](https://github.com/TheCryptoDonkey/geohash-kit/compare/v1.1.0...v1.2.0) (2026-02-27)


### Features

* add midpoint, midpointFromCoords, midpointFromCoordsMulti ([e8660da](https://github.com/TheCryptoDonkey/geohash-kit/commit/e8660da9a8d1500bee330a39a25be0eb87668e75))
