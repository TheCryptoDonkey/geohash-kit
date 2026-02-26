// src/geojson.ts — minimal GeoJSON geometry types (zero-dependency alternative to @types/geojson)

/** GeoJSON Polygon geometry. Coordinates are [lon, lat] rings; first ring is the outer boundary. */
export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

/** GeoJSON MultiPolygon geometry. Each element of coordinates is a Polygon's coordinate array. */
export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon'
  coordinates: number[][][][]
}

/** Input types accepted by polygonToGeohashes. */
export type PolygonInput = [number, number][] | GeoJSONPolygon | GeoJSONMultiPolygon
