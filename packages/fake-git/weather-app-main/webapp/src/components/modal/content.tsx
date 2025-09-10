import { Fragment, useContext, VFC } from 'react';
import UIContext from '../../context/ui';
import { calculateTemperature } from '../../utils/temperature';
import LoadingRing from '../loading/ring';

type ContentProps = {
  data?: GraphQL.Query.CityFull;
  loading: boolean;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const Content: VFC<ContentProps> = (props) => {
  const { data, loading } = props;
  const { temperatureScale } = useContext(UIContext);
  if (loading) {
    return <LoadingRing />
  }

  if (!data || !data.City) {
    return null;
  }

  const { City: city } = data;

  const getDate = (epoch: number): string => {
    const date = new Date(epoch * 1000);
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  return (
    <Fragment>
      {city.weatherData.map((weatherData, index) =>
        <div key={index} className="weather-item">
          <div className="weather-item-title">
            {weatherData.datetime &&
              <div>
                {getDate(weatherData.datetime)}
              </div>
            }
          </div>
          <div className="weather-item-content title">
            Temperature
          </div>
          <div className="weather-item-content">
            <div>
              {calculateTemperature(weatherData.tempMin, temperatureScale)}°
              <div className="weather-item-sub">
                Low
              </div>
            </div>
            <div>
              {calculateTemperature(weatherData.tempDay, temperatureScale)}°
              <div className="weather-item-sub">
                Midday
              </div>
            </div>
            <div>
              {calculateTemperature(weatherData.tempMax, temperatureScale)}°
              <div className="weather-item-sub">
                High
              </div>
            </div>
          </div>
          <div className="weather-item-content title">
            Analysis
          </div>
          <div className="weather-item-content smaller">
            This day {weatherData.weather ? `was ${weatherData.weather.toLowerCase()}` : 'we didn\'t get any weather summary'},
            it had {weatherData.rain ? `${weatherData.rain}cm of` : 'no'} rain,
            and the barometric was {weatherData.pressure ? `${weatherData.pressure}hPa` : 'not reported'}.
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Content;
