import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import styled from 'styled-components';

const QUESTIONS = [
  "What's your favorite Disney character?",
  'If you could instantly master one new skill, what would it be and why?',
  "What's your favorite way to spend a free afternoon?",
];

const SECONDS_PER_QUESTION = 15;

export default function Recorder({ onUploaded }) {
  const [uploadStatus, setUploadStatus] = useState('');
  const [countdown, setCountdown] = useState(-1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const countdownTimerRef = useRef(null);
  const recIndicatorRef = useRef(null);
  const recCounterRef = useRef(null);
  const questionTimerRef = useRef(null);
  const actionRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const questionTimerSecRef = useRef(-1);
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    previewStream,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
    blobPropertyBag: { type: 'video/mp4' },
  });

  const uploadToMux = useCallback(async () => {
    if (!mediaBlobUrl) return;

    try {
      const response = await fetch('/api/mux/upload-url', {
        method: 'POST',
      });
      const { uploadUrl, uploadId } = await response.json();

      const blob = await fetch(mediaBlobUrl).then(r => r.blob());

      setUploadStatus('uploading');

      await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'video/mp4',
        },
      });

      let assetIsReady = false;
      while (!assetIsReady) {
        const assetResponse = await fetch(`/api/mux/upload/${uploadId}`);
        const asset = await assetResponse.json();
        assetIsReady = asset.status === 'asset_created';
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setUploadStatus('success');
      clearBlobUrl();
      onUploaded();
    } catch (error) {
      console.error('Upload failed', error);
      setUploadStatus('failed');
    }
  }, [clearBlobUrl, mediaBlobUrl, onUploaded]);

  useEffect(() => {
    if (videoPreviewRef.current && previewStream) {
      videoPreviewRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  const startQuestionsSequence = useCallback(() => {
    let questionIndex = currentQuestionIndex;
    questionTimerRef.current = setInterval(() => {
      // Some direct DOM manipulations to prevent video flickering
      const secondsLeft = questionTimerSecRef.current;
      secondsLeft > 1
        ? recIndicatorRef.current.classList.add('active')
        : recIndicatorRef.current.classList.remove('active');
      recCounterRef.current.innerText = secondsLeft + 's';
      questionTimerSecRef.current = secondsLeft - 1;
      if (secondsLeft <= 1) {
        questionIndex++;
        if (questionIndex === QUESTIONS.length - 1) {
          clearInterval(questionTimerRef.current);
          setCurrentQuestionIndex(-1);
          setUploadStatus('ready');
          actionRef.current.stopRecording();
          return;
        }
        setCurrentQuestionIndex(prevQuestion => prevQuestion + 1);
        questionTimerSecRef.current = SECONDS_PER_QUESTION;
      }
    }, 1000);
  }, [currentQuestionIndex]);

  const initiateRecording = useCallback(() => {
    setCurrentQuestionIndex(0);
    startRecording();

    questionTimerSecRef.current = SECONDS_PER_QUESTION;
    startQuestionsSequence();
  }, [startQuestionsSequence, startRecording]);

  useEffect(() => {
    actionRef.current = { startRecording, stopRecording, initiateRecording };
  }, [startRecording, stopRecording, initiateRecording]);

  const startCountdown = useCallback(() => {
    setUploadStatus('');
    setCountdown(3);
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount < 1) {
          clearInterval(countdownTimerRef.current);
          actionRef.current.initiateRecording();
          return -1;
        }
        return prevCount - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startCountdown();
    return () => {
      clearInterval(countdownTimerRef.current);
      clearInterval(questionTimerRef.current);
    };
  }, [startCountdown]);

  return (
    <Container>
      <RecordedVideoPreview ref={videoPreviewRef} autoPlay playsInline />
      {mediaBlobUrl && status !== 'recording' && (
        <InProgressVideoPreview src={mediaBlobUrl} autoPlay playsInline />
      )}
      {countdown > 0 && (
        <Countdown>
          <h1>{countdown}</h1>
        </Countdown>
      )}
      {QUESTIONS.map((question, index) => (
        <Question
          key={index}
          style={{
            transform:
              currentQuestionIndex === index ? 'translateY(0)' : undefined,
          }}
        >
          <div>{question}</div>
        </Question>
      ))}
      {status === 'recording' && (
        <>
          <RecIndicator ref={recIndicatorRef}>
            REC
            <span className="dot" />
          </RecIndicator>
          <RecCounter ref={recCounterRef} />
        </>
      )}
      <Congratulations
        style={{
          transform: uploadStatus === 'ready' ? 'translateY(0)' : undefined,
        }}
      >
        <div>
          Congratulations! 🎉
          <br />
          You've successfully recorded your video! If you'd like to give it
          another try, just tap Re-record. If you're happy with your answers,
          hit Upload and start your journey to finding love! ❤️✨
        </div>
      </Congratulations>
      {(uploadStatus === 'ready' || uploadStatus === 'uploading') && (
        <Controls>
          <RecordAgainButton
            onClick={startCountdown}
            disabled={uploadStatus === 'uploading'}
          >
            Re-record
          </RecordAgainButton>
          <SubmitButton
            disabled={uploadStatus === 'uploading'}
            onClick={uploadToMux}
          >
            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
          </SubmitButton>
        </Controls>
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
`;

const RecordedVideoPreview = styled.video`
  position: absolute;
  inset: 0;
  height: 100dvh;
  width: 100dvw;
  object-fit: cover;
`;

const InProgressVideoPreview = styled.video`
  position: absolute;
  inset: 0;
  height: 100dvh;
  width: 100dvw;
  object-fit: cover;
`;

const Countdown = styled.div`
  position: absolute;
  inset: 0;
  font-size: 96px;
  text-align: center;
  justify-content: center;
  h1 {
    display: inline-block;
    margin: 64px auto;
    text-shadow:
      1px 1px 1px magenta,
      1px 2px 1px magenta,
      1px 3px 1px magenta,
      1px 4px 1px magenta;
  }
`;

const Question = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: transform 0.5s ease;
  transform: translateY(50dvh);
  padding: 24px;
  div {
    padding: 8px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    background: magenta;
    color: white;
    border-radius: 8px;
    border: 2px solid white;
  }
`;

const RecIndicator = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  color: red;
  font-weight: bold;
  display: flex;
  align-items: center;
  font-size: 20px;
  span.dot {
    background: red;
    border-radius: 50%;
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: 0 4px;
    opacity: 0;
  }

  &.active span.dot {
    animation: pulse 0.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const RecCounter = styled.span`
  position: absolute;
  top: 18px;
  right: 24px;
  font-size: 24px;
  color: #fff;
  font-weight: bold;
  text-shadow:
    1px 1px 1px magenta,
    1px 2px 1px magenta,
    1px 3px 1px magenta,
    1px 4px 1px magenta;
`;

const Controls = styled.div`
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: row;
  gap: 16px;
  z-index: 1;
  padding: 24px;
`;

const SubmitButton = styled.button`
  flex: 1;
  background: magenta;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 16px 32px;
  border-radius: 8px;
  border: 2px solid white;
`;

const RecordAgainButton = styled.button`
  flex: 1;
  background: #242424;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 16px 32px;
  border-radius: 8px;
  border: 2px solid white;
`;

const Congratulations = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: transform 0.5s ease;
  transform: translateY(50dvh);
  padding: 0 24px 96px;
  div {
    padding: 8px;
    text-align: center;
    font-size: 16px;
    background: #242424;
    opacity: 0.8;
    color: white;
    border-radius: 8px;
    border: 2px solid white;
  }
`;
