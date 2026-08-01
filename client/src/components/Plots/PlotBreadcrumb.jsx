import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import './PlotBreadcrumb.css';

/**
 * Reusable PlotBreadcrumb component for layout pages
 */
const PlotBreadcrumb = ({ layoutTitle = 'Appanaikenpatty Phase 1' }) => {
  return (
    <nav id="breadcrumb" aria-label="Breadcrumb">
      <Link to="/" className="bc-back" aria-label="Go back to Home">
        <ArrowLeft size={15} />
      </Link>
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <span className="bc-sep" aria-hidden="true">
            <ChevronRight size={11} />
          </span>
          <Link to="/#projects">Layouts</Link>
        </li>
        <li className="bc-current" aria-current="page">
          <span className="bc-sep" aria-hidden="true">
            <ChevronRight size={11} />
          </span>
          {layoutTitle}
        </li>
      </ol>
    </nav>
  );
};

export default PlotBreadcrumb;
