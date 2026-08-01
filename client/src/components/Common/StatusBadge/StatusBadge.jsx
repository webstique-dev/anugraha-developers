import React from 'react';
import './StatusBadge.css';

/**
 * Reusable StatusBadge component for rendering standardized status badges.
 * Exclusively supports: Available, Booked, Registered, Blocked (and category approval tags).
 */
const StatusBadge = ({ status, variant = 'availability', className = '' }) => {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase();

  let statusClass = 'badge-default';
  
  if (normalizedStatus.includes('available')) {
    statusClass = 'badge-available';
  } else if (normalizedStatus.includes('booked')) {
    statusClass = 'badge-booked';
  } else if (normalizedStatus.includes('registered') || normalizedStatus.includes('sold')) {
    statusClass = 'badge-registered';
  } else if (normalizedStatus.includes('blocked') || normalizedStatus.includes('reserved')) {
    statusClass = 'badge-blocked';
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
