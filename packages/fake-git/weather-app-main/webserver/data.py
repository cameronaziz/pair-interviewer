import json
from geo import CoordinatesType, MultiPolygon, Polygon
from locations import CountryType, City

class DataLoader:
    def __init__(self):
        self.data = {}
        self.__load_country_data()
        self.__load_cities()
        self.__load_three_to_two()

    def __load_country_data(self):
        with open("country_data.json") as country_data_file:
            import itertools
            lines = itertools.islice(country_data_file, 0, None)
            data = list(self.__build_countries(lines))
            self.data['countries'] = data

    def __build_countries(self, lines):
        for line in lines:
                try:
                    d = json.loads(line.strip())
                    obj = CountryType(
                        name=d['properties']['name'],
                        code=d['id'],
                    )
                    obj._geometry = d['geometry']
                    yield obj
                except Exception as e:
                    import sys
                    print(f'{e}: {line}', file=sys.stderr)

    def __load_cities(self):
        with open("daily_14.json") as daily_14:
            import itertools
            lines = itertools.islice(daily_14, 0, None)
            self.data['cities'] = list(self.__build_cities(lines))

    def __build_cities(self, lines):
        for line in lines:
            try:
                d = json.loads(line.strip())
                city_d = d['city']
                obj = City(
                    id=d['city']['id'],
                    name=d['city']['name'],
                    coordinates=CoordinatesType(
                        latitude=d['city']['coord']['lat'],
                        longitude=d['city']['coord']['lon'],
                    ),
                )
                obj._country_code = d['city']['country']
                obj._weather_data = d['data']
                yield obj
            except Exception as e:
                import sys
                print(f'{e}: {line}', file=sys.stderr)

    def __load_three_to_two(self):
        with open("three_to_two.json") as three_to_two_file:
            d = json.load(three_to_two_file)
            self.data['three_to_two'] = d
