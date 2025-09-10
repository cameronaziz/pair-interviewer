import { gql } from '@apollo/client';

const GEOMETRY = gql`
  fragment GeometryParts on Geometry {
    ... on MultiPolygon {
      polygons {
        coordinates {
          latitude
          longitude
        }
      }
    }
    ... on Polygon {
      coordinates {
        latitude
        longitude
      }
    }
  }
`;

export default GEOMETRY;
