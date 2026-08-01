import React from 'react';
import { FaStar, FaQuoteRight, FaCheckCircle } from 'react-icons/fa';
import { MapPin } from 'lucide-react';
import './TestimonialCard.css';

const TestimonialCard = ({ testimonial }) => {
  const { name, role, city, avatar, rating = 5, quote } = testimonial;

  return (
    <div className="testimonial-card">
      <FaQuoteRight className="testimonial-quote-watermark" />

      <div className="testimonial-card-header">
        <div className="stars-rating-group">
          {[...Array(rating)].map((_, i) => (
            <FaStar key={i} />
          ))}
          <span className="rating-score">{rating}.0</span>
        </div>

        <span className="verified-buyer-badge">
          <FaCheckCircle /> Verified Buyer
        </span>
      </div>

      <p className="testimonial-quote-text">"{quote}"</p>

      <div className="testimonial-author-row">
        <div className="author-avatar-container">
          <img src={avatar} alt={name} className="author-avatar-img" loading="lazy" />
        </div>
        <div className="author-details">
          <span className="author-name">{name}</span>
          <span className="author-meta">{role}</span>
          <span className="author-city-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> {city}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
