import React from 'react';
import { Plus, RotateCcw, Minus } from 'lucide-react';
import './PlotZoomControls.css';

/**
 * Reusable PlotZoomControls component
 * Uniformly styled & positioned to align with the global floating WhatsApp button.
 */
const PlotZoomControls = ({ onZoomIn, onZoomReset, onZoomOut }) => {
  return (
    <div id="zoomControls" role="group" aria-label="Map Zoom Controls">
      <button id="zoomInBtn" aria-label="Zoom in" onClick={onZoomIn} title="Zoom In">
        <Plus className="zoom-icon" size={20} />
      </button>
      <button id="zoomResetBtn" aria-label="Reset zoom" onClick={onZoomReset} title="Reset View">
        <RotateCcw className="zoom-icon" size={16} />
      </button>
      <button id="zoomOutBtn" aria-label="Zoom out" onClick={onZoomOut} title="Zoom Out">
        <Minus className="zoom-icon" size={20} />
      </button>
    </div>
  );
};

export default PlotZoomControls;
