import React from 'react';
import { Compass, Ruler, X } from 'lucide-react';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import './PlotInfoCard.css';

/**
 * Enhanced PlotInfoCard component for rendering detailed info and quick actions
 * for a selected plot on interactive layout maps.
 */
const PlotInfoCard = ({
  plotData,
  onClose,
  phoneNumber = '+919715334421',
  whatsappNumber = '919715334421'
}) => {
  if (!plotData) return null;

  const { plotNo = '—', status = 'Available', facing = '—', area = '1500 Sq.ft' } = plotData;
  const normalizedStatus = status.toLowerCase();

  const cleanWhatsapp = whatsappNumber.replace(/\D/g, '');
  const inquiryMessage = encodeURIComponent(
    `Hello Anugraha Developers, I am interested in Plot No: ${plotNo} (Status: ${status}, Facing: ${facing}, Area: ${area}). Please share availability and pricing.`
  );

  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${inquiryMessage}`;
  const callUrl = `tel:${phoneNumber}`;

  return (
    <div id="info" className="plot-info-card-container">
      {/* Card Header */}
      <div className="info-header">
        <button id="infoClose" aria-label="Close" onClick={onClose}>
          <X size={14} />
        </button>
        <div className="info-header-label">Plot No.</div>
        <div className="info-plot-number">{plotNo}</div>
      </div>

      {/* Card Body */}
      <div className="info-body">
        {/* Status badge */}
        <div className="info-status-row">
          <span className={`info-status-badge status-${normalizedStatus}`}>
            <span className="status-dot" />
            <span>{status}</span>
          </span>
        </div>

        {/* Spec: Facing */}
        <div className="info-spec-row">
          <span className="info-spec-label">
            <span className="info-spec-icon">
              <Compass size={13} />
            </span>
            Facing
          </span>
          <span className="info-spec-value">{facing || '—'}</span>
        </div>

        {/* Spec: Plot Area */}
        <div className="info-spec-row">
          <span className="info-spec-label">
            <span className="info-spec-icon">
              <Ruler size={13} />
            </span>
            Plot Area
          </span>
          <span className="info-spec-value">{area}</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="info-actions-row">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="info-action-btn info-whatsapp-btn"
            title="Inquire via WhatsApp"
          >
            <FaWhatsapp />
            <span>WhatsApp</span>
          </a>
          <a href={callUrl} className="info-action-btn info-call-btn" title="Call Agent">
            <FaPhoneAlt />
            <span>Call</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlotInfoCard;
