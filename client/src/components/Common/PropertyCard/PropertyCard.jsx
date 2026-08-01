import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import Button from '../Button/Button';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  const {
    id,
    title,
    status,
    location,
    price,
    pricePerSqft,
    area,
    roadWidth,
    category,
    image,
    plotlink,
    features = []
  } = property;

  const targetLink = plotlink || `/layout/${id}`;

  return (
    <motion.div
      className="property-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
    >
      <div className="property-image-container">
        <img src={image} alt={title} className="property-image" loading="lazy" />
        <span className="property-status-badge">{status}</span>
        {category && <span className="property-category-tag">{category}</span>}
      </div>

      <div className="property-content">
        <div className="property-location">
          <FaMapMarkerAlt />
          <span>{location}</span>
        </div>

        <h3 className="property-title">{title}</h3>

        <div className="property-specs-grid">
          <div className="spec-item">
            <span className="spec-label">PLOT AREA</span>
            <span className="spec-value">{area}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">ROAD WIDTH</span>
            <span className="spec-value">{roadWidth}</span>
          </div>
        </div>

        {features.length > 0 && (
          <div className="property-features-list">
            {features.map((feat, idx) => (
              <span key={idx} className="feature-pill">
                ✓ {feat}
              </span>
            ))}
          </div>
        )}

        <div className="property-footer">
          <div className="property-price-tag">
            <span className="price-main">{price}</span>
            <span className="price-sqft">{pricePerSqft}</span>
          </div>

          <Button href={targetLink} variant="outline" size="sm" icon={<FaArrowRight />}>
            View Layout
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
