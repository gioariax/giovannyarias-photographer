import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyWork from './pages/MyWork';
import AboutMe from './pages/AboutMe';
import Contact from './pages/Contact';
import Layout from './components/Layout';
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode"
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';


function usePageView() {
  const location = useLocation();
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-017F926TGP', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
}

function PageViewWrapper({ children }: { children: React.ReactNode }) {
  usePageView();
  return <>{children}</>;
}

function App() {
  const colorMode = useColorModeValue("<light-mode-value>", "<dark-mode-value>");
  const { toggleColorMode } = useColorMode()
  if(colorMode === "<dark-mode-value>") {
    toggleColorMode();
  }
  return (
    <Router>
      <PageViewWrapper>
        <Layout>
          <Routes>
            <Route path="/" element={<MyWork />} />
            <Route path="/about-me" element={<AboutMe />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Layout>
      </PageViewWrapper>
    </Router>
  );
}

export default App
