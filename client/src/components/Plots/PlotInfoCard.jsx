import React from 'react';
import { Compass, Ruler, Maximize2, ArrowUpDown, X, Edit3 } from 'lucide-react';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { SkeletonDetailsPanel } from '../Common/Skeleton/Skeleton';
import './PlotInfoCard.css';

/**
 * Enhanced PlotInfoCard component for rendering detailed info and quick actions
 * for a selected plot on interactive layout maps.
 */
const PlotInfoCard = ({
  plotData,
  isLoading = false,
  onClose,
  onOpenEdit,
  phoneNumber = '+919715334421',
  whatsappNumber = '919715334421'
}) => {
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div id="info" className="plot-info-card-container">
        <SkeletonDetailsPanel />
      </div>
    );
  }

  if (!plotData) return null;

  const {
    plotNo = '—',
    status = 'Available',
    facing = '—',
    area = '—',
    width = '—',
    length = '—'
  } = plotData;

  const normalizedStatus = status.toLowerCase();

  const cleanWhatsapp = whatsappNumber.replace(/\D/g, '');
  const inquiryDetails = [
    `Status: ${status}`,
    `Facing: ${facing}`,
    width && width !== '—' ? `Width: ${width}` : null,
    length && length !== '—' ? `Length: ${length}` : null,
    area && area !== '—' ? `Area: ${area}` : null
  ]
    .filter(Boolean)
    .join(', ');

  const inquiryMessage = encodeURIComponent(
    `Hello Anugraha Developers, I am interested in Plot No: ${plotNo} (${inquiryDetails}). Please share availability and pricing.`
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
        <div className="info-plot-number">Plot No {plotNo}</div>
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

        {/* Spec: Width */}
        <div className="info-spec-row">
          <span className="info-spec-label">
            <span className="info-spec-icon">
              <Maximize2 size={13} />
            </span>
            Width
          </span>
          <span className="info-spec-value">{width || '—'}</span>
        </div>

        {/* Spec: Length */}
        <div className="info-spec-row">
          <span className="info-spec-label">
            <span className="info-spec-icon">
              <ArrowUpDown size={13} />
            </span>
            Length
          </span>
          <span className="info-spec-value">{length || '—'}</span>
        </div>

        {/* Spec: Plot Area */}
        <div className="info-spec-row">
          <span className="info-spec-label">
            <span className="info-spec-icon">
              <Ruler size={13} />
            </span>
            Area
          </span>
          <span className="info-spec-value">{area || '—'}</span>
        </div>

        {/* Admin Mode Edit Control */}
        {isAuthenticated && onOpenEdit && (
          <button
            className="info-admin-edit-btn"
            onClick={() => onOpenEdit(plotData)}
            title="Edit Plot Data"
          >
            <Edit3 size={14} />
            <span>Edit Plot Data</span>
          </button>
        )}

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
