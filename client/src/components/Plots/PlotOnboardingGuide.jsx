import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './PlotOnboardingGuide.css';

const LOCAL_STORAGE_KEY = 'layoutGuideSeen';

const PlotOnboardingGuide = ({
  isPreloaderFinished = false,
  isAuthenticated = false,
  selectedPlot = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const guideRef = useRef(null);

  // Dismiss Guide and save state in localStorage so it never appears again
  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    setIsVisible(false);
  }, []);

  // 1. Check for localStorage & admin authentication
  useEffect(() => {
    if (isAuthenticated) {
      setIsVisible(false);
      return;
    }

    try {
      const seen = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!seen && isPreloaderFinished) {
        setIsVisible(true);
      }
    } catch (err) {
      console.warn('LocalStorage access error:', err);
    }
  }, [isAuthenticated, isPreloaderFinished]);

  // 2. Automatically disappear after 5 seconds if user does not interact
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible, handleDismiss]);

  // 3. Automatically close immediately when user clicks/selects any plot
  useEffect(() => {
    if (isVisible && selectedPlot) {
      handleDismiss();
    }
  }, [isVisible, selectedPlot, handleDismiss]);

  if (isAuthenticated || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="plot-guide-center-wrapper">
          <motion.div
            ref={guideRef}
            className="plot-guide-card"
            initial={{ opacity: 0, scale: 0.88, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="plot-guide-close-btn"
              onClick={handleDismiss}
              aria-label="Close guide"
            >
              <X size={15} />
            </button>

            <div className="plot-guide-header">
              <div className="plot-guide-icon-badge">
                <span role="img" aria-label="lightbulb">💡</span>
              </div>
              <h4 className="plot-guide-title">Explore the Layout</h4>
            </div>

            <p className="plot-guide-description">
              Click on any plot to view its details, availability, dimensions, facing direction, pricing, and more.
            </p>

            <div className="plot-guide-footer">
              <button
                type="button"
                className="plot-guide-action-btn"
                onClick={handleDismiss}
              >
                <span>Got it</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PlotOnboardingGuide;
