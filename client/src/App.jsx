import './App.css';
import Carousel from './Carousel';
import Recorder from './Recorder';
import Welcome from './Welcome';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const searchParams = new URLSearchParams(window.location.search);
const token = searchParams.get('auth');
const mode = searchParams.get('mode');
const DEV = process.env.NODE_ENV === 'development';

const Container = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  height: 100dvh;
  width: 100dvw;
`;

function App() {
  const [step, setStep] = useState(mode || 'welcome');
  const [isAuthenticated, setIsAuthenticated] = useState(DEV);

  useEffect(() => {
    if (!DEV && !!token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container>
      {step === 'welcome' && <Welcome onStart={() => setStep('record')} />}
      {step === 'record' && <Recorder onUploaded={() => setStep('uploaded')} />}
      {step === 'uploaded' && <Carousel />}
    </Container>
  );
}

export default App;
