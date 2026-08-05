import React, { useState } from 'react';
import './Skeleton.css';

/**
 * Primitive Skeleton Base Component
 */
export const SkeletonBase = ({
  width,
  height,
  circle = false,
  badge = false,
  radius,
  className = '',
  style = {}
}) => {
  const customStyle = {
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(radius !== undefined && { borderRadius: radius }),
    ...style
  };

  const classNames = [
    'skeleton-base',
    circle ? 'skeleton-circle' : '',
    badge ? 'skeleton-badge' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classNames} style={customStyle} aria-hidden="true" />;
};

/**
 * Text Line Skeleton
 */
export const SkeletonLine = ({ width = '100%', height = '14px', style = {}, className = '' }) => (
  <SkeletonBase width={width} height={height} className={`skeleton-line ${className}`} style={style} />
);

/**
 * Circle / Avatar Skeleton
 */
export const SkeletonCircle = ({ size = '40px', style = {}, className = '' }) => (
  <SkeletonBase width={size} height={size} circle className={className} style={style} />
);

/**
 * Pill Badge Skeleton
 */
export const SkeletonBadge = ({ width = '80px', height = '24px', style = {}, className = '' }) => (
  <SkeletonBase width={width} height={height} badge className={className} style={style} />
);

/**
 * Button Skeleton
 */
export const SkeletonButton = ({ width = '100%', height = '44px', style = {}, className = '' }) => (
  <SkeletonBase width={width} height={height} className={`skeleton-button ${className}`} style={style} />
);

/**
 * Form Input Skeleton
 */
export const SkeletonInput = ({ height = '44px', style = {}, className = '' }) => (
  <SkeletonBase width="100%" height={height} className={`skeleton-input ${className}`} style={style} />
);

/**
 * Image Placeholder Skeleton (Shows skeleton until img onLoad fires)
 */
