import './App.css';
import Carousel from './Carousel';
import Recorder from './Recorder';
import Welcome from './Welcome';
import React, { useEffect, useRef, useState } from 'react';
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
  const streamRef = useRef(null);

  useEffect(() => {
    if (!DEV && !!token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleStartRecording = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(stream => {
        streamRef.current = stream;
        setStep('record');
      })
      .catch(function (error) {
        if (error.name === 'NotAllowedError') {
          alert(
            'To use this app, please enable camera and microphone access in your browser settings.',
          );
        }
      });
  };

  const handleFinishUpload = () => {
    streamRef.current?.getTracks().forEach(track => {
      track.stop();
    });
    setStep('uploaded');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container>
      {step === 'welcome' && <Welcome onStart={handleStartRecording} />}
      {step === 'record' && <Recorder onUploaded={handleFinishUpload} />}
      {step === 'uploaded' && <Carousel />}
    </Container>
  );
}

export default App;
