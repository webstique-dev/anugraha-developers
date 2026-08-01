import React from 'react';
import SectionTitle from '../Common/SectionTitle/SectionTitle';
import DeveloperCard from '../Common/DeveloperCard/DeveloperCard';
import { DEVELOPERS_DATA } from '../../data/mockData';
import './Developers.css';

const Developers = () => {
  return (
    <section id="developers" className="section-padding developers-section">
      <div className="container">
        <SectionTitle
          badge="TRUSTED ALLIANCES"
          title="Developer Partners"
          subtitle="Collaborating with industry-leading civil engineering and master planning partners to deliver world-class gated layout developments."
        />

        <div className="developers-grid">
          {DEVELOPERS_DATA.map((developer) => (
            <DeveloperCard key={developer.id} developer={developer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Developers;
