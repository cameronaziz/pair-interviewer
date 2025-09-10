
export const isPolygon = (geometry: Schema.Geometry): geometry is Schema.Polygon =>
  geometry.__typename === 'Polygon';

export const parseGeometry = <T extends GeoJSON.Polygon | GeoJSON.MultiPolygon>(geometry: Schema.Geometry): T['coordinates'] => {
  if (isPolygon(geometry)) {
    return [geometry.coordinates.map((coordinate) => [coordinate.longitude, coordinate.latitude])];
  }
  return [geometry.polygons.map((polygon) => polygon.coordinates.map((coordinate) => [coordinate.longitude, coordinate.latitude]))];
};

export const makeFeature = <T extends GeoJSON.Polygon | GeoJSON.MultiPolygon>(country: GraphQL.Country): GeoJSON.Feature<T> => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: country.geometry.__typename,
    coordinates: parseGeometry(country.geometry),
    properties: {},
  } as unknown as T
});

export const makeFeatureCollection = (countries: GraphQL.Country[]): GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon> => ({
  type: 'FeatureCollection',
  features: countries.map(makeFeature),
});

export const rainDomain = [
  0,
  0.4,
  0.9,
  3,
  4,
];

export const temperatureDomain = [
  210,
  245,
  270,
  295,
  330,
]

