import { CSSProperties, VFC } from 'react';
import './style.css';

type LoadingRingProps = {
  size?: number;
  color?: string;
}

const LoadingRing: VFC<LoadingRingProps> = (props) => {
  const { size = 100, color = '#FFF' } = props;

  const ringStyle = { width: `${size * 1.1}px`, height: `${size * 1.1}px` };
  const elementStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${size / 10}px`,
    borderColor: `${color} transparent transparent transparent`,
  };

  return (
    <div
      style={ringStyle}
      className="loading-ring"
    >
      <div
        style={elementStyle}
      />
      <div
        style={elementStyle}
      />
      <div
        style={elementStyle}
      />
      <div
        style={elementStyle}
      />
    </div>
  );
};

export default LoadingRing;
