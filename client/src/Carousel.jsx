import Player from './Player';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

export default function Carousel() {
  const [position, setCurrentPosition] = useState(0);
  const [state, setState] = useState('welcome');
  const [assets, setAssets] = useState([]);

  const handleNext = useCallback(() => {
    setAssets(prevAssets => [...prevAssets, { id: prevAssets.length + 1 }]);
    setCurrentPosition(prevPosition => prevPosition + 1);
  }, []);

  useEffect(() => {
    let pollingTimeout;
    const start = async () => {
      const response = await fetch('/api/mux/assets_count');
      const { count } = await response.json();
      if (!count) {
        pollingTimeout = setTimeout(() => {
          start();
        }, 1000);
        return;
      }
      for (let i = 0; i < 5; i++) {
        setAssets(assets => [...assets, { id: assets.length + 1 }]);
      }
    };

    start();
    return () => clearTimeout(pollingTimeout);
  }, []);

  return (
    <Container>
      <Wrapper>
        <Slider style={{ transform: `translateX(-${position * 100}dvw)` }}>
          {assets.map((asset, index) => (
            <Player
              key={asset.id}
              id={asset.id}
              active={index === position && state === 'fun'}
              unmount={index < position}
            />
          ))}
        </Slider>
      </Wrapper>
      <Controls>
        <MagentaButton onClick={handleNext}>Next</MagentaButton>
      </Controls>
      {state === 'welcome' && (
        <Welcome>
          <Title>You're all set! 🚀</Title>
          <p>
            Your video has been uploaded successfully. Now it's time to start
            meeting amazing people and making real connections.
          </p>
          <p>Tap Let's go! and begin your journey to love! ❤️</p>
          <MagentaButton onClick={() => setState('fun')}>
            Let's Go!
          </MagentaButton>
        </Welcome>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  position: absolute;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  height: 100dvh;
  width: 100dvw;
  mux-player {
    --media-object-fit: cover;
    --media-object-position: center;
  }
`;

const Controls = styled.div`
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  flex-direction: column;
  z-index: 1;
  padding: 20px;
`;

const Wrapper = styled.div`
  display: flex;
  position: absolute;
  inset: 0;
  overflow: hidden;
  flex-direction: row;
  height: 100dvh;
  width: 100dvw;
  background: #000;
`;

const Slider = styled.div`
  display: flex;
  position: absolute;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  transition: transform 0.5s ease;
`;

const Welcome = styled.div`
  position: absolute;
  inset: 0;
  padding: 64px 24px 0;
  background: #000;
  font-size: 18px;
  text-align: center;
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 32px;
`;

const MagentaButton = styled.button`
  background-color: magenta;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  padding: 16px 32px;
  margin: 0 auto;
  display: block;
  position: absolute;
  bottom: 32px;
  left: 32px;
  right: 32px;
`;
