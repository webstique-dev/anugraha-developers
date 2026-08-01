import React from 'react';
import { Link } from 'react-router-dom';
import './PlotBreadcrumb.css';

/**
 * Reusable PlotBreadcrumb component for layout pages
 */
const PlotBreadcrumb = ({ layoutTitle = 'Appanaikenpatty Phase 1' }) => {
  return (
    <nav id="breadcrumb" aria-label="Breadcrumb">
      <Link to="/" class="bc-back" aria-label="Go back to Home">
        &#8592;
      </Link>
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <span className="bc-sep" aria-hidden="true">›</span>
          <Link to="/#projects">Layouts</Link>
        </li>
        <li className="bc-current" aria-current="page">
          <span className="bc-sep" aria-hidden="true">›</span>
          {layoutTitle}
        </li>
      </ol>
    </nav>
  );
};

export default PlotBreadcrumb;
