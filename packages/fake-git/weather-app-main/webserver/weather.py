import graphene
import numpy as np

def get_average(data):
    sum = 0
    for d in data:
        sum += d
    if len(data) > 0:
        return sum / len(data)
    return 0

class WeatherMeasureType(graphene.ObjectType):
    datetime = graphene.Int()
    temp_min =  graphene.Float(required=True)
    temp_day =  graphene.Float(required=True)
    temp_max =  graphene.Float(required=True)
    pressure = graphene.Float()
    humidity = graphene.Int()
    weather = graphene.String()
    clouds = graphene.Int()
    rain = graphene.Float()
    uvi = graphene.Float()

    class Meta:
        name = "WeatherMeasure"
        description = "A weather measurement for a city at a time"

class WeatherAveragesType(graphene.ObjectType):
    low = graphene.Float(required=True)
    day = graphene.Float(required=True)
    high = graphene.Float(required=True)
    rain = graphene.Float(required=True)

    class Meta:
        name = "WeatherAverage"
        description = "Average weather measurement for data over time"

    @classmethod
    def from_weather_data(cls, weather_data):
        rain_amounts = []
        for w in weather_data:
            if 'rain' in w:
                rain_amounts.append(w['rain'])
            else:
                rain_amounts.append(0)

        return cls(
            low=get_average([d['temp']['min'] for d in weather_data]),
            day=get_average([d['temp']['day'] for d in weather_data]),
            high=get_average([d['temp']['max'] for d in weather_data]),
            rain=get_average(rain_amounts)
        )
