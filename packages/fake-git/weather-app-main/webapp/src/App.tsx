import React, { useContext, useEffect, useRef, VFC } from 'react';
import './App.css';
import Controls from './components/controls';
import Modal from './components/modal';
import UIContext from './context/ui';
import Router from './router';

const App: VFC = () => {
  const { setFrame } = useContext(UIContext);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      setFrame(frameRef);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frameRef],
  );

  return (
    <div className="app-container">
      <Modal />
      <div className="map-container">
        <Controls />
        <div ref={frameRef} className="frame">
          <img alt="background" src="/paper.png" className="background" />
          <Router />
        </div>
      </div>
    </div>
  );
}

export default App;
