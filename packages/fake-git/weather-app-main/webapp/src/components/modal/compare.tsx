import { MouseEvent, useContext, VFC } from 'react';
import UIContext from '../../context/ui';
import CompareContent from './compareContent';
import './style.css';

const Compare: VFC = () => {
  const { modalFeature, setModalFeature, savedCities } = useContext(UIContext);

  if (!modalFeature) {
    return null;
  }

  const closeModal = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setModalFeature(null);
    }
  };

  return (
    <div className="modal-full-screen" onClick={closeModal}>
      <div className="modal-container">
        <div className="modal-title">
          Compare
        </div>
        <div className="modal-content vertical">
          {savedCities.map((save) =>
            <div className="modal-vertical">
              <div className="modal-vertical-title">{save.name}</div>
              <CompareContent key={save.id} save={save} />
            </div>
          )}
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

export default Compare;
