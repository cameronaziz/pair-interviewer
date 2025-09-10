import { ChangeEvent, useState, VFC } from 'react';
import './style.css';

type RangeProps = {
}

const Range: VFC<RangeProps> = (props) => {
  const [range, setRange] = useState<[number, number]>([0, 100]);
  const [value, setValue] = useState<number>(50);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setValue(Number(value));
  }

  return (
    <div className="slide-container">
      <input
        onChange={onChange}
        type="range"
        min="1"
        max="100"
        value={value}
        className="slider"
      />
    </div>
  );
};

export default Range;
