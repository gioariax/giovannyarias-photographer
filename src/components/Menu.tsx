import { MenuIcon } from 'lucide-react';
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from "@chakra-ui/react"

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



const Menu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const links = [
    { to: '/', label: 'My Work' },
    { to: '/about-me', label: 'About Me' },
    { to: '/contact', label: 'Contact' },
  ];
  return (
    <>
      <MenuContainer>
        {links.map(link => (
          <Button
            key={link.to}
            colorScheme={location.pathname === link.to ? 'blackAlpha' : 'gray'}
            variant={location.pathname === link.to ? 'solid' : 'ghost'}
            onClick={() => navigate(link.to)}
            size="sm"
            mr={2}
          >
            {link.label}
          </Button>
        ))}
      </MenuContainer>
      <MenuButton>
        <MenuIcon />
      </MenuButton>
    </>
  );
};

export default Menu;
