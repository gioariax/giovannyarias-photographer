import React from 'react';
import styled from 'styled-components';
import logo from '../assets/images/giovannyarias-logo.svg';
import { Container } from './SharedStyled';
import Menu from './Menu';

const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  justify-content: space-between;
  gap: 16px
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 1000px) {
    width: 100%;
  }
`;

const Name = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Job = styled.div`
  font-size: 1rem;
  font-weight: normal;
  margin-top: -6px;
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Container>
        <Header>
          <Brand>
            <Logo src={logo} alt="Logo Giovanny Arias" />
            <Name>
              <span>
                Giovanny Arias
              </span>
              <Job>
                Photographer
              </Job>
            </Name>
          </Brand>
          <Menu />
        </Header>
      </Container>
      {children}
    </>
  );
};

export default Layout;
