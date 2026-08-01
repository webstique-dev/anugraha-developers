import React from 'react';
import { motion } from 'framer-motion';
import './SectionTitle.css';

const SectionTitle = ({
  badge,
  title,
  subtitle,
  align = 'center', // 'center' | 'left'
  className = ''
}) => {
  return (
    <motion.div
      className={`section-title-wrapper ${align} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      {badge && <span className="section-badge">{badge}</span>}
      {title && <h2 className="section-title">{title}</h2>}
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </motion.div>
  );
};

export default SectionTitle;
