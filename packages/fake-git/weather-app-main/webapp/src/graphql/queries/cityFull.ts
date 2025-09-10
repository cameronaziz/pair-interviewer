import { gql } from '@apollo/client';

const CITY_FULL = gql`
  query City($id: Int!) {
    City(id: $id) {
      id
      name
      average {
        day
        high
        low
        rain
      }
      coordinates {
        latitude
        longitude
      }
      weatherData {
        datetime
        humidity
        pressure
        rain
        tempDay
        tempMax
        tempMin
        uvi
        weather
        clouds
      }
      country {
        code
        name
      }
    }
  }
`;

export default CITY_FULL;
