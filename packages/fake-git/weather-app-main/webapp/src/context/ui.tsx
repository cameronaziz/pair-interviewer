import { createContext, FC, MutableRefObject, ReactNode, useState } from 'react';

type ContextValue = {
  frame: DOMRect;
  setFrame<T extends HTMLElement>(ref: MutableRefObject<T | null>): void
  viewType: App.ViewType;
  setViewType(viewType: App.ViewType): void;
  temperatureScale: App.ScaleType;
  setTemperatureScale(scale: App.ScaleType): void;
  modalFeature: App.Feature | null | true;
  setModalFeature(feature: App.Feature | null): void;
  savedCities: GraphQL.CityFull[];
  saveCity(city: GraphQL.CityFull): void;
  isLoading: boolean;
  toggleLoading(force?: boolean): void;
}

const frame: DOMRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  toJSON: () => {},
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

const defaultContext: ContextValue = {
  setFrame: () => {},
  frame,
  viewType: 'temperature',
  setViewType: () => {},
  temperatureScale: 'fahrenheit',
  setTemperatureScale: () => {},
  modalFeature: null,
  setModalFeature: () => {},
  savedCities: [],
  saveCity: () => {},
  isLoading: false,
  toggleLoading: () => {},
}

const UIContext = createContext<ContextValue>(defaultContext);

type UIContextProps = {
  children: ReactNode;
}

export const UIContextProvider: FC<UIContextProps> = (props) => {
  const { children } = props;
  const [saves, setSaves] = useState<GraphQL.CityFull[]>([]);
  const [frameBox, setFrameBox] = useState<DOMRect>(document.body.getBoundingClientRect());
  const [viewType, setViewType] = useState<App.ViewType>(defaultContext.viewType);
  const [temperatureScale, setTemperatureScale] = useState<App.ScaleType>(defaultContext.temperatureScale);
  const [modalFeature, setModalFeature] = useState<App.Feature | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(defaultContext.isLoading);

  const setFrame = <T extends HTMLElement>(ref: MutableRefObject<T | null>) => {
    const { current } = ref;
    if (current) {
      const frame = current.getBoundingClientRect();
      setFrameBox(frame);
    }
  };

  const setScale = (type: App.ScaleType) => {
    setTemperatureScale(type);
  };

  const setView = (type: App.ViewType) => {
    setViewType(type);
  };

  const setModal = (feature: App.Feature | null) => {
    setModalFeature(feature);
  };

  const toggleLoading = (force?: boolean) => {
    const nextState = force === undefined ? !isLoading : force;
    setIsLoading(nextState);
  }

  const saveCity = (city: GraphQL.CityFull) => {
    const newSaves = [...saves];
    const index = newSaves.findIndex(c => c.id === city.id);
    if (index === -1) {
      newSaves.push(city);
    } else {
      newSaves.splice(index, 1);
    }
    setSaves(newSaves);
  };

  const value: ContextValue = {
    setFrame,
    frame: frameBox,
    viewType,
    setViewType: setView,
    temperatureScale,
    setTemperatureScale: setScale,
    modalFeature,
    setModalFeature: setModal,
    savedCities: saves,
    saveCity,
    toggleLoading,
    isLoading,
  }

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export default UIContext;
