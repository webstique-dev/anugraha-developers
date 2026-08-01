import React, { useState } from 'react';
import { FaWhatsapp, FaPhoneAlt, FaShareAlt, FaCheck } from 'react-icons/fa';
import './SocialActions.css';

/**
 * Reusable SocialActions component providing WhatsApp, Call, and Share buttons
 * Designed for plot cards and hover cards.
 */
const SocialActions = ({
  phone = '+919876543210',
  whatsapp = '919876543210',
  title = 'Plot Inquiry',
  size = 'md'
}) => {
  const [copied, setCopied] = useState(false);

  const cleanWhatsapp = whatsapp.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(
    `Hello Anugraha Developers, I am interested in inquiring about "${title}". Please provide more details.`
  );

  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodedMsg}`;
  const callUrl = `tel:${phone}`;

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Anugraha Developers - ${title}`,
          text: `Check out ${title} by Anugraha Developers`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard failed', err);
      }
    }
  };

  return (
    <div className={`social-actions-group size-${size}`}>
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon-btn whatsapp"
        title="Chat on WhatsApp"
        aria-label={`Chat on WhatsApp for ${title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <FaWhatsapp />
      </a>

      {/* Call Button */}
      <a
        href={callUrl}
        className="social-icon-btn call"
        title="Call Agent"
        aria-label={`Call Agent for ${title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <FaPhoneAlt />
      </a>

      {/* Share Button */}
      <button
        type="button"
        className="social-icon-btn share"
        title={copied ? 'Link Copied!' : 'Share Plot'}
        aria-label={`Share ${title}`}
        onClick={handleShare}
      >
        {copied ? <FaCheck className="copied-icon" /> : <FaShareAlt />}
      </button>
    </div>
  );
};

export default SocialActions;
