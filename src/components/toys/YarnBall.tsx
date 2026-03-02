/**
 * YarnBall — Tossable Tactile Toy
 * 
 * A soft, squishy yarn ball that can be dragged and tossed.
 * Cats in the room will chase it when it moves.
 */
'use client';

import { useState, useCallback } from 'react';

interface YarnBallProps {
  /** Color variant */
  color?: 'lilac' | 'peach' | 'mint' | 'cream';
  /** Size in pixels */
  size?: number;
  /** Called when yarn is tossed */
  onToss?: (velocity: { x: number; y: number }) => void;
}

const YARN_COLORS = {
  lilac: {
    primary: '#C77DFF',
    secondary: '#9D4EDD',
    tertiary: '#E0AAFF',
    shadow: 'rgba(199, 125, 255, 0.5)',
  },
  peach: {
    primary: '#FF6B9D',
    secondary: '#FF4777',
    tertiary: '#FFB3C6',
    shadow: 'rgba(255, 107, 157, 0.5)',
  },
  mint: {
    primary: '#2DD4BF',
    secondary: '#14B8A6',
    tertiary: '#5EEAD4',
    shadow: 'rgba(45, 212, 191, 0.5)',
  },
  cream: {
    primary: '#FFB8A3',
    secondary: '#FF8C69',
    tertiary: '#FFD6C9',
    shadow: 'rgba(255, 140, 105, 0.5)',
  },
} as const;

export function YarnBall({
  color = 'lilac',
  size = 60,
  onToss,
}: YarnBallProps) {
  const [isSquished, setIsSquished] = useState(false);
  const colors = YARN_COLORS[color];

  const handleMouseDown = useCallback(() => {
    setIsSquished(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsSquished(false);
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className="transition-transform duration-150 ease-out"
      style={{
        transform: isSquished ? 'scale(0.9)' : 'scale(1)',
        filter: `drop-shadow(0 6px 16px ${colors.shadow}) drop-shadow(0 2px 4px rgba(0,0,0,0.1))`,
        cursor: 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <defs>
        <radialGradient id={`yarn-grad-${color}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={colors.tertiary} />
          <stop offset="50%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </radialGradient>
      </defs>
      
      {/* Main ball */}
      <circle
        cx="30"
        cy="30"
        r="26"
        fill={`url(#yarn-grad-${color})`}
      />
      
      {/* Yarn texture - curved lines */}
      <g stroke={colors.secondary} strokeWidth="2.5" fill="none" opacity="0.7">
        <path d="M 15 20 Q 30 15 45 25" />
        <path d="M 12 35 Q 25 45 48 30" />
        <path d="M 20 45 Q 35 50 42 40" />
        <path d="M 25 12 Q 35 20 30 35" />
        <path d="M 40 15 Q 50 30 38 48" />
      </g>
      
      {/* Highlight */}
      <ellipse
        cx="20"
        cy="20"
        rx="10"
        ry="7"
        fill="white"
        opacity="0.5"
      />

      {/* Trailing strand */}
      <path
        d="M 50 45 Q 55 50 52 58 Q 48 65 55 68"
        stroke={colors.primary}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="animate-tail"
        style={{ transformOrigin: '50px 45px' }}
      />
    </svg>
  );
}
