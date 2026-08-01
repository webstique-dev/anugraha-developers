import React from 'react';
import { Helmet } from 'react-helmet-async';
import PlotViewer from '../../components/Plots/PlotViewer';

/**
 * Production-ready React JSX page component for Plot 1 (Appanaikenpatty Phase 1)
 * Preserves pixel-perfect UI and behavior of plot-1.html while introducing
 * modular status filters, upgraded plot info card, and global floating WhatsApp.
 */
const Plot1 = () => {
  return (
    <>
      <Helmet>
        <title>Appanaikenpatty Phase 1 - Interactive Plot Map | Anugraha Developers</title>
        <meta
          name="description"
          content="Explore live plot availability, facing details, and plot specs for Appanaikenpatty Phase 1 layout by Anugraha Developers."
        />
      </Helmet>
      <PlotViewer
        layoutTitle="Appanaikenpatty Phase 1"
        bgSvgUrl="/layout-background.svg"
        sheetId="1n1puqY0m1MtqG8652yhWAChj6pYxP8b5ASDXQjpCp70"
        contentW={725}
        contentH={840}
        viewBox="82 193 725 840"
      />
    </>
  );
};

export default Plot1;
