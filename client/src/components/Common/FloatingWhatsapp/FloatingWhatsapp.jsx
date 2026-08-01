import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './FloatingWhatsapp.css';

/**
 * Reusable Global Floating WhatsApp Button
 * Positioned fixed at bottom-left, responsive across mobile, tablet & desktop.
 */
const FloatingWhatsapp = ({
  phoneNumber = '919715334421',
  message = "Hi Anugraha Developers, I'm interested in learning more about your property layouts."
}) => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="global-floating-whatsapp"
      aria-label="Chat with Anugraha Developers on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <span className="whatsapp-pulse-ring" />
      <div className="whatsapp-icon-wrapper">
        <FaWhatsapp className="whatsapp-svg-icon" />
      </div>
      {/* <span className="whatsapp-hover-label">Chat with Us</span> */}
    </a>
  );
};

export default FloatingWhatsapp;
