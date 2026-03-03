'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface SoftCursorProps {
  color?: 'lilac' | 'peach' | 'mint';
  size?: number;
  smoothing?: number;
}

const COLOR_MAP = {
  lilac: {
    core: 'rgba(143, 75, 255, 1)',
    glow: 'rgba(143, 75, 255, 0.7)',
    ring: 'rgba(143, 75, 255, 0.34)',
  },
  peach: {
    core: 'rgba(255, 78, 159, 1)',
    glow: 'rgba(255, 78, 159, 0.68)',
    ring: 'rgba(255, 78, 159, 0.32)',
  },
  mint: {
    core: 'rgba(15, 184, 218, 1)',
    glow: 'rgba(15, 184, 218, 0.68)',
    ring: 'rgba(15, 184, 218, 0.3)',
  },
} as const;

export function SoftCursor({ color = 'lilac', size = 28, smoothing = 0.14 }: SoftCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const core = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const pressedRef = useRef(false);
  const rafRef = useRef<number>(0);

  const [visible, setVisible] = useState(false);
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !coarse && !reduced;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleMove = (event: MouseEvent) => {
      mouse.current = { x: event.clientX, y: event.clientY };
      setVisible(true);
    };

    const handleDown = () => {
      pressedRef.current = true;
    };
    const handleUp = () => {
      pressedRef.current = false;
    };
    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    const animate = () => {
      core.current.x += (mouse.current.x - core.current.x) * smoothing * 2;
      core.current.y += (mouse.current.y - core.current.y) * smoothing * 2;
      ring.current.x += (mouse.current.x - ring.current.x) * smoothing;
      ring.current.y += (mouse.current.y - ring.current.y) * smoothing;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${core.current.x - size / 2}px, ${core.current.y - size / 2}px) scale(${pressedRef.current ? 0.84 : 1})`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - size}px, ${ring.current.y - size}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    document.documentElement.addEventListener('mouseleave', handleLeave);
    document.documentElement.addEventListener('mouseenter', handleEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
      document.documentElement.removeEventListener('mouseenter', handleEnter);
    };
  }, [enabled, size, smoothing]);

  const tones = useMemo(() => COLOR_MAP[color], [color]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[10000] rounded-full"
        style={{
          width: size * 2.4,
          height: size * 2.4,
          background: `radial-gradient(circle, ${tones.ring} 0%, transparent 72%)`,
          opacity: visible ? 0.86 : 0,
          transition: 'opacity var(--duration-fast) var(--ease-fluid)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />

      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[10001] rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, #ffffff 0%, ${tones.core} 45%, ${tones.glow} 75%, transparent 100%)`,
          boxShadow: `0 0 10px ${tones.core}, 0 0 24px ${tones.glow}`,
          opacity: visible ? 1 : 0,
          transition:
            'opacity var(--duration-fast) var(--ease-fluid), transform var(--duration-fast) var(--ease-out-expo)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />
    </>
  );
}
