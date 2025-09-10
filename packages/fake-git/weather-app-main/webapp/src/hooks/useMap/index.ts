import { useCallback, useContext, useEffect, useRef } from 'react';
import UIContext from '../../context/ui';
import draw from './draw';
import type { DrawOptions, UseMap, UseMapOptions } from './types';

const useMap: UseMap = (options) => {
  const optionsRef = useRef<UseMapOptions | undefined>(options);
  const { frame, viewType, temperatureScale } = useContext(UIContext);

  const createDrawOptions =
   useCallback(
    (providedOptions: UseMapOptions): DrawOptions => ({
      countries: providedOptions.countries || [],
      ...providedOptions,
      viewType,
      temperatureScale,
      frame,
    }),
    [viewType, temperatureScale, frame],
  );

  useEffect(
    () => {
      if (optionsRef.current) {
        draw(createDrawOptions(optionsRef.current));
      }
    },
    [viewType, temperatureScale],
  );


  const drawMap = useCallback(
    (providedOptions?: UseMapOptions) => {
      const drawOptions = providedOptions || optionsRef.current || {};
      optionsRef.current = drawOptions;
      draw(createDrawOptions(drawOptions));
    }
    ,
    [createDrawOptions],
  )

  return [drawMap]
};

export default useMap;
