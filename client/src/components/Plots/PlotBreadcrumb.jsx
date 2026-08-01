import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import logoPng from '../../assets/logo/logo.png';
import './PlotBreadcrumb.css';

/**
 * Reusable PlotHeader & Breadcrumb component for layout pages.
 * Displays Company Logo & Brand Name at top-left, integrated with breadcrumb navigation.
 */
const PlotBreadcrumb = ({ layoutTitle = 'Appanaikenpatty Phase 1' }) => {
  return (
    <div id="plot-header-card" className="plot-header-card">
      {/* Company Logo & Brand Name */}
      <Link to="/" className="plot-brand-group" title="Anugraha Developers Home">
        <img src={logoPng} alt="Anugraha Developers Logo" className="plot-brand-logo" />
        <div className="plot-brand-text">
          <span className="brand-title">ANUGRAHA</span>
          <span className="brand-subtitle">DEVELOPERS</span>
        </div>
      </Link>

      <span className="plot-header-divider" aria-hidden="true" />

      {/* Integrated Breadcrumb Navigation */}
      <nav className="plot-breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/" className="bc-back" aria-label="Go back to Home" title="Back to Home">
          <ArrowLeft size={14} />
        </Link>
        <ol className="bc-list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <ChevronRight size={11} className="bc-sep" />
            <Link to="/#projects">Layouts</Link>
          </li>
          <li className="bc-current" aria-current="page">
            <ChevronRight size={11} className="bc-sep" />
            <span className="bc-current-text">{layoutTitle}</span>
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PlotBreadcrumb;
