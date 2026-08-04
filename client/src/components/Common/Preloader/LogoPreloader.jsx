import React, { useEffect, useState, useRef } from 'react';
import './LogoPreloader.css';

/**
 * LogoPreloader - Reusable React Component for Logo Preloader
 * Handles SVG assembly animation, breathing loop while waiting,
 * and flash exit pulse when loading completes.
 */
const LogoPreloader = ({ isLoading = true, onFinished }) => {
  const [stageClass, setStageClass] = useState('assembling'); // 'assembling' | 'idle' | 'flash' | 'hidden'
  const [isVisible, setIsVisible] = useState(true);
  
  const isFinishedRef = useRef(false);
  const assemblyDoneRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  const ASSEMBLY_TOTAL_MS = 1570; // 720ms delay + 850ms flySpike duration

  const triggerExitAnimation = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    setStageClass('flash');
    setTimeout(() => {
      setStageClass('hidden');
      setTimeout(() => {
        setIsVisible(false);
        if (onFinished) onFinished();
      }, 700); // 0.7s CSS fade out transition
    }, 350);
  };

  // Lock page scrolling & touch gestures while preloader is active & visible
  useEffect(() => {
    if (isVisible) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const preventTouchMove = (e) => {
        e.preventDefault();
      };

      document.addEventListener('touchmove', preventTouchMove, { passive: false });

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalTouchAction;
        document.removeEventListener('touchmove', preventTouchMove);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    if (isLoading) {
      isFinishedRef.current = false;
      assemblyDoneRef.current = false;
      startTimeRef.current = Date.now();
      setIsVisible(true);
      setStageClass('assembling');

      // Assembly timer
      const assemblyTimer = setTimeout(() => {
        assemblyDoneRef.current = true;
        if (!isFinishedRef.current) {
          setStageClass('idle');
        }
      }, ASSEMBLY_TOTAL_MS);

      // Max Safety Fallback Timer (4.5s max)
      const safetyTimer = setTimeout(() => {
        if (!isFinishedRef.current) {
          console.warn('[LogoPreloader] Maximum safety timeout reached. Resolving preloader.');
          triggerExitAnimation();
        }
      }, 4500);

      return () => {
        clearTimeout(assemblyTimer);
        clearTimeout(safetyTimer);
      };
    } else {
      // If isLoading becomes false:
      const elapsed = Date.now() - startTimeRef.current;
      const remainingAssembly = Math.max(0, ASSEMBLY_TOTAL_MS - elapsed);

      // Allow assembly choreography to finish smoothly before exit sequence
      const exitTimer = setTimeout(() => {
        triggerExitAnimation();
      }, remainingAssembly);

      return () => clearTimeout(exitTimer);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div
      id="preloader"
      className={`preloader-overlay ${stageClass === 'hidden' ? 'is-hidden' : ''}`}
      aria-busy={isLoading}
      aria-label="Loading page resources"
    >
      <div className="glow" />
      <div className="stage">
        <div className={`mark-wrap ${stageClass}`}>
          <svg viewBox="0 0 316 281" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polygon className="piece p-leftRoof" points="160,20 119,61 67,113 83,133 95,113 147,61" />
            <polygon className="piece p-rightRoof" points="160,20 201,61 253,113 237,133 225,113 173,61" />
            <polygon className="piece p-leftLeg" points="97,110 118,110 118,224 106,231" />
            <polygon className="piece p-rightLeg" points="223,110 202,110 202,224 214,231" />
            <polygon className="piece p-crossbar" points="95,134 221,134 221,168 95,168" />
            <polygon className="piece p-spike" points="150,58 170,58 170,254 160,273 150,254" />
          </svg>
        </div>
        <div className="eyebrow" id="eyebrow">
          ANUGRAHA DEVELOPERS
        </div>
      </div>
    </div>
  );
};

export default LogoPreloader;
