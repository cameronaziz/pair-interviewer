import { VFC } from 'react';
import './style.css';

const SVGMap: VFC = () => {
  return (
    <div className="svg-map-container">
      <svg id="svg-map" />
    </div>
  );
};

export default SVGMap;
