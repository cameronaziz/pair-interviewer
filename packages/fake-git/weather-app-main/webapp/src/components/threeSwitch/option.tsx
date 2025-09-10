import { ReactElement, ReactNode, useRef } from 'react';

type OptionProps<T extends string> = {
  choice: T;
  display?(value: T): ReactNode;
  select(selection: T): void;
  selection?: T;
}
const Option = <T extends string>(props: OptionProps<T>): ReactElement => {
  const { choice, display, selection, select } = props;
  const nameRef = useRef(`${Math.random().toString().slice(2)}`);

  const label = (option: T) =>
    display ? display(option) : option;

  const handleClick = () => {
    select(choice);
  };

  const noShow = choice === 'NO_SHOW_CHOICE'

  return (
    <div>
      <input
        id={choice}
        name={`three-switch-${nameRef.current}}`}
        type="radio"
        disabled={noShow}
        checked={selection === choice}
        onChange={handleClick}
      />
      <label htmlFor={choice} className={noShow ? 'no-show-choice' : undefined}>
        {noShow ? null : label(choice)}
      </label>
    </div>
  );
};

export default Option;
