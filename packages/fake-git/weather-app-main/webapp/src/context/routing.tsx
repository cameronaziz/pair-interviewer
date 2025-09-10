import { createContext, FC, ReactNode, useState } from 'react';

type ContextValue = {
  page: App.Page;
  params: Record<string, string>;
  navigate(page: App.Page, params?: Record<string, any>): void;
}

const defaultContext: ContextValue = {
  page: 'world',
  navigate: () => {},
  params: {},
}

const RoutingContext = createContext<ContextValue>(defaultContext);

type RoutingContextProps = {
  children: ReactNode;
}

export const RoutingContextProvider: FC<RoutingContextProps> = (props) => {
  const { children } = props;
  const [page, setPage] = useState<App.Page>(defaultContext.page);
  const [params, setParams] = useState<Record<string, string>>(defaultContext.params);

  const navigate = (page: App.Page, params?: Record<string, any>) => {
    setPage(page);
    const nextParams = params || {};
    setParams(nextParams);
  };

  const value: ContextValue = {
    page,
    navigate,
    params,
  }

  return (
    <RoutingContext.Provider value={value}>
      {children}
    </RoutingContext.Provider>
  );
}

export default RoutingContext;
