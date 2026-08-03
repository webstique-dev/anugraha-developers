import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhoneAlt, FaBars, FaTimes, FaArrowRight, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import Button from '../Common/Button/Button';
import { useAuth } from '../../context/AuthContext';
import logoPng from '../../assets/logo/logo.png';
import './Navbar.css';

const navItems = [
  { name: 'Home', target: 'hero' },
  { name: 'Projects', target: 'projects' },
  { name: 'Developers', target: 'developers' },
  { name: 'Why Us', target: 'features' },
  { name: 'Testimonials', target: 'testimonials' },
  { name: 'Contact', target: 'contact' }
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, openAuthModal, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-container">
          <a href="#" className="navbar-brand">
            <img src={logoPng} alt="Anugraha Developers Logo Mark" className="navbar-logo-img" />
            <div className="brand-text-group">
              <span className="brand-title">ANUGRAHA</span>
              <span className="brand-subtitle">DEVELOPERS</span>
            </div>
          </a>

          <nav>
            <ul className="navbar-nav">
              {navItems.map((item, idx) => (
                <li key={idx}>
                  <ScrollLink
                    to={item.target}
                    spy={true}
                    smooth={true}
                    offset={-80}
                    duration={400}
                    className="nav-link"
                    activeClass="active"
                  >
                    {item.name}
                  </ScrollLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar-actions">
            <a href="tel:+919715334421" className="nav-phone-btn">
              <FaPhoneAlt />
              <span>+91 97153 34421</span>
            </a>

            <ScrollLink to="contact" smooth={true} offset={-80} duration={400}>
              <Button variant="primary" size="sm" icon={<FaArrowRight />}>
                Book Visit
              </Button>
            </ScrollLink>

            {/* Admin Authentication Action Button */}
            {isAuthenticated ? (
              <div className="admin-user-menu-wrapper">
                <button
                  className="admin-badge-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  title={`Logged in as ${user?.name || 'Admin'}`}
                >
                  <FaUserShield className="admin-icon" />
                  <span className="admin-name">{user?.name?.split(' ')[0] || 'Admin'}</span>
                </button>

                {userDropdownOpen && (
                  <div className="admin-dropdown-menu">
                    <div className="admin-dropdown-header">
                      <div className="dropdown-user-name">{user?.name}</div>
                      <div className="dropdown-user-email">{user?.email}</div>
                    </div>
                    <button
                      className="admin-logout-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                    >
                      <FaSignOutAlt />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="admin-icon-btn"
                onClick={() => openAuthModal('login')}
                aria-label="Admin Login Portal"
                title="Admin Login Portal"
              >
                <FaUserShield />
              </button>
            )}

            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="mobile-drawer-header">
                <a href="#" className="navbar-brand" onClick={() => setMobileOpen(false)}>
                  <img src={logoPng} alt="Anugraha Developers Logo Mark" className="navbar-logo-img" style={{ height: '2.2rem' }} />
                  <div className="brand-text-group">
                    <span className="brand-title">ANUGRAHA</span>
                    <span className="brand-subtitle">DEVELOPERS</span>
                  </div>
                </a>
                <button
                  className="mobile-toggle-btn"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close Menu"
                >
                  <FaTimes />
                </button>
              </div>

              <ul className="mobile-nav-list">
                {navItems.map((item, idx) => (
                  <li key={idx}>
                    <ScrollLink
                      to={item.target}
                      smooth={true}
                      offset={-80}
                      duration={400}
                      className="mobile-nav-link"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.name}
                    </ScrollLink>
                  </li>
                ))}
              </ul>

              <div className="mobile-drawer-actions">
                <a href="tel:+919715334421" className="nav-phone-btn" style={{ justifyContent: 'center' }}>
                  <FaPhoneAlt />
                  <span>+91 97153 34421</span>
                </a>
                <ScrollLink to="contact" smooth={true} offset={-80} duration={400} onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" style={{ width: '100%' }}>
                    Book Site Visit
                  </Button>
                </ScrollLink>
                {isAuthenticated ? (
                  <button
                    className="mobile-admin-btn"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                  >
                    <FaSignOutAlt />
                    <span>Log Out ({user?.name?.split(' ')[0]})</span>
                  </button>
                ) : (
                  <button
                    className="mobile-admin-btn"
                    onClick={() => {
                      setMobileOpen(false);
                      openAuthModal('login');
                    }}
                  >
                    <FaUserShield />
                    <span>Admin Portal</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
