import { useContext, VFC } from 'react';
import ThreeSwitch from '../../components/threeSwitch';
import UIContext from '../../context/ui';
import useRouter from '../../hooks/useRouter';
import Icons from '../icons';
import Search from './search';
import './style.css';

const Controls: VFC = () => {
  const [navigate, page] = useRouter()
  const { savedCities, setModalFeature } = useContext(UIContext);
  const temperatureScales: App.ScaleType[] = ['kelvin', 'celsius', 'fahrenheit'];
  const viewTypes: App.ViewType[] = ['temperature', 'rain'];
  const { setViewType, setTemperatureScale, temperatureScale, viewType } = useContext(UIContext);


  const clickHome = () => {
    navigate('world');
  };

  const compare = () => {
    setModalFeature(true);
  }

  return (
    <div className="controls">
      <div className={`home-link${page === 'world' ? ' disabled' : ''}`}>
        <Icons.Home onClick={clickHome} />
      </div>
      <div className="controls-container">
        <ThreeSwitch
          title="Temperature Scale"
          options={temperatureScales}
          display={(value) => value.slice(0, 1)}
          currentSelection={temperatureScale}
          setSelection={setTemperatureScale}
        />
        <Search />
        <ThreeSwitch
          title="Temperature / Rain"
          options={viewTypes}
          currentSelection={viewType}
          display={(value) => value.slice(0, 1)}
          setSelection={setViewType}
        />
      </div>
      <div className={`home-link${savedCities.length <= 0 ? ' disabled' : ''}`}>
        <Icons.Compare onClick={compare} />
      </div>
    </div>
  );
};

export default Controls;
