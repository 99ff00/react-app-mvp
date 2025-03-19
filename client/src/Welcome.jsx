import './App.css';
import React from 'react';
import styled from 'styled-components';

export default function Welcome({ onStart }) {
  return (
    <Container>
      <Title>Video Speed Dating</Title>
      <p>Welcome to the ultimate video speed dating experience! 💕</p>
      <p>
        Before you start finding your perfect match, take a moment to record a
        short video answering three fun questions. You'll have 15 seconds per
        answer, and don't worry – you can re-record if needed!
      </p>
      <p>Ready to dive in and spark some real connections? Let's go! 🎥✨</p>
      <StartButton onClick={onStart}>Start</StartButton>
    </Container>
  );
}

const Container = styled.div`
  position: absolute;
  inset: 0;
  padding: 64px 32px 0;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 32px;
`;

const StartButton = styled.button`
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
