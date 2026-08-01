import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import FloatingWhatsapp from '../Common/FloatingWhatsapp/FloatingWhatsapp';
import './Layout.css';

const Layout = ({ children, hideFooter = false }) => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="layout-main">{children}</main>
      {!hideFooter && <Footer />}
      <FloatingWhatsapp />
    </div>
  );
};

export default Layout;
