import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, CloseButton, Portal } from "@chakra-ui/react"
import { Dialog } from "@chakra-ui/react"
import ContactForm from './ContactForm';
import { useAppStore } from '@/store/appStore';
import MenuMobile from './MenuMobile';

const MenuContainer = styled.nav`
  display: flex;
  gap: 1rem;

  @media (max-width: 1000px) {
    display: none;
  }
`;

const MenuMobileContainer = styled.div`
  display: none;
  cursor: pointer;
  margin: -16px 0 0 0;

  @media (max-width: 1000px) {
    display: block;
  }
`;

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [size] = React.useState<'sm' | 'md' | 'lg'>('md');
  const links = [
    { to: '/', label: 'My Work' },
    { to: '/about-me', label: 'About Me' },
  ];
  const [open, setOpen] = React.useState(false);
  const setShowBlur = useAppStore(state => state.setShowBlur);
  
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
        <Dialog.Root
          open={open}
          onOpenChange={(details) => setOpen(details.open)}
          onExitComplete={() => { setShowBlur(false); }}
          key={size}
          size={size}
        >
          <Dialog.Trigger asChild>
            <Button size="sm" variant={'ghost'} onClick={() => { setOpen(true); setShowBlur(true); }}>
              Contact
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Contact</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <ContactForm onCancel={() => { setOpen(false); setShowBlur(false); }} />
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" onClick={() => { setShowBlur(false); }} />
                  </Dialog.CloseTrigger>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </MenuContainer>
      <MenuMobileContainer>
        <MenuMobile />
      </MenuMobileContainer>
    </>
  );
};

export default Menu;
