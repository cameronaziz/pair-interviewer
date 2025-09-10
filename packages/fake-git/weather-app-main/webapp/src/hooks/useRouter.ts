import { useContext } from 'react';
import RoutingContext from '../context/routing';

const useRouter = () => {
  const { navigate, page } = useContext(RoutingContext);

  return [navigate, page] as const;
};

export default useRouter;
