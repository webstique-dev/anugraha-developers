import React from 'react';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import './ContactActions.css';

/**
 * Reusable ContactActions component for rendering direct call & WhatsApp communication options
 * Pre-populates custom message with the plot title for seamless user inquiry.
 */
const ContactActions = ({ contact = {}, title = 'this plot' }) => {
  const phone = contact.phone || '+919876543210';
  const rawWhatsapp = contact.whatsapp || '919876543210';
  const cleanWhatsapp = rawWhatsapp.replace(/\D/g, '');

  const encodedMessage = encodeURIComponent(
    `Hello Anugraha Developers, I am interested in inquiring about "${title}". Could you please provide more details?`
  );

  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodedMessage}`;
  const phoneUrl = `tel:${phone}`;

  return (
    <div className="contact-actions-container">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-action-btn whatsapp-btn"
        title="Chat on WhatsApp"
        aria-label={`Chat on WhatsApp about ${title}`}
      >
        <FaWhatsapp className="contact-icon" />
        <span className="contact-btn-text">WhatsApp</span>
      </a>

      <a
        href={phoneUrl}
        className="contact-action-btn call-btn"
        title="Call Agent"
        aria-label={`Call Agent about ${title}`}
      >
        <FaPhoneAlt className="contact-icon" />
        <span className="contact-btn-text">Call</span>
      </a>
    </div>
  );
};

export default ContactActions;
