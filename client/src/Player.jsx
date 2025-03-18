import MuxPlayer from '@mux/mux-player-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const PlayerContainer = styled.div`
  height: 100dvh;
  width: 100dvw;
`;

export default function Player({ active, unmount }) {
  const [asset, setAsset] = useState(null);
  const playerRef = useRef(null);
  const [isUnmounted, setisUnmounted] = useState(unmount);

  const loadAsset = useCallback(async () => {
    const response = await fetch(`/api/mux/random_asset`);
    const { asset } = await response.json();
    setAsset(asset);
  }, []);

  useEffect(() => {
    if (asset) {
      return;
    }
    loadAsset();
  }, [asset, loadAsset]);

  useEffect(() => {
    if (!unmount) {
      return;
    }
    const timer = setTimeout(() => {
      setisUnmounted(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [unmount]);

  return (
    <PlayerContainer>
      {!!asset && !isUnmounted && (
        <MuxPlayer
          ref={playerRef}
          autoPlay={active ? 'any' : false}
          playing={active}
          loop={true}
          muted={false}
          playbackId={asset.playback_ids[0].id}
          metadata={{ video_id: asset.id }}
          height="100%"
          style={{
            width: '100dvw',
            height: '100dvh',
            objectFit: 'cover',
          }}
        />
      )}
    </PlayerContainer>
  );
}
