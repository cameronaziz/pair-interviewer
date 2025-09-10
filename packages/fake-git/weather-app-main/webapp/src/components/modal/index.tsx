import { useLazyQuery } from '@apollo/client';
import { MouseEvent, useContext, useEffect, VFC } from 'react';
import UIContext from '../../context/ui';
import queries from '../../graphql/queries';
import Compare from './compare';
import ModalContent from './content';
import './style.css';

const isCity = (unknown: App.Feature): unknown is GraphQL.CityFull =>
  typeof (unknown as GraphQL.City).id !== 'undefined';

const Modal: VFC = () => {
  const { modalFeature, setModalFeature, savedCities, saveCity } = useContext(UIContext);
  const [getCity, { data, loading }] = useLazyQuery<GraphQL.Query.CityFull, GraphQL.Query.CityFullArgs>(queries.CITY_FULL);
  const isSaved = savedCities.some(c => c.id === data?.City?.id);


  useEffect(
    () => {
      if (modalFeature) {
        if (isCity(modalFeature)) {
          getCity({ variables: { id: modalFeature.id } });
        }
      }
    },
    [modalFeature],
  );

  if (!modalFeature) {
    return null;
  }

  if (modalFeature === true) {
    return <Compare />
  }

  const closeModal = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setModalFeature(null);
    }
  };

  const save = () => {
    if (!data) {
      return;
    }
    const { City: city} = data!
    if (isCity(city)) {
      saveCity(city);
    }
  }

  return (
    <div className="modal-full-screen" onClick={closeModal}>
      <div className="modal-container">
        <div className="modal-title">
        {modalFeature.name}{data?.City?.country.name ? `, ${data.City.country.name}` : ''}
        </div>
        <div className="modal-content">
          <ModalContent data={data} loading={loading} />
        </div>
        <div className="modal-button save" onClick={save}>
          <div className="center" onClick={save}>
          {isSaved ? '-' : '+'}
          </div>
        </div>
        <div className="modal-button close" onClick={closeModal}>
          <div className="center" onClick={closeModal}>
            X
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
