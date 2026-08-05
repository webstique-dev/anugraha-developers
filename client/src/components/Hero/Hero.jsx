import React from 'react';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import { FaShieldAlt, FaCheckCircle, FaAward, FaArrowRight } from 'react-icons/fa';
import Button from '../Common/Button/Button';
import { SkeletonImage } from '../Common/Skeleton/Skeleton';
import { HERO_DATA } from '../../data/mockData';
import './Hero.css';

const Hero = () => {
  return (
    <section id="hero" className="hero-section">
      <div className="container hero-grid">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="hero-badge">
            <FaAward />
            <span>{HERO_DATA.badge}</span>
          </div>

          <h1 className="hero-heading">
            Build Your Dream Property with <span className="highlight">Anugraha Developers</span>
          </h1>

          <p className="hero-description">
            {HERO_DATA.description}
          </p>

          <div className="hero-buttons">
            <ScrollLink to="projects" smooth={true} offset={-80} duration={400}>
              <Button variant="primary" size="lg" icon={<FaArrowRight />}>
                Explore Projects
              </Button>
            </ScrollLink>

            <ScrollLink to="contact" smooth={true} offset={-80} duration={400}>
              <Button variant="outline-gold" size="lg">
                Book Visit
              </Button>
            </ScrollLink>
          </div>

          <div className="hero-features-strip">
            <div className="feature-strip-item">
              <FaShieldAlt className="feature-strip-icon" />
              <span>100% DTCP Approved</span>
            </div>
            <div className="feature-strip-item">
              <FaCheckCircle className="feature-strip-icon" />
              <span>Clear Legal Titles</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-media-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="hero-image-wrapper">
            <SkeletonImage
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop"
              alt="Anugraha Luxury Real Estate Property Layout"
              imageClassName="hero-main-img"
              aspectRatio="16 / 10"
            />
          </div>

          <motion.div
            className="hero-overlay-badge"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <span className="badge-number">{HERO_DATA.statsBadgeNumber}</span>
            <span className="badge-text">
              Projects<br />Completed
            </span>
          </motion.div>

          <motion.div
            className="hero-floating-indicator"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <div className="indicator-dot"></div>
            <div className="indicator-info">
              <span className="indicator-label">RERA & DTCP VERIFIED</span>
              <span className="indicator-val">Instant Registration</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
