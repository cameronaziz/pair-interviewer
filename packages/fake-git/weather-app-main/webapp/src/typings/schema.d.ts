declare namespace Schema {
  export type Maybe<T> = T | null;
  export type InputMaybe<T> = Maybe<T>;
  export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
  export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
  export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
  /** All built-in and custom scalars, mapped to their actual values */
  export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
  };

  /** Bounding box */
  export type BoundingBox = {
    __typename?: 'BoundingBox';
    bottomLeft: Scalars['Float'];
    bottomRight: Scalars['Float'];
    center: Coordinates;
    height: Scalars['Float'];
    topLeft: Scalars['Float'];
    topRight: Scalars['Float'];
    width: Scalars['Float'];
  };

  export type City = {
    __typename?: 'City';
    average: WeatherAverage;
    coordinates: Coordinates;
    country?: Maybe<CountryType>;
    id: Scalars['String'];
    name: Scalars['String'];
    weatherData: Array<WeatherMeasure>;
  };

  /** A city in the world */
  export type CityType = {
    __typename?: 'CityType';
    average: WeatherAverage;
    coordinates: Coordinates;
    id: Scalars['String'];
    name: Scalars['String'];
    weatherData: Array<WeatherMeasure>;
  };

  /** Geographical coordinates */
  export type Coordinates = {
    __typename?: 'Coordinates';
    latitude: Scalars['Float'];
    longitude: Scalars['Float'];
  };

  export type Country = {
    __typename?: 'Country';
    average: WeatherAverage;
    boundingBox: BoundingBox;
    cities?: Maybe<Array<City>>;
    code: Scalars['String'];
    geometry: Geometry;
    name: Scalars['String'];
  };

  /** A country in the world */
  export type CountryType = {
    __typename?: 'CountryType';
    average: WeatherAverage;
    boundingBox: BoundingBox;
    cities: Array<CityType>;
    code: Scalars['String'];
    geometry: Geometry;
    name: Scalars['String'];
  };

  /** A geographical shape (Polygon) or shapes (MultiPolygon) */
  export type Geometry = MultiPolygon | Polygon;

  /** Geographical shapes */
  export type MultiPolygon = {
    __typename?: 'MultiPolygon';
    polygons: Array<Polygon>;
  };

  /** A geographical shape */
  export type Polygon = {
    __typename?: 'Polygon';
    coordinates: Array<Coordinates>;
  };

  /** The root query */
  export type Query = {
    __typename?: 'Query';
    Cities: Array<City>;
    City?: Maybe<City>;
    Countries: Array<Country>;
    Country?: Maybe<Country>;
  };


  /** The root query */
  export type QueryCitiesArgs = {
    limit?: InputMaybe<Scalars['Int']>;
    name?: InputMaybe<Scalars['String']>;
    offset?: InputMaybe<Scalars['Int']>;
  };


  /** The root query */
  export type QueryCityArgs = {
    id?: InputMaybe<Scalars['String']>;
  };


  /** The root query */
  export type QueryCountryArgs = {
    code: Scalars['String'];
  };

  /** Average weather measurement for data over time */
  export type WeatherAverage = {
    __typename?: 'WeatherAverage';
    day: Scalars['Float'];
    high: Scalars['Float'];
    low: Scalars['Float'];
    rain: Scalars['Float'];
  };

  /** A weather measurement for a city at a time */
  export type WeatherMeasure = {
    __typename?: 'WeatherMeasure';
    clouds?: Maybe<Scalars['Int']>;
    datetime?: Maybe<Scalars['Int']>;
    humidity?: Maybe<Scalars['Int']>;
    pressure?: Maybe<Scalars['Float']>;
    rain?: Maybe<Scalars['Float']>;
    tempDay: Scalars['Float'];
    tempMax: Scalars['Float'];
    tempMin: Scalars['Float'];
    uvi?: Maybe<Scalars['Float']>;
    weather?: Maybe<Scalars['String']>;
  };
}
