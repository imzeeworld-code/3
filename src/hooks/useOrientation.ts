import { useState, useEffect } from 'react';

export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > window.innerHeight;
  });
  
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 1024;
  });
  
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsLandscape(w > h);
      setIsMobile(Math.min(w, h) <= 768);
    }
    
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  
  return { isLandscape, isMobile };
}