export const SkeletonImage = ({
  src,
  alt = '',
  className = '',
  imageClassName = '',
  aspectRatio = '16 / 10',
  width = '100%',
  height,
  style = {}
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`skeleton-image-wrapper ${className}`} style={{ width, ...(height && { height }), ...style }}>
      {!isLoaded && (
        <SkeletonBase
          className="skeleton-image-placeholder"
          width="100%"
          height="100%"
          style={{ aspectRatio }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${imageClassName} ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{
          transition: 'opacity 0.3s ease-out',
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

/**
 * Property Card Skeleton (Exact layout match for PropertyCard)
 */
export const SkeletonPropertyCard = () => (
  <div className="skeleton-property-card">
    <div className="skeleton-property-image">
      <SkeletonBase width="100%" height="100%" />
    </div>
    <div className="skeleton-property-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBadge width="90px" height="22px" />
        <SkeletonBadge width="60px" height="20px" />
      </div>
      <SkeletonLine width="85%" height="20px" style={{ marginTop: '4px' }} />
      <SkeletonLine width="60%" height="14px" />
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <SkeletonLine width="30%" height="14px" />
        <SkeletonLine width="30%" height="14px" />
      </div>
      <div className="skeleton-property-footer">
        <div>
          <SkeletonLine width="80px" height="18px" />
          <SkeletonLine width="50px" height="12px" style={{ marginTop: '4px' }} />
        </div>
        <SkeletonButton width="100px" height="36px" />
      </div>
    </div>
  </div>
);

/**
 * Developer Card Skeleton (Exact layout match for DeveloperCard)
 */
export const SkeletonDeveloperCard = () => (
  <div className="skeleton-developer-card">
    <div className="skeleton-developer-banner">
      <SkeletonBase width="100%" height="100%" />
    </div>
    <div className="skeleton-developer-avatar">
      <SkeletonCircle size="100%" />
    </div>
    <div className="skeleton-developer-body">
      <SkeletonLine width="70%" height="22px" />
      <SkeletonLine width="45%" height="14px" />
      <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginTop: '8px' }}>
        <SkeletonLine width="100%" height="14px" />
      </div>
      <SkeletonButton width="100%" height="38px" style={{ marginTop: '8px' }} />
    </div>
  </div>
);

/**
 * Stats Card Skeleton
 */
export const SkeletonStatsCard = () => (
  <div className="skeleton-stats-item">
    <SkeletonBase width="90px" height="40px" radius="6px" />
    <SkeletonLine width="110px" height="16px" />
    <SkeletonLine width="130px" height="12px" />
  </div>
);

/**
 * Testimonial Card Skeleton
 */
export const SkeletonTestimonialCard = () => (
  <div className="skeleton-testimonial-card">
    <div className="skeleton-testimonial-header">
      <SkeletonCircle size="48px" />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="60%" height="16px" />
        <SkeletonLine width="40%" height="12px" style={{ marginTop: '4px' }} />
      </div>
    </div>
    <SkeletonLine width="100%" height="14px" />
    <SkeletonLine width="95%" height="14px" />
    <SkeletonLine width="75%" height="14px" />
  </div>
);

/**
 * Form Skeleton (For enquiry, login, register, admin modals)
 */
export const SkeletonForm = ({ fields = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SkeletonLine width="30%" height="12px" />
        <SkeletonInput height="44px" />
      </div>
    ))}
    <SkeletonButton width="100%" height="44px" style={{ marginTop: '8px' }} />
  </div>
);

/**
 * Exact Match Edit Plot Form Skeleton
 */
export const SkeletonEditPlotForm = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', padding: '4px 0' }}>
    {/* Field 1: Plot Number */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <SkeletonLine width="110px" height="12px" />
      <SkeletonInput height="44px" />
    </div>

    {/* Field 2: Status Dropdown */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <SkeletonLine width="140px" height="12px" />
      <SkeletonInput height="44px" />
    </div>

    {/* Field 3 & 4: Dimensions Side-by-side Row */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SkeletonLine width="90px" height="12px" />
        <SkeletonInput height="44px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SkeletonLine width="90px" height="12px" />
        <SkeletonInput height="44px" />
      </div>
    </div>

    {/* Field 5: Facing Direction */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <SkeletonLine width="130px" height="12px" />
      <SkeletonInput height="44px" />
    </div>

    {/* Field 6: Area Sq.Ft */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <SkeletonLine width="100px" height="12px" />
      <SkeletonInput height="44px" />
    </div>

    {/* Field 7: SVG Path Syntax */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <SkeletonLine width="120px" height="12px" />
      <SkeletonBase width="100%" height="80px" radius="8px" />
    </div>

    {/* Action Footer Buttons */}
    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
      <SkeletonButton width="70%" height="46px" />
      <SkeletonButton width="30%" height="46px" />
    </div>
  </div>
);

/**
 * Plot Details Panel Skeleton (For PlotInfoCard)
 */
export const SkeletonDetailsPanel = () => (
  <div className="skeleton-details-panel">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <SkeletonLine width="120px" height="20px" />
      <SkeletonBadge width="70px" height="24px" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonLine width="80px" height="14px" />
          <SkeletonLine width="100px" height="14px" />
        </div>
      ))}
    </div>
    <SkeletonButton width="100%" height="42px" style={{ marginTop: '12px' }} />
  </div>
);

/**
 * Table Skeleton (For admin plot / data tables)
 */
export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
    <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px' }}>
      {Array.from({ length: cols }).map((_, c) => (
        <SkeletonLine key={c} width={`${100 / cols}%`} height="16px" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} style={{ padding: '16px', borderBottom: r === rows - 1 ? 'none' : '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <SkeletonLine key={c} width={`${100 / cols}%`} height="14px" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Layout Map Vector Canvas Skeleton
 */
export const SkeletonMap = ({ width = '100%', height = '500px' }) => (
  <div style={{ width, height, position: 'relative', overflow: 'hidden', borderRadius: '16px', background: '#0F241A' }}>
    <SkeletonBase width="100%" height="100%" style={{ opacity: 0.3 }} />
  </div>
);

export default SkeletonBase;
