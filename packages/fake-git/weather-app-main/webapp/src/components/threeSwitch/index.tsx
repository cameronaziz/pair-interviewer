import { ReactElement, ReactNode, useEffect, useState } from 'react';
import Option from './option';
import './style.css';

type ThreeSwitchPropsBase<T extends string[]> = {
  title?: string;
  allowRepress?: boolean;
  options: T;
  display?(value: T[number]): ReactNode;
  setSelection(selection: T[number]): void;
  currentSelection?: T[number];
}

type ThreeSwitchPropsRepress<T extends string[]> = ThreeSwitchPropsBase<T> & {
  allowRepress: true;
}

type ThreeSwitchPropsClassic<T extends string[]> = ThreeSwitchPropsBase<T> & {
  setSelection(selection: T[number]): void;
  currentSelection: T[number];
}

type ThreeSwitchProps<T extends string[]> = ThreeSwitchPropsClassic<T> | ThreeSwitchPropsRepress<T>

const ThreeSwitch = <T extends string[]>(props: ThreeSwitchProps<T>): ReactElement => {
  const { options, title, setSelection, allowRepress, currentSelection, display } = props;
  const [selectedOption, setSelectedOption] = useState<T[number] | undefined>(currentSelection);
  const [wait, setWait] = useState<NodeJS.Timeout | null>(null);

  const choices = options.length === 2 ? [options[0], 'NO_SHOW_CHOICE', options[1]] : options;

  useEffect(
    () => {
      if (wait) {
        clearTimeout(wait);
      }
    },
    [],
  );

  const selection = allowRepress ? selectedOption : currentSelection;

  const select = (selection: T[number]) => {
    if (allowRepress) {
      setSelectedOption(selection);
      setWait(setTimeout(() => {
        setSelectedOption(undefined);
        setWait(null);
      }, 500))
    };
    setSelection(selection);
  };

  return (
    <div className="switch-toggle-container">
      {title &&
        <div className="switch-toggle-title">
          {title}
        </div>
      }
      <div className="switch-toggle">
        {choices.map((choice) =>
          <Option
            key={choice}
            choice={choice}
            display={display}
            select={select}
            selection={selection}
          />
        )}
      </div>
    </div>
  );
};

export default ThreeSwitch;
