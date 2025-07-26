import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyWork from './pages/MyWork';
import AboutMe from './pages/AboutMe';
import Contact from './pages/Contact';
import Layout from './components/Layout';
import { LightMode } from "@/components/ui/color-mode"

function App() {
  return (
    <Router>
      <LightMode>
        <Layout>
          <Routes>
            <Route path="/" element={<MyWork />} />
            <Route path="/about-me" element={<AboutMe />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Layout>
      </LightMode>
    </Router>
  );
}

export default App
