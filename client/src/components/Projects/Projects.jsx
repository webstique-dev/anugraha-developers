import React, { useState } from 'react';
import SectionTitle from '../Common/SectionTitle/SectionTitle';
import PropertyCard from '../Common/PropertyCard/PropertyCard';
import Button from '../Common/Button/Button';
import { SkeletonPropertyCard } from '../Common/Skeleton/Skeleton';
import { PROPERTIES_DATA } from '../../data/mockData';
import './Projects.css';

const categoryFilters = ['All Layouts', 'DTCP Approved', 'Gated', 'Commercial'];

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState('All Layouts');
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const handleCategoryChange = (category) => {
    if (category === activeCategory) return;
    setIsFilterLoading(true);
    setActiveCategory(category);
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 220);
  };

  const filteredProperties = PROPERTIES_DATA.filter((item) => {
    return (
      activeCategory === 'All Layouts' ||
      item.category.toLowerCase().includes(activeCategory.toLowerCase())
    );
  });

  return (
    <section id="projects" className="section-padding projects-section">
      <div className="container">
        <SectionTitle
          badge="EXCLUSIVE OPPORTUNITIES"
          title="Featured Layouts"
          subtitle="Explore our handpicked selection of DTCP & RERA-approved premium land layouts in Coimbatore's highest appreciation growth corridors."
        />

        {/* Dual Filter Controls: Category */}
        <div className="projects-filter-wrapper">
          <div className="filter-group">
            <span className="filter-group-label">Category:</span>
            <div className="projects-filter-bar">
              {categoryFilters.map((filter, idx) => (
                <button
                  key={idx}
                  className={`filter-btn ${activeCategory === filter ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {isFilterLoading ? (
          <div className="projects-grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonPropertyCard key={idx} />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
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
              onClick={() => handleCategoryChange('All Layouts')}
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
