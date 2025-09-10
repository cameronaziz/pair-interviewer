import graphene
import numpy as np

class CoordinatesType(graphene.ObjectType):
    longitude = graphene.Float(required=True)
    latitude = graphene.Float(required=True)

    class Meta:
        name = "Coordinates"
        description = "Geographical coordinates"

    @classmethod
    def from_list(cls, coordinates):
        coordinates_arr = np.array(coordinates)
        return cls(
            longitude=coordinates_arr[0],
            latitude=coordinates_arr[1]
        )

class BoundingBox(graphene.ObjectType):
    top_left = graphene.Float(required=True)
    top_right = graphene.Float(required=True)
    bottom_left = graphene.Float(required=True)
    bottom_right = graphene.Float(required=True)
    center = graphene.Field(CoordinatesType, required=True)
    width = graphene.Float(required=True)
    height = graphene.Float(required=True)

    class Meta:
        name = "BoundingBox"
        description = "Bounding box"

    def __init__(self, coordinates):
        self._coordinates = coordinates

    def resolve_top_left(self, info):
        return CoordinatesType.from_list(np.min(self._coordinates, axis=0))

    def resolve_top_right(self, info):
        return CoordinatesType.from_list(np.max(self._coordinates, axis=0))

    def resolve_bottom_left(self, info):
        return CoordinatesType.from_list(np.max(self._coordinates, axis=0))

    def resolve_bottom_right(self, info):
        return CoordinatesType.from_list(np.min(self._coordinates, axis=0))

    def resolve_center(self, info):
        center = CoordinatesType.from_list(np.mean(self._coordinates, axis=0))
        return center

    def resolve_width(self, info):
        left = self.resolve_top_left(info)
        right = self.resolve_top_right(info)

        if left.longitude < 0 and right.longitude < 0:
            return np.abs(left.longitude) - np.abs(right.longitude)
        elif left.longitude < 0 and right.longitude > 0:
            return np.abs(left.longitude) + right.longitude
        else:
            return right.longitude - left.longitude

    def resolve_height(self, info):
        top = self.resolve_top_left(info)
        bottom = self.resolve_bottom_left(info)

        if top.latitude < 0 and bottom.latitude < 0:
            return np.abs(top.latitude) - np.abs(bottom.latitude)
        elif top.latitude < 0 and bottom.latitude > 0:
            return np.abs(top.latitude) + bottom.latitude
        else:
            return bottom.latitude - top.latitude

class Polygon(graphene.ObjectType):
    coordinates = graphene.List(graphene.NonNull(CoordinatesType), required=True)

    class Meta:
        description = "A geographical shape"

    def resolve_coordinates(self, info):
        for coordinate in self._coordinates:
            coordinates = np.array(coordinate)
            yield CoordinatesType.from_list(coordinates)

    def extract_coordinates(self):
        coordinates = []
        for coordinate in self._coordinates:
            coordinates.append(coordinate)
        return coordinates

class MultiPolygon(graphene.ObjectType):
    polygons = graphene.List(graphene.NonNull(Polygon), required=True)

    class Meta:
        description = "Geographical shapes"

    def resolve_polygons(self, info):
        for polygon in self._polygons:
            data = Polygon()
            data._coordinates = polygon[0]
            yield data

    def extract_coordinates(self):
        coordinates = []
        for polygons in self._polygons:
            for coordinate in polygons:
                coordinates.extend(coordinate)
        return coordinates

class Geometry(graphene.Union):
    class Meta:
        types = (Polygon, MultiPolygon)
        description = "A geographical shape (Polygon) or shapes (MultiPolygon)"
