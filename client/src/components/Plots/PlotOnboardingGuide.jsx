import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import './PlotOnboardingGuide.css';

const LOCAL_STORAGE_KEY = 'layoutGuideSeen';

const PlotOnboardingGuide = ({
  plotsData = [],
  isPreloaderFinished = false,
  isAuthenticated = false,
  overlayRef,
  mapWrapperRef,
  selectedPlot = null,
  hoveredPlot = null,
  scale = 1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [targetPlot, setTargetPlot] = useState(null);
  const [plotPos, setPlotPos] = useState(null); // { x, y, width, height }
  const guideRef = useRef(null);

  // 1. Check for localStorage & admin authentication
  useEffect(() => {
    if (isAuthenticated) {
      setIsVisible(false);
      return;
    }

    try {
      const seen = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!seen && isPreloaderFinished && plotsData.length > 0) {
        setIsVisible(true);
      }
    } catch (err) {
      console.warn('LocalStorage access error:', err);
    }
  }, [isAuthenticated, isPreloaderFinished, plotsData]);

  // 2. Dynamically set target plot: hoveredPlot > selectedPlot > default center available plot
  useEffect(() => {
    if (!isVisible || !plotsData.length) return;

    if (hoveredPlot) {
      setTargetPlot(hoveredPlot);
      return;
    }

    if (selectedPlot) {
      setTargetPlot(selectedPlot);
      return;
    }

    const availablePlots = plotsData.filter((p) => {
      const st = (p.STATUS || p.status || 'Available').toString().toLowerCase();
      return st === 'available';
    });

    const pool = availablePlots.length > 0 ? availablePlots : plotsData;
    const midIndex = Math.floor(pool.length / 2);
    setTargetPlot(pool[midIndex]);
  }, [isVisible, plotsData, hoveredPlot, selectedPlot]);

  // 3. Anchor guide to target plot's exact bounding box relative to mapWrapper
  useEffect(() => {
    if (!isVisible || !targetPlot || !overlayRef?.current || !mapWrapperRef?.current) return;

    const overlay = overlayRef.current;
    const wrapper = mapWrapperRef.current;
    const plotId = (targetPlot.plotId || targetPlot.ID || targetPlot.id || '').toString();
    const plotNo = (targetPlot.plotNo || targetPlot.PLOTNO || targetPlot.plotno || '').toString();

    // Clear pulse highlight from all plots
    const allPaths = Array.from(overlay.querySelectorAll('path.plot-zone'));
    allPaths.forEach((p) => p.classList.remove('guide-pulse-highlight'));

    // Find active plot's path
    const targetPath = allPaths.find((p) => {
      const pId = (p.dataset.plotid || '').toString();
      const pNo = (p.dataset.plotno || '').toString();
      return (plotId && pId === plotId) || (plotNo && pNo === plotNo);
    });

    if (targetPath) {
      targetPath.classList.add('guide-pulse-highlight');

      const updatePosition = () => {
        if (!targetPath || !wrapper) return;
        try {
          const pathRect = targetPath.getBoundingClientRect();
          const wrapperRect = wrapper.getBoundingClientRect();
          const currentScale = scale > 0 ? scale : 1;

          // Position inside #mapWrapper unscaled local space
          const x = (pathRect.left - wrapperRect.left) / currentScale;
          const y = (pathRect.top - wrapperRect.top) / currentScale;
          const width = pathRect.width / currentScale;
          const height = pathRect.height / currentScale;

          setPlotPos({ x, y, width, height });
        } catch (e) {
          console.warn('Position calculation error:', e);
        }
      };

      updatePosition();
      const animId = requestAnimationFrame(updatePosition);

      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        if (targetPath) {
          targetPath.classList.remove('guide-pulse-highlight');
        }
      };
    }
  }, [isVisible, targetPlot, overlayRef, mapWrapperRef, scale, plotsData]);

  // Dismiss Guide
  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    setIsVisible(false);
  }, []);

  // 4. Event Listeners for Dismissal (Escape, Click outside)
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleDismiss();
    };

    const handleGlobalClick = (e) => {
      if (guideRef.current && !guideRef.current.contains(e.target)) {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick);
      window.addEventListener('touchend', handleGlobalClick);
    }, 250);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('touchend', handleGlobalClick);
    };
  }, [isVisible, handleDismiss]);

  if (isAuthenticated || !isVisible || !plotPos) return null;

  // Calculate top-center position of active plot inside #mapWrapper
  const plotCenterX = plotPos.x + plotPos.width / 2;
  const plotTopY = plotPos.y;

  return (
    <AnimatePresence>
      <div
        ref={guideRef}
        className="plot-guide-wrapper"
        style={{
          left: `${plotCenterX}px`,
          top: `${plotTopY}px`
        }}
      >
        <motion.div
          className="plot-guide-pill"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: [0, -5, 0],
            scale: 1
          }}
          exit={{ opacity: 0, scale: 0.9, y: 8 }}
          transition={{
            opacity: { duration: 0.2, ease: 'easeOut' },
            scale: { duration: 0.2, ease: 'easeOut' },
            y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Caret arrow pointing down toward active plot */}
          <div className="plot-guide-pill-arrow" />

          <Sparkles size={15} className="guide-pill-sparkle" />
          <span className="guide-pill-text">Click any plot to view details</span>

          <button
            type="button"
            className="guide-pill-btn"
            onClick={handleDismiss}
          >
            <span>Got it</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlotOnboardingGuide;
