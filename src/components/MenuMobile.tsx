import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, CloseButton, Portal } from '@chakra-ui/react';
import { MenuIcon } from 'lucide-react';

const links = [
  { to: '/', label: 'My Work' },
  { to: '/about-me', label: 'About Me' },
  { to: '/contact', label: 'Contact' },
];

const MenuMobile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  return (
    <>
    <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Drawer.Trigger asChild>
        <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
        >
            <MenuIcon />
        </button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Menu</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              {links.map(link => (
                <Button
                  key={link.to}
                  colorScheme={location.pathname === link.to ? 'blackAlpha' : 'gray'}
                  variant={location.pathname === link.to ? 'solid' : 'ghost'}
                  onClick={() => { navigate(link.to); setOpen(false); }}
                  size="md"
                  mb={2}
                  width="100%"
                >
                  {link.label}
                </Button>
              ))}
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
    </>
  );
};

export default MenuMobile;
