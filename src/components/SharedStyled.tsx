import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 16px;
  width: calc(100% - 32px);
  box-sizing: border-box;

  @media (min-width: 1000px) {
    margin: 0 auto;
    width: 100%;
  }

  @media (min-width: 1000px) and (max-width: 1248px) {
    margin: 0 24px;
    width: calc(100% - 48px);
  }
`;

export const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

export const ContainerCentered = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;
