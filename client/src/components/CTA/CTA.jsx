import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../Common/Button/Button';
import './CTA.css';

const CTA = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in your Name and Phone Number.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Thank you! Your enquiry has been received. Our land investment expert will call you shortly.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        location: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <section id="contact" className="section-padding cta-section">
      <Toaster position="top-right" />
      <div className="container">
        <div className="cta-card">
          <div className="cta-grid">
            <motion.div
              className="cta-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="cta-badge">INTERACTIVE SITE ADVISORY</span>

              <h2 className="cta-heading">
                Transform Your Land Into <span className="gold">Smart Investments</span>
              </h2>

              <ul className="cta-bullets">
                <li className="cta-bullet-item">
                  <FaCheckCircle className="cta-bullet-icon" />
                  <span>Free 1-on-1 Land Valuation & Layout Feasibility Assessment</span>
                </li>
                <li className="cta-bullet-item">
                  <FaCheckCircle className="cta-bullet-icon" />
                  <span>DTCP & RERA Fast-Track Approval Guidance</span>
                </li>
                <li className="cta-bullet-item">
                  <FaCheckCircle className="cta-bullet-icon" />
                  <span>Guaranteed High ROI Capital Appreciation Strategy</span>
                </li>
                <li className="cta-bullet-item">
                  <FaCheckCircle className="cta-bullet-icon" />
                  <span>Complete Legal Title Verification & Bank Loan Support</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="enquiry-form-container"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="form-header">
                <h3 className="form-title">Schedule a Free Site Visit</h3>
                <p className="form-subtitle">Fill in your details below and get customized plot options.</p>
              </div>

              <form onSubmit={handleSubmit} className="enquiry-form">
                <div className="form-group">
                  <label className="form-label">FULL NAME *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Anand Kumar"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PHONE NUMBER *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. anand@example.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PREFERRED LOCATION</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Saravanampatti, Coimbatore"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MESSAGE / REQUIREMENTS</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us your budget or required plot dimensions..."
                    className="form-textarea"
                  ></textarea>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading}
                  icon={<FaPaperPlane />}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Submitting...' : 'Submit Enquiry & Book Visit'}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
