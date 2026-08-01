import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Plot1 from './pages/plots/Plot1';
import FloatingWhatsapp from './components/Common/FloatingWhatsapp/FloatingWhatsapp';
import './css/global.css';
import './css/responsive.css';

/**
 * ScrollToTop component resets viewport scroll position to top whenever route changes.
 * Fixes scroll retention during browser back/forward navigation.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plot-1" element={<Plot1 />} />
          <Route path="/plot-1.html" element={<Plot1 />} />
          <Route path="/plot-:id" element={<Plot1 />} />
          <Route path="/plot-:id.html" element={<Plot1 />} />
          <Route path="/layout" element={<Plot1 />} />
          <Route path="/layout/:id" element={<Plot1 />} />
          <Route path="/layout/:id.html" element={<Plot1 />} />
          <Route path="/pages/plots/plot1.jsx" element={<Plot1 />} />
          <Route path="/pages/plots/plot1" element={<Plot1 />} />
          <Route path="*" element={<Home />} />
        </Routes>

        {/* Global Floating WhatsApp Button visible on all pages */}
        <FloatingWhatsapp />
      </Router>
    </HelmetProvider>
  );
}

export default App;
