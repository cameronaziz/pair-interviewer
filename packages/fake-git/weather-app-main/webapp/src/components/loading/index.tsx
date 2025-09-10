import { VFC } from 'react';
import LoadingRing from './ring';
import './style.css';

type LoadingProps = {
  size?: number;
  color?: string;
}

const Loading: VFC<LoadingProps> = (props) => {

  return (
    <div className="loading-ring-container">
      <LoadingRing {...props} />
    </div>
  );
};

export default Loading;
