import graphene
import json
import numpy as np
from weather import WeatherMeasureType, WeatherAveragesType
from geo import Geometry, CoordinatesType, Polygon, MultiPolygon, BoundingBox

class CityType(graphene.ObjectType):
    id = graphene.Int(required=True)
    name = graphene.String(required=True)
    coordinates = graphene.Field(CoordinatesType, required=True)
    weather_data = graphene.Field(
        graphene.List(
            graphene.NonNull(WeatherMeasureType),
        ),
        required=True,
    )
    average = graphene.Field(WeatherAveragesType, required=True)

    class Meta:
        description = "A city in the world"

    def resolve_ok(self, info):
        return True

    def resolve_average(self, info):
        return WeatherAveragesType.from_weather_data(self._weather_data)

    def resolve_weather_data(self, info):
        for d in self._weather_data:
            yield WeatherMeasureType(
                datetime=d['dt'],
                temp_min=d['temp']['min'],
                temp_day=d['temp']['day'],
                temp_max=d['temp']['max'],
                pressure=d['pressure'],
                weather=d['weather'][0]['main'],
                rain=d.get('rain'),
                # TODO moarrrr!
            )

class CountryType(graphene.ObjectType):
    name = graphene.String(required=True)
    code = graphene.String(required=True)
    geometry = graphene.Field(Geometry, required=True)
    cities = graphene.List(graphene.NonNull(CityType), required=True)
    average = graphene.Field(WeatherAveragesType, required=True)
    bounding_box = graphene.Field(BoundingBox, required=True)

    class Meta:
        description = "A country in the world"

    def resolve_average(self, info):
        loader = info.context.data_loader
        all_cities = loader.data['cities']
        three_to_two = loader.data['three_to_two']
        cities_in_country = []
        for city in all_cities:
            if city._country_code == three_to_two[self.code]:
                cities_in_country.append(city)
        cities_weather_data = []
        for city in cities_in_country:
            cities_weather_data.extend(city._weather_data)
        return WeatherAveragesType.from_weather_data(cities_weather_data)

    def resolve_geometry(self, info):
        if (self._geometry['type'] == 'Polygon'):
            data = Polygon()
            data._coordinates = self._geometry['coordinates'][0]
            return data
        elif (self._geometry['type'] == 'MultiPolygon'):
            data = MultiPolygon()
            data._polygons = self._geometry['coordinates']
            return data

    def resolve_cities(self, info):
        loader = info.context.data_loader
        cities = loader.data['cities']
        three_to_two = loader.data['three_to_two']
        cities_in_country = []
        for city in cities:
            if city._country_code == three_to_two[self.code]:
                cities_in_country.append(city)
        return cities_in_country


    def resolve_bounding_box(self, info):
        coordinates = self.resolve_geometry(info=info).extract_coordinates()
        return BoundingBox(coordinates=coordinates)

def resolve_country(self, info):
    loader = info.context.data_loader
    countries = loader.data['countries']
    three_to_two = loader.data['three_to_two']
    country = next(c for c in countries if three_to_two[c.code] == self._country_code)
    return country

# Allow querying by country from the city
City = type('City', (CityType,), {
    'country': graphene.Field(CountryType),
    'resolve_country': resolve_country,
})

# Allow looping back to the country from the city accessed from the country
Country = type('Country', (CountryType,), {
    'cities': graphene.List(graphene.NonNull(City)),
})
