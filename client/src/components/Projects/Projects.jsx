import React, { useState } from 'react';
import SectionTitle from '../Common/SectionTitle/SectionTitle';
import PropertyCard from '../Common/PropertyCard/PropertyCard';
import Button from '../Common/Button/Button';
import { PROPERTIES_DATA } from '../../data/mockData';
import './Projects.css';

const categoryFilters = ['All Layouts', 'DTCP Approved', 'Gated', 'Commercial'];
const statusFilters = ['All Statuses', 'Available', 'Booked', 'Sold', 'Reserved'];

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('All Layouts');
  const [activeStatus, setActiveStatus] = useState('All Statuses');

  // Dynamic filtering based on both Category and Availability Status
  const filteredProperties = PROPERTIES_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === 'All Layouts' ||
      item.category.toLowerCase().includes(activeCategory.toLowerCase());

    const matchesStatus =
      activeStatus === 'All Statuses' ||
      (item.availability && item.availability.toLowerCase() === activeStatus.toLowerCase());

    return matchesCategory && matchesStatus;
  });

  return (
    <section id="projects" className="section-padding projects-section">
      <div className="container">
        <SectionTitle
          badge="EXCLUSIVE OPPORTUNITIES"
          title="Featured Layouts"
          subtitle="Explore our handpicked selection of DTCP & RERA-approved premium land layouts in Coimbatore's highest appreciation growth corridors."
        />

        {/* Dual Filter Controls: Category & Availability Status */}
        <div className="projects-filter-wrapper">
          {/* Category Filter */}
          <div className="filter-group">
            <span className="filter-group-label">Category:</span>
            <div className="projects-filter-bar">
              {categoryFilters.map((filter, idx) => (
                <button
                  key={idx}
                  className={`filter-btn ${activeCategory === filter ? 'active' : ''}`}
                  onClick={() => setActiveCategory(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          {/* <div className="filter-group">
            <span className="filter-group-label">Status:</span>
            <div className="projects-filter-bar status-filter-bar">
              {statusFilters.map((status, idx) => (
                <button
                  key={idx}
                  className={`filter-btn status-btn ${activeStatus === status ? 'active' : ''} status-btn-${status.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActiveStatus(status)}
                >
                  {status !== 'All Statuses' && <span className="filter-status-dot" />}
                  {status}
                </button>
              ))}
            </div>
          </div> */}
        </div>

        {/* Projects Grid */}
        {filteredProperties.length > 0 ? (
          <div className="projects-grid">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="projects-empty-state">
            <p>No plots match the selected status and category filters.</p>
            <button
              className="reset-filters-btn"
              onClick={() => {
                setActiveCategory('All Layouts');
                setActiveStatus('All Statuses');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="projects-load-more">
          <Button variant="outline" size="lg">
            View All 120+ Completed Projects
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Projects;
