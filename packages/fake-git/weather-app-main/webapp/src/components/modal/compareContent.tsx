import { useContext, VFC } from 'react';
import UIContext from '../../context/ui';
import { calculateTemperature } from '../../utils/temperature';

type ContentProps = {
  save: GraphQL.CityFull;
}

const Content: VFC<ContentProps> = (props) => {
  const { save } = props;
  const { saveCity } = useContext(UIContext);
  const { temperatureScale } = useContext(UIContext);

  const remove = () => {
    saveCity(save);
  }

  return (
    <div className="weather-item">
      <div className="weather-item-content">
        <div>
          {calculateTemperature(save.average.low, temperatureScale)}°
          <div className="weather-item-sub">
            Low
          </div>
        </div>
        <div>
          {calculateTemperature(save.average.day, temperatureScale)}°
          <div className="weather-item-sub">
            Midday
          </div>
        </div>
        <div>
          {calculateTemperature(save.average.high, temperatureScale)}°
          <div className="weather-item-sub">
            High
          </div>
        </div>
      </div>
      <div className="weather-item-content smaller">
        <span className="modal-button remove" onClick={remove}>
          <div className="center" onClick={remove}>
            X
          </div>
        </span>
      </div>
    </div>
  );
};

export default Content;
