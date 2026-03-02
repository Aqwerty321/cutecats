/**
 * GlassPanel — The Prism Material
 * 
 * A frosted glass container that feels like a physical slab
 * floating in 3D space. Hover triggers lift and glow.
 * 
 * Client Component — Needed for hover tilt effect
 */
'use client';

import { useRef, useState, useCallback, type ReactNode, type CSSProperties } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  /** Glow color on hover: 'lilac' | 'peach' | 'mint' */
  glowColor?: 'lilac' | 'peach' | 'mint';
  /** Enable magnetic tilt toward cursor */
  enableTilt?: boolean;
  /** Enable floating animation */
  enableFloat?: boolean;
  /** Custom inline styles */
  style?: CSSProperties;
}

const GLOW_MAP = {
  lilac: 'rgba(199, 125, 255, 0.6)',
  peach: 'rgba(255, 107, 157, 0.6)',
  mint: 'rgba(45, 212, 191, 0.6)',
} as const;

export function GlassPanel({
  children,
  className = '',
  glowColor = 'lilac',
  enableTilt = true,
  enableFloat = false,
  style,
}: GlassPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate tilt based on cursor position relative to center
    // Max tilt of 4 degrees for subtle, premium feel
    const maxTilt = 4;
    const tiltX = ((e.clientY - centerY) / (rect.height / 2)) * maxTilt;
    const tiltY = ((e.clientX - centerX) / (rect.width / 2)) * -maxTilt;

    setTilt({ x: tiltX, y: tiltY });
  }, [enableTilt]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const transformStyle = isHovered && enableTilt
    ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px) translateZ(20px)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) translateZ(0)';

  const hoverShadow = isHovered
    ? `0 20px 48px var(--glass-shadow), 0 0 40px ${GLOW_MAP[glowColor]}, inset 0 1px 0 var(--glass-highlight), inset 0 -1px 0 rgba(45, 43, 56, 0.05)`
    : undefined;

  return (
    <div
      ref={panelRef}
      className={`glass ${enableFloat ? 'animate-float' : ''} ${className}`}
      style={{
        transform: transformStyle,
        boxShadow: hoverShadow,
        willChange: 'transform',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Inner content with parallax potential */}
      <div 
        className="relative z-10"
        style={{
          transform: isHovered && enableTilt
            ? `translateX(${tilt.y * 0.5}px) translateY(${tilt.x * 0.5}px)`
            : 'translateX(0) translateY(0)',
          transition: 'transform var(--duration-fast) var(--ease-out-quart)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
