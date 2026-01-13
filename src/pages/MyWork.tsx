import React from 'react';
import Gallery from '../components/Gallery';
import { Container } from '../components/SharedStyled';

const MyWork: React.FC = () => {
  return (
    <Container style={{ display: 'flex', flex: 1 }}>
      <Gallery />
    </Container>
  );
};

export default MyWork;
