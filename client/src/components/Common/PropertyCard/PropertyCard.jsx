import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import Button from '../Button/Button';
import StatusBadge from '../StatusBadge/StatusBadge';
import ContactActions from '../ContactActions/ContactActions';
import PlotDetails from '../PlotDetails/PlotDetails';
import './PropertyCard.css';

/**
 * Reusable PropertyCard / PlotCard Component
 * Assembles image thumbnail, status badge, category tag, plot details,
 * contact actions (WhatsApp / Call), and layout action button.
 */
const PropertyCard = ({ property }) => {
  if (!property) return null;

  const {
    id,
    title,
    status,
    availability = 'Available',
    location,
    price,
    pricePerSqft,
    area,
    roadWidth,
    category,
    image,
    plotlink,
    contact = {},
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
        
        {/* Availability Badge */}
        <div className="property-badges-left">
          <StatusBadge status={availability} variant="availability" />
        </div>

        {/* Category Tag */}
        {category && (
          <div className="property-badges-right">
            <StatusBadge status={category} variant="category" />
          </div>
        )}
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
          {/* Contact Action Icons (WhatsApp & Call) */}
          <ContactActions contact={contact} title={title} />

          {/* View Layout Button */}
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
