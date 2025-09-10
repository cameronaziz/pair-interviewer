import { ChangeEvent, useRef, VFC } from 'react';
import LoadingRing from '../loading/ring';
import './style.css';

type InputProps = {
  handleChange(text: string): void;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
}

const Input: VFC<InputProps> = (props) => {
  const { defaultValue, label, isLoading, placeholder, handleChange } = props;
  const nameRef = useRef(`${Math.random().toString().slice(2)}`);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.value);
  }

  return (
    <div className="input-field-container">
      {label &&
        <label
          className="input-field-label"
          htmlFor={nameRef.current}
        >
          {label}
        </label>
      }
      {isLoading &&
        <div className="input-loading">
          <LoadingRing
            size={24}
            color="#4858b1"
          />
        </div>
      }
      <input
        className="input-field"
        id={nameRef.current}
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        defaultValue={defaultValue}
      />
    </div>
  );
};

export default Input;
