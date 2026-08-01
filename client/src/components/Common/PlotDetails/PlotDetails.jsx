import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import './PlotDetails.css';

/**
 * Reusable PlotDetails component for rendering plot specifications,
 * location, price tags, and highlighted features list.
 */
const PlotDetails = ({
  title,
  location,
  area,
  roadWidth,
  price,
  pricePerSqft,
  features = []
}) => {
  return (
    <div className="plot-details-wrapper">
      {location && (
        <div className="property-location">
          <FaMapMarkerAlt />
          <span>{location}</span>
        </div>
      )}

      {title && <h3 className="property-title">{title}</h3>}

      <div className="property-specs-grid">
        <div className="spec-item">
          <span className="spec-label">PLOT AREA</span>
          <span className="spec-value">{area || 'N/A'}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">ROAD WIDTH</span>
          <span className="spec-value">{roadWidth || 'N/A'}</span>
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

      {/* <div className="plot-details-price-row">
        <div className="property-price-tag">
          <span className="price-main">{price}</span>
          {pricePerSqft && <span className="price-sqft">{pricePerSqft}</span>}
        </div>
      </div> */}
    </div>
  );
};

export default PlotDetails;
