/**
 * SoftCursor — Underwater Physics Pointer
 * 
 * A soft glowing orb that follows the cursor with viscous inertia.
 * Creates the feeling of moving through warm water.
 * 
 * Client Component — Requires animation frame loop
 */
'use client';

import { useEffect, useRef, useState } from 'react';

interface SoftCursorProps {
  /** Glow color */
  color?: 'lilac' | 'peach' | 'mint';
  /** Size of the cursor orb in pixels */
  size?: number;
  /** Smoothing factor (0-1, lower = more lag) */
  smoothing?: number;
}

const COLOR_MAP = {
  lilac: {
    core: 'rgba(199, 125, 255, 1)',
    glow: 'rgba(199, 125, 255, 0.7)',
    ring: 'rgba(199, 125, 255, 0.4)',
  },
  peach: {
    core: 'rgba(255, 107, 157, 1)',
    glow: 'rgba(255, 107, 157, 0.7)',
    ring: 'rgba(255, 107, 157, 0.4)',
  },
  mint: {
    core: 'rgba(45, 212, 191, 1)',
    glow: 'rgba(45, 212, 191, 0.7)',
    ring: 'rgba(45, 212, 191, 0.4)',
  },
} as const;

export function SoftCursor({
  color = 'lilac',
  size = 32,
  smoothing = 0.15,
}: SoftCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const trailPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const colors = COLOR_MAP[color];

  useEffect(() => {
    // Track actual mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Smooth animation loop
    const animate = () => {
      // Lerp cursor position (faster)
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * smoothing * 2;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * smoothing * 2;

      // Lerp trail position (slower, more viscous)
      trailPos.current.x += (mousePos.current.x - trailPos.current.x) * smoothing;
      trailPos.current.y += (mousePos.current.y - trailPos.current.y) * smoothing;

      // Apply transforms
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorPos.current.x - size / 2}px, ${cursorPos.current.y - size / 2}px) scale(${isPressed ? 0.8 : 1})`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trailPos.current.x - size}px, ${trailPos.current.y - size}px)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    // Start animation
    rafId.current = requestAnimationFrame(animate);

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [smoothing, size, isVisible, isPressed]);

  // Don't render on touch devices or when reduced motion is preferred
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Outer glow trail (slower, larger) */}
      <div
        ref={trailRef}
        className="pointer-events-none fixed left-0 top-0 z-[10000] rounded-full"
        style={{
          width: size * 2.5,
          height: size * 2.5,
          background: `radial-gradient(circle, ${colors.ring} 0%, transparent 70%)`,
          opacity: isVisible ? 0.8 : 0,
          transition: 'opacity var(--duration-normal) var(--ease-viscous)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />

      {/* Core cursor (faster, smaller) */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[10001] rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, white 0%, ${colors.core} 40%, ${colors.glow} 70%, transparent 100%)`,
          boxShadow: `0 0 10px ${colors.core}, 0 0 25px ${colors.glow}, 0 0 50px ${colors.ring}`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity var(--duration-fast) var(--ease-viscous), transform var(--duration-fast) var(--ease-out-expo)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />
    </>
  );
}
