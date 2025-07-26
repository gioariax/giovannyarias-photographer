import React from 'react';
import { Backdrop, ContainerCentered } from '../components/SharedStyled';
import styled from 'styled-components';
import ContactForm from '@/components/ContactForm';

export const ContactContainer = styled.div`
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
`;

const Contact: React.FC = () => {
  return (
    <Backdrop>
      <ContainerCentered>
        <ContactContainer>
          <ContactForm />
        </ContactContainer>
      </ContainerCentered>
    </Backdrop>
  );
};

export default Contact;
