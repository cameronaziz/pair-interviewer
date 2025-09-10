from thefuzz import process
from thefuzz import fuzz
import graphene
import json
from geo import Geometry
import locations

class Query(graphene.ObjectType):
    class Meta:
        description = "The root query"

    Cities = graphene.Field(
        graphene.List(
            graphene.NonNull(locations.City),
            required=True,
        ),
        required=True,
        limit=graphene.Int(),
        offset=graphene.Int(),
        name=graphene.String(),
    )

    City = graphene.Field(locations.City, id=graphene.Int())

    Country = graphene.Field(
        locations.Country,
        code=graphene.String(required=True),
    )

    Countries = graphene.Field(
        graphene.List(
            graphene.NonNull(locations.Country),
        ),
        required=True,
    )

    def resolve_City(self, info, id):
        loader = info.context.data_loader
        cities = loader.data['cities']
        return next(city for city in cities if city.id == id)

    def resolve_Country(self, info, code):
        loader = info.context.data_loader
        countries = loader.data['countries']
        if len(code) == 2:
            three_to_two = loader.data['three_to_two']
            return next(country for country in countries if three_to_two[country.code] == code)
        return next(country for country in countries if country.code == code)

    def resolve_Countries(self, info):
        data = info.context.data_loader.data['countries']
        return data

    def resolve_Cities(self, info, name=None, limit=None, offset=0):
        loader = info.context.data_loader
        cities = loader.data['cities']
        if name:
            city_names = [city.name for city in cities]
            city_matches = process.extract(name, city_names, limit=10)
            results = []
            for match in city_matches:
                result = next(city for city in cities if city.name == match[0])
                results.append(result)
            return results
        if limit:
            cities = cities[offset:offset+limit]
        return cities
