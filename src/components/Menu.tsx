import { MenuIcon } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const MenuContainer = styled.nav`
  display: flex;
  gap: 1rem;

  @media (max-width: 1000px) {
    display: none;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  
  svg {
    stroke: #000 !important;
  }

  @media (max-width: 1000px) {
    display: block;
  }
`;

const StyledLink = styled(NavLink)`
  color: #222;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  padding: 6px 16px;
  border-radius: 20px;
  &.active {
    color: #fff;
    background-color: #000;
  }
`;

const Menu: React.FC = () => (
  <>
    <MenuContainer>
      <StyledLink to="/">My Work</StyledLink>
      <StyledLink to="/about-me">About Me</StyledLink>
      <StyledLink to="/contact">Contact</StyledLink>
    </MenuContainer>
    <MenuButton>
      <MenuIcon />
    </MenuButton>
  </>
);

export default Menu;
