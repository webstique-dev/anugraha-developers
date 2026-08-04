import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logoPng from '../../assets/logo/logo.png';
import './PlotBreadcrumb.css';

/**
 * Reusable PlotHeader & Action Bar container (`plot-header-card`).
 * Houses Brand Logo, Navigation, Filter Section (on left), and Action Buttons (Add Plot & Admin Pill).
 */
const PlotBreadcrumb = ({
  layoutTitle = 'Appanaikenpatty Phase 1',
  filterPanel = null,
  adminControls = null
}) => {
  return (
    <div id="plot-header-card" className="plot-header-card">
      {/* 1. Company Logo & Brand Name */}
      <Link to="/" className="plot-brand-group" title="Anugraha Developers Home">
        <img src={logoPng} alt="Anugraha Developers Logo" className="plot-brand-logo" />
        <div className="plot-brand-text">
          <span className="brand-title">ANUGRAHA</span>
          <span className="brand-subtitle">DEVELOPERS</span>
        </div>
      </Link>

      <span className="plot-header-divider" aria-hidden="true" />

      {/* 2. Integrated Breadcrumb / Back Navigation */}
      <nav className="plot-breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/" className="bc-back" aria-label="Go back to Home" title="Back to Home">
          <ArrowLeft size={14} />
        </Link>
      </nav>

      {/* 3. Filter Section (positioned on left side inside plot-header-card) */}
      {filterPanel && (
        <>
          <span className="plot-header-divider filter-divider" aria-hidden="true" />
          <div className="plot-header-filter-slot">{filterPanel}</div>
        </>
      )}

      {/* 4. Action Buttons (Add Plot & Admin Mode Pill on right side) */}
      {adminControls && (
        <>
          <span className="plot-header-divider actions-divider" aria-hidden="true" />
          <div className="plot-header-actions-slot">{adminControls}</div>
        </>
      )}
    </div>
  );
};

export default PlotBreadcrumb;
