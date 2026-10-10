import React, { useEffect, useState } from 'react';
import './BreathIntro.css';

const BreathIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('initial');

  useEffect(() => {
    // Start breathe in
    const breatheInTimer = setTimeout(() => {
      setPhase('breathe-in');
    }, 100);

    // Then breathe out (shrink to zero)
    const breatheOutTimer = setTimeout(() => {
      setPhase('breathe-out');
    }, 2600);

    // Complete when shrunk to zero
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5100);

    return () => {
      clearTimeout(breatheInTimer);
      clearTimeout(breatheOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="breath-intro">
      <div className={`breath-orb ${phase}`}>
        <div className="orb-glow"></div>
      </div>
      <p className={`breath-text ${phase}`}>
        {phase === 'initial' || phase === 'breathe-in' ? 'breathe in...' : 'breathe out...'}
      </p>
    </div>
  );
};

export default BreathIntro;
