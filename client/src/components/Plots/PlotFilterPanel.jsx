import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import './PlotFilterPanel.css';

/**
 * Reusable PlotFilterPanel for interactive layout maps.
 * Filters plot paths in real-time by status (All, Available, Booked, Registered, Blocked).
 * On screens <= 768px, functions as a smooth mobile accordion drawer.
 */
const PlotFilterPanel = ({ activeFilter, onFilterChange, statusCounts = {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = [
    { key: 'all', label: 'All Plots', colorClass: 'filter-all' },
    { key: 'available', label: 'Available', colorClass: 'filter-available' },
    { key: 'booked', label: 'Booked', colorClass: 'filter-booked' },
    { key: 'registered', label: 'Registered', colorClass: 'filter-registered' },
    { key: 'blocked', label: 'Blocked', colorClass: 'filter-blocked' }
  ];

  const currentOption = filterOptions.find((opt) => opt.key === activeFilter) || filterOptions[0];
  const activeCount = statusCounts[currentOption.key] !== undefined ? statusCounts[currentOption.key] : null;

  const handleSelect = (key) => {
    onFilterChange(key);
    setIsOpen(false);
  };

  return (
    <div className={`plot-filter-panel ${isOpen ? 'accordion-open' : ''}`} role="toolbar" aria-label="Plot Map Filters">
      {/* Desktop Filter Title */}
      <span className="filter-panel-title">Filter:</span>

      {/* Mobile Accordion Header Trigger (Visible on screens <= 768px) */}
      <button
        type="button"
        className="filter-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle status filters"
      >
        <div className="accordion-title-group">
          <Filter size={13} className="accordion-filter-icon" />
          <span className="accordion-label-text">Filter:</span>
          <span className={`accordion-active-chip ${currentOption.colorClass}`}>
            <span className="filter-btn-dot" />
            <span>{currentOption.label}</span>
            {activeCount !== null && <span className="filter-count-badge">{activeCount}</span>}
          </span>
        </div>
        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {/* Filter Buttons Container (Desktop normal / Mobile Accordion Body) */}
      <div className="filter-panel-buttons">
        {filterOptions.map((opt) => {
          const count = statusCounts[opt.key] !== undefined ? statusCounts[opt.key] : null;
          return (
            <button
              key={opt.key}
              type="button"
              className={`plot-map-filter-btn ${opt.colorClass} ${activeFilter === opt.key ? 'active' : ''}`}
              onClick={() => handleSelect(opt.key)}
            >
              <span className="filter-btn-dot" />
              <span>{opt.label}</span>
              {count !== null ? (
                <span className="filter-count-badge">{count}</span>
              ) : (
                <span className="filter-count-badge skeleton-box" style={{ width: '18px', height: '13px', display: 'inline-block' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlotFilterPanel;
