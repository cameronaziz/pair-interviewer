import { VFC } from 'react';
import { calculateTemperature } from '../../utils/temperature';
import './style.css';

type TooltipProps = {
  item: TooltipItem;
  temperatureScale: App.ScaleType;
}

export type TooltipItem = Partial<WithAverage> & {
  name: string;
}

type WithAverage = {
  average: Schema.WeatherAverage;
}

const hasAverage = (item: any): item is WithAverage =>
  typeof item.average !== 'undefined';


const Tooltip: VFC<TooltipProps> = (props) => {
  const { item, temperatureScale } = props;

  return (
    <div className="tooltip-container">
      <div className="tooltip-title">
        {item.name}
      </div>
      {hasAverage(item) &&
        <div className="tooltip-content">
          <div className="tooltip-content-item">
            <div>
              Low
            </div>
            <div>
              {calculateTemperature(item.average.low, temperatureScale)}°
            </div>
          </div>
          {/* <div className="tooltip-content-item">
            <div>
              Day
            </div>
            {calculateTemperature(item.average.day, temperatureScale)}°
          </div> */}
          <div className="tooltip-content-item">
            <div>
              High
            </div>
            {calculateTemperature(item.average.high, temperatureScale)}°
          </div>
          {/* <div className="tooltip-content-item">
            <div>
              Rain
            </div>
            <div>
              {round(item.average.rain)}cm
            </div>
          </div> */}
        </div>
      }
    </div>
  );
};


export default Tooltip;
