import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import Button from '../Button/Button';
import PlotDetails from '../PlotDetails/PlotDetails';
import StatusBadge from '../StatusBadge/StatusBadge';
import './PropertyCard.css';

/**
 * Reusable PropertyCard / PlotCard Component for the Homepage
 * Displays plot image with status/category badges, specs grid, price, and View Layout button.
 */
const PropertyCard = ({ property }) => {
  if (!property) return null;

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
        
        {/* Standardized Status Badge */}
        {status && (
          <div className="property-status-badge-wrapper">
            <StatusBadge status={status} variant="availability" />
          </div>
        )}

        {/* Category Tag */}
        {category && <span className="property-category-tag">{category}</span>}
      </div>

      <div className="property-content">
        <PlotDetails
          title={title}
          location={location}
          area={area}
          roadWidth={roadWidth}
          price={price}
          pricePerSqft={pricePerSqft}
          features={features}
        />

        <div className="property-footer">
          <div className="property-price-tag">
            <span className="price-main">{price}</span>
            {pricePerSqft && <span className="price-sqft">{pricePerSqft}</span>}
          </div>

          <Button href={targetLink} variant="outline" size="sm" icon={<FaArrowRight />}>
            View Layout
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export { PropertyCard as PlotCard };
export default PropertyCard;
