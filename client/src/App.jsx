import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Plot1 from './pages/plots/Plot1';
import './css/global.css';
import './css/responsive.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plot-1" element={<Plot1 />} />
          <Route path="/plot-1.html" element={<Plot1 />} />
          <Route path="/layout/1" element={<Plot1 />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
