import { useEffect, useRef, useState } from 'react';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [state, setState]     = useState<'idle' | 'pulling' | 'refreshing'>('idle');
  const [progress, setProgress] = useState(0);

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const startY    = useRef(0);
  const progressRef = useRef(0);
  const THRESHOLD = 72;

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0) startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!startY.current || window.scrollY > 0) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        const p = Math.min(delta / THRESHOLD, 1);
        progressRef.current = p;
        setProgress(p);
        setState('pulling');
        if (delta > 8) e.preventDefault();
      }
    };

    const onTouchEnd = async () => {
      if (!startY.current) return;
      startY.current = 0;
      const p = progressRef.current;
      progressRef.current = 0;
      setProgress(0);
      if (p >= 1) {
        setState('refreshing');
        await onRefreshRef.current();
        setState('idle');
      } else {
        setState('idle');
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove',  onTouchMove,  { passive: false });
    document.addEventListener('touchend',   onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove',  onTouchMove);
      document.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  return {
    isPulling:    state === 'pulling',
    isRefreshing: state === 'refreshing',
    progress,
  };
}
