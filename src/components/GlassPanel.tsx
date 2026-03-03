'use client';

import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'lilac' | 'peach' | 'mint';
  enableTilt?: boolean;
  enableFloat?: boolean;
  style?: CSSProperties;
  variant?: 'soft' | 'vivid' | 'dream';
  elevation?: 1 | 2 | 3;
}

const GLOW_MAP = {
  lilac: 'var(--arcade-glow-violet)',
  peach: 'var(--arcade-glow-pink)',
  mint: 'var(--arcade-glow-cyan)',
} as const;

const VARIANT_CLASS = {
  soft: 'arcade-panel-soft',
  vivid: 'arcade-panel-vivid',
  dream: 'arcade-panel-dream',
} as const;

const ELEV_CLASS = {
  1: 'arcade-elev-1',
  2: 'arcade-elev-2',
  3: 'arcade-elev-3',
} as const;

export function GlassPanel({
  children,
  className = '',
  glowColor = 'lilac',
  enableTilt = true,
  enableFloat = false,
  style,
  variant = 'soft',
  elevation = 2,
}: GlassPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!enableTilt || !panelRef.current) {
        return;
      }

      const rect = panelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxTilt = 4;

      const tiltX = ((event.clientY - centerY) / (rect.height / 2)) * maxTilt;
      const tiltY = ((event.clientX - centerX) / (rect.width / 2)) * -maxTilt;
      setTilt({ x: tiltX, y: tiltY });
    },
    [enableTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const hoverShadow = isHovered
    ? `${elevation === 3 ? 'var(--arcade-shadow-lg)' : 'var(--arcade-shadow-md)'}, 0 0 38px ${GLOW_MAP[glowColor]}`
    : undefined;

  return (
    <div
      ref={panelRef}
      className={`arcade-panel arcade-surface-hover ${VARIANT_CLASS[variant]} ${ELEV_CLASS[elevation]} ${
        enableFloat ? 'animate-float' : ''
      } ${className}`}
      style={{
        transform:
          isHovered && enableTilt
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        boxShadow: hoverShadow,
        willChange: 'transform',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative z-10"
        style={{
          transform:
            isHovered && enableTilt
              ? `translateX(${tilt.y * 0.45}px) translateY(${tilt.x * 0.45}px)`
              : 'translateX(0) translateY(0)',
          transition: 'transform var(--duration-fast) var(--ease-out-quart)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
