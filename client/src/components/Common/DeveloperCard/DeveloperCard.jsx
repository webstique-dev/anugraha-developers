import React from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaMapMarkerAlt, FaStar, FaArrowRight } from 'react-icons/fa';
import Button from '../Button/Button';
import logoPng from '../../../assets/logo/logo.png';
import './DeveloperCard.css';

const DeveloperCard = ({ developer }) => {
  const {
    name,
    tagline,
    city,
    projects,
    experience,
    rating,
    isPrimary,
    logoText,
    image
  } = developer;

  return (
    <motion.div
      className={`developer-card ${isPrimary ? 'primary' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
    >
      {isPrimary && (
        <span className="primary-partner-badge">FEATURED DEVELOPER</span>
      )}

      <div className="developer-banner">
        <img src={image} alt={name} className="developer-banner-img" loading="lazy" />
      </div>

      <div className="developer-avatar-wrapper">
        <div className={`developer-avatar ${isPrimary ? 'gold' : ''}`}>
          {isPrimary ? (
            <img src={logoPng} alt={name} style={{ height: '2.4rem', width: 'auto', objectFit: 'contain' }} />
          ) : (
            logoText
          )}
        </div>
      </div>

      <div className="developer-card-body">
        <h3 className="developer-name">{name}</h3>
        <p className="developer-tagline">{tagline}</p>

        <div className="developer-info-row">
          <div className="info-item">
            <span className="info-item-label">LOCATION</span>
            <span className="info-item-val">{city}</span>
          </div>
          <div className="info-item">
            <span className="info-item-label">PROJECTS</span>
            <span className="info-item-val">{projects}</span>
          </div>
        </div>

        <div className="developer-card-footer">
          <Button
            variant={isPrimary ? 'primary' : 'outline'}
            size="sm"
            icon={<FaArrowRight />}
            style={{ width: '100%' }}
          >
            View Developer Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DeveloperCard;
