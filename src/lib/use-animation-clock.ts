'use client';

import { useEffect, useState } from 'react';

/**
 * Render-safe animation clock.
 * Time is produced from requestAnimationFrame inside an effect, not during render.
 */
export function useAnimationClock(isActive = true): number {
  const [ms, setMs] = useState(0);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let frame = 0;
    const start = performance.now();

    const loop = (now: number) => {
      setMs(now - start);
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isActive]);

  return ms;
}

