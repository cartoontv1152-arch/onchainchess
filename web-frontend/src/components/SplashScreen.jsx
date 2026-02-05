import { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo">♟️</div>
        <div className="splash-title">OnChain Chess</div>
        <div className="splash-subtitle">Decentralized Chess on Linera</div>
        <div className="splash-loader">
          <div className="loader-spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
