import React from 'react';
import './PlotZoomControls.css';

/**
 * Reusable PlotZoomControls component
 */
const PlotZoomControls = ({ onZoomIn, onZoomReset, onZoomOut }) => {
  return (
    <div id="zoomControls">
      <button id="zoomInBtn" aria-label="Zoom in" onClick={onZoomIn}>
        +
      </button>
      <button id="zoomResetBtn" aria-label="Reset zoom" onClick={onZoomReset} style={{ fontSize: '14px' }}>
        ⟳
      </button>
      <button id="zoomOutBtn" aria-label="Zoom out" onClick={onZoomOut}>
        −
      </button>
    </div>
  );
};

export default PlotZoomControls;
