
declare namespace GraphQL {
  type CityFull = {
    __typename: 'City';
    average: Schema.WeatherAverage;
    coordinates: Schema.Coordinates;
    id: string;
    name: string;
    weatherData: Array<Schema.WeatherMeasure>;
    country: {
      __typename: 'Country';
      code: string;
      name: string;
    }
  }

  type CityPartCountry = {
    __typename: 'Country';
    code: string;
  }

  type CityPart = {
    id: string;
    name: string;
    coordinates: Schema.Coordinates;
    country: CityPartCountry;
  }

  type CountryFull = {
    __typename: 'Country';
    average: Schema.WeatherAverage;
    boundingBox: BoundingBoxPart;
    cities: CityPart[] | CityFull[];
    code: string
    geometry: Schema.Geometry;
    name: string;
  }

  type BoundingBoxPart = {
    __typename: 'BoundingBox';
    center: Schema.Coordinates;
    height: number;
    width: number;
  }

  type CountryPart = {
    __typename: 'Country';
    geometry: Schema.Geometry;
    name: string;
    code: string;
    boundingBox: Schema.BoundingBox;
    average: Schema.WeatherAverage;
  }

  type Country = CountryPart | CountryFull;
  type City = CityFull | CitiesPart

  export namespace Query {
    export type CitiesPart = {
      __typename: 'Cities';
      Cities: Array<GraphQL.CityPart>;
    }

    export type CitiesPartArgs = {
      name: string;
    }

    export type CityFull = {
      __typename: 'City';
      City: GraphQL.CityFull | null;
    }

    export type CityFullArgs = {
      id: string;
    }

    export type CountryFull = {
      __typename: 'Country';
      Country: GraphQL.CountryFull | null;
    }

    export type CountryFullArgs = {
      code: string;
    }

    export type Countries = {
      __typename: 'Country';
      Countries: GraphQL.CountryPart[];
    }

    export type CountriesArgs = {
      withAverages: boolean;
    }
  }

}
