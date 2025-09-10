declare namespace App {
  export type Feature<T extends GraphQL.City | GraphQL.Country = GraphQL.City | GraphQL.Country> = T

  export type GeoObject <T extends GraphQL.City | GraphQL.Country = GraphQL.City | GraphQL.Country>= GeoJSON.GeometryObject & Feature<T>

  export type Page =
    | 'world'
    | 'country';

  export type ViewType = 'temperature' | 'rain';

  export type ScaleType = 'kelvin' | 'celsius' | 'fahrenheit';
}
