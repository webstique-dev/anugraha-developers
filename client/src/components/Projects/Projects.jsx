import React, { useState } from 'react';
import SectionTitle from '../Common/SectionTitle/SectionTitle';
import PropertyCard from '../Common/PropertyCard/PropertyCard';
import Button from '../Common/Button/Button';
import { PROPERTIES_DATA } from '../../data/mockData';
import './Projects.css';

const filterOptions = ['All Layouts', 'DTCP Approved', 'Gated', 'Commercial'];

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('All Layouts');

  const filteredProperties = PROPERTIES_DATA.filter((item) => {
    if (activeFilter === 'All Layouts') return true;
    return item.category.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <section id="projects" className="section-padding projects-section">
      <div className="container">
        <SectionTitle
          badge="EXCLUSIVE OPPORTUNITIES"
          title="Featured Layouts"
          subtitle="Explore our handpicked selection of DTCP & RERA-approved premium land layouts in Coimbatore's highest appreciation growth corridors."
        />

        <div className="projects-filter-bar">
          {filterOptions.map((filter, idx) => (
            <button
              key={idx}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

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
