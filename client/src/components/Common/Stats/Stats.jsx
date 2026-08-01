import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { STATS_DATA } from '../../../data/mockData';
import './Stats.css';

const CounterItem = ({ targetNumber, duration = 2000, inView }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    let animationFrameId;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutProgress * targetNumber));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCount);
      } else {
        setCount(targetNumber);
      }
    };

    animationFrameId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [inView, targetNumber, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const Stats = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <div className="stats-container" ref={ref}>
      <div className="stats-grid">
        {STATS_DATA.map((stat, idx) => (
          <motion.div
            key={idx}
            className="stat-card-item"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <div className="stat-number-wrapper">
              <CounterItem targetNumber={stat.count} duration={2000} inView={inView} />
              <span>{stat.suffix}</span>
            </div>
            <span className="stat-label">{stat.label}</span>
            <span className="stat-description">{stat.description}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
