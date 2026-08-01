import React from 'react';
import { motion } from 'framer-motion';
import { FaRoad, FaCertificate, FaFileContract, FaUserCheck } from 'react-icons/fa';
import SectionTitle from '../Common/SectionTitle/SectionTitle';
import { FEATURES_DATA } from '../../data/mockData';
import './Features.css';

const iconMap = {
  FaRoad: <FaRoad />,
  FaCertificate: <FaCertificate />,
  FaFileContract: <FaFileContract />,
  FaUserCheck: <FaUserCheck />
};

const spanClasses = ['span-7', 'span-5', 'span-6', 'span-6'];

const Features = () => {
  return (
    <section id="features" className="section-padding features-section">
      <div className="container">
        <SectionTitle
          badge="THE ANUGRAHA ADVANTAGE"
          title="Why Choose Us"
          subtitle="Engineered with technical perfection, legal precision, and unyielding commitment to long-term real estate value creation."
        />

        <div className="bento-grid">
          {FEATURES_DATA.map((item, idx) => (
            <motion.div
              key={item.id}
              className={`bento-card ${spanClasses[idx % spanClasses.length]}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <span className="bento-corner-tag">0{idx + 1}</span>

              <div>
                <div className="bento-icon-wrapper">
                  {iconMap[item.iconName]}
                </div>
                <h3 className="bento-title">{item.title}</h3>
                <p className="bento-desc">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
