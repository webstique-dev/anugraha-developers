import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout/Layout';
import Hero from '../components/Hero/Hero';
import Stats from '../components/Common/Stats/Stats';
import Projects from '../components/Projects/Projects';
import Developers from '../components/Developers/Developers';
import Features from '../components/Features/Features';
import CTA from '../components/CTA/CTA';
import Testimonials from '../components/Testimonials/Testimonials';
import LogoPreloader from '../components/Common/Preloader/LogoPreloader';

const Home = () => {
  const [isHomeLoading, setIsHomeLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkHomeReady = async () => {
      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      } catch (err) {
        console.warn('Font load check error:', err);
      } finally {
        if (isMounted) {
          setIsHomeLoading(false);
        }
      }
    };

    checkHomeReady();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout>
      <LogoPreloader isLoading={isHomeLoading} />

      <Helmet>
        <title>Anugraha Developers | Premium Real Estate & DTCP Approved Plots</title>
        <meta
          name="description"
          content="Explore DTCP approved residential plots, luxury layouts, and smart land investment opportunities with Anugraha Developers."
        />
        <meta
          name="keywords"
          content="Anugraha Developers, DTCP approved plots, real estate coimbatore, gated community layouts, land investment"
        />
      </Helmet>

      <Hero />

      <section className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <Stats />
      </section>

      <Projects />
      <Developers />
      <Features />
      <CTA />
      <Testimonials />
    </Layout>
  );
};

export default Home;
