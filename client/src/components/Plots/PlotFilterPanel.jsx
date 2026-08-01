import React from 'react';
import './PlotFilterPanel.css';

/**
 * Reusable PlotFilterPanel for interactive layout maps
 * Filters plot paths in real-time by status (All, Available, Booked, Registered, Blocked).
 */
const PlotFilterPanel = ({ activeFilter, onFilterChange, statusCounts = {} }) => {
  const filterOptions = [
    { key: 'all', label: 'All Plots', colorClass: 'filter-all' },
    { key: 'available', label: 'Available', colorClass: 'filter-available' },
    { key: 'booked', label: 'Booked', colorClass: 'filter-booked' },
    { key: 'registered', label: 'Registered', colorClass: 'filter-registered' },
    { key: 'blocked', label: 'Blocked', colorClass: 'filter-blocked' }
  ];

  return (
    <div className="plot-filter-panel" role="toolbar" aria-label="Plot Map Filters">
      <span className="filter-panel-title">Filter:</span>
      <div className="filter-panel-buttons">
        {filterOptions.map((opt) => {
          const count = statusCounts[opt.key] !== undefined ? statusCounts[opt.key] : null;
          return (
            <button
              key={opt.key}
              className={`plot-map-filter-btn ${opt.colorClass} ${activeFilter === opt.key ? 'active' : ''}`}
              onClick={() => onFilterChange(opt.key)}
            >
              <span className="filter-btn-dot" />
              <span>{opt.label}</span>
              {count !== null && <span className="filter-count-badge">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlotFilterPanel;
