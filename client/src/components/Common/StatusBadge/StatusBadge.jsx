import React from 'react';
import './StatusBadge.css';

/**
 * Reusable StatusBadge component for rendering status indicator badges
 * Supports availability statuses (Available, Booked, Sold, Reserved) 
 * as well as category/approval tags (DTCP Approved, RERA Registered, etc.)
 */
const StatusBadge = ({ status, variant = 'availability', className = '' }) => {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase();

  let statusClass = 'badge-default';
  
  if (normalizedStatus.includes('available')) {
    statusClass = 'badge-available';
  } else if (normalizedStatus.includes('booked')) {
    statusClass = 'badge-booked';
  } else if (normalizedStatus.includes('sold') || normalizedStatus.includes('registered')) {
    statusClass = 'badge-sold';
  } else if (normalizedStatus.includes('reserved') || normalizedStatus.includes('blocked')) {
    statusClass = 'badge-reserved';
  } else if (normalizedStatus.includes('dtcp') || normalizedStatus.includes('rera')) {
    statusClass = 'badge-approved';
  }

  return (
    <span className={`status-badge-component ${variant}-variant ${statusClass} ${className}`}>
      {variant === 'availability' && <span className="badge-dot" />}
      {status}
    </span>
  );
};

export default StatusBadge;
