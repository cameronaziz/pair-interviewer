import { useContext, VFC } from 'react';
import FourOhFour from './components/fourOhFour';
import context from './context/routing';
import Country from './pages/country';
import WorldMap from './pages/world';

const Routing: VFC = () => {
  const { page } = useContext(context);

  switch (page) {
    case 'world': return <WorldMap />;
    case 'country': return <Country />;
    default : return <FourOhFour />;
  }
};

export default Routing;
