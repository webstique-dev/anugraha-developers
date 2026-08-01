import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import Button from '../Button/Button';
import StatusBadge from '../StatusBadge/StatusBadge';
import PlotDetails from '../PlotDetails/PlotDetails';
import SocialActions from '../SocialActions/SocialActions';
import './PropertyCard.css';

/**
 * Reusable PropertyCard / PlotCard Component
 * Displays plot image with an elegant hover overlay revealing status badges
 * and social action icons (WhatsApp, Call, Share).
 */
const PropertyCard = ({ property }) => {
  if (!property) return null;

  const {
    id,
    title,
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
  const phone = contact.phone || '+919876543210';
  const whatsapp = contact.whatsapp || '919876543210';

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

        {/* On-Hover Overlay with Status & Social Contact Action Icons */}
        <div className="property-hover-overlay">
          <div className="hover-status-header">
            <StatusBadge status={availability} variant="availability" />
            {category && <StatusBadge status={category} variant="category" />}
          </div>

          <div className="hover-social-actions">
            <span className="hover-actions-label">Quick Contact & Share</span>
            <SocialActions phone={phone} whatsapp={whatsapp} title={title} size="md" />
          </div>
        </div>
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
          {/* Social Contact Icons */}
          <SocialActions phone={phone} whatsapp={whatsapp} title={title} size="sm" />

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
