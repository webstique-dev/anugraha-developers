import React, { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaCertificate, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaPaperPlane } from 'react-icons/fa';
import { toast } from '../Common/Notification/NotificationProvider';
import logoPng from '../../assets/logo/logo.png';
import Button from '../Common/Button/Button';
import './Footer.css';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    toast.success('Thank you! You are subscribed to Anugraha Developers layout updates.');
    setNewsletterEmail('');
  };

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-top-grid">
          {/* Column 1: Company Branding */}
          <div className="footer-brand-container">
            <a href="#" className="navbar-brand">
              <img src={logoPng} alt="Anugraha Developers Logo Mark" className="navbar-logo-img" />
              <div className="brand-text-group">
                <span className="brand-title white">ANUGRAHA</span>
                <span className="brand-subtitle">DEVELOPERS</span>
              </div>
            </a>
            <p className="footer-company-desc">
              Coimbatore's premier DTCP & RERA approved real estate developer. Delivering high-appreciation residential layouts, gated communities, and transparent land investments.
            </p>
            <div className="footer-cert-badge">
              <FaCertificate /> DTCP Approved • RERA Registered
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links-list">
              <li><ScrollLink to="hero" smooth={true} offset={-80} duration={400} className="footer-link-item">Home</ScrollLink></li>
              <li><ScrollLink to="projects" smooth={true} offset={-80} duration={400} className="footer-link-item">Featured Layouts</ScrollLink></li>
              <li><ScrollLink to="developers" smooth={true} offset={-80} duration={400} className="footer-link-item">Developer Partners</ScrollLink></li>
              <li><ScrollLink to="features" smooth={true} offset={-80} duration={400} className="footer-link-item">Why Choose Us</ScrollLink></li>
              <li><ScrollLink to="testimonials" smooth={true} offset={-80} duration={400} className="footer-link-item">Client Testimonials</ScrollLink></li>
              <li><ScrollLink to="contact" smooth={true} offset={-80} duration={400} className="footer-link-item">Contact & Enquiry</ScrollLink></li>
            </ul>
          </div>

          {/* Column 3: Featured Layouts */}
          <div>
            <h4 className="footer-col-title">Key Layouts</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">Appanaikenpatty Phase 1</li>
              <li className="footer-link-item">Anugraha Emerald Enclave</li>
              <li className="footer-link-item">Golden Palms Residency</li>
              <li className="footer-link-item">Pine Grove Eco Meadows</li>
              <li className="footer-link-item">Sunrise Boulevard Vadavalli</li>
              <li className="footer-link-item">Vanguard Business Bay</li>
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div>
            <h4 className="footer-col-title">Corporate Office</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>123,  Prime Layout Road, Sample Tech Park Zone, Coimbatore - 640000</span>
              </div>
              <div className="footer-contact-item">
                <FaPhoneAlt className="contact-icon" />
                <a href="tel:+919715334421" style={{ color: 'inherit', textDecoration: 'none' }}>+91 97153 34421</a>
              </div>
              <div className="footer-contact-item">
                <FaEnvelope className="contact-icon" />
                <span>contact@anugrahadevelopers.</span>
              </div>
              <div className="footer-contact-item">
                <FaClock className="contact-icon" />
                <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
              </div>
            </div>

            <div className="footer-newsletter-card">
              <h5 className="newsletter-title">Subscribe to Market Updates</h5>
              <p className="newsletter-subtext">Get new layout launches & price appreciation alerts.</p>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="newsletter-input"
                  required
                />
                <Button variant="secondary" size="sm" type="submit" icon={<FaPaperPlane />} />
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} Anugraha Developers. All rights reserved. DTCP & RERA Approved Layouts.</p>

          <div className="legal-links">
            <a href="#" className="legal-link">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="legal-link">Terms of Service</a>
            <span>•</span>
            <a href="#" className="legal-link">RERA Disclaimer</a>
          </div>

          <div className="social-icons-strip">
            <a href="#" className="social-icon-btn" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" className="social-icon-btn" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" className="social-icon-btn" aria-label="LinkedIn"><FaLinkedinIn /></a>
            <a href="#" className="social-icon-btn" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
