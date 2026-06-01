import { useEffect, useRef, useState } from 'react';
import { useIntersection } from '../../hooks/useIntersection';

export default function AnimatedCounter({ value, duration = 2000, suffix = '', className = '' }) {
  const [display, setDisplay] = useState(0);
  const [ref, inView] = useIntersection({ threshold: 0.3, once: true });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let raf;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
