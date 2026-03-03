'use client';

import { useCallback, useState } from 'react';

interface YarnBallProps {
  color?: 'lilac' | 'peach' | 'mint' | 'cream';
  size?: number;
  onToss?: (velocity: { x: number; y: number }) => void;
}

const YARN_COLORS = {
  lilac: {
    primary: 'var(--arcade-accent-violet-500)',
    secondary: 'var(--arcade-accent-violet-700)',
    tertiary: '#e6ccff',
    shadow: 'rgba(143,75,255,0.44)',
  },
  peach: {
    primary: 'var(--arcade-accent-pink-500)',
    secondary: 'var(--arcade-accent-pink-700)',
    tertiary: '#ffcce5',
    shadow: 'rgba(255,78,159,0.44)',
  },
  mint: {
    primary: 'var(--arcade-accent-cyan-500)',
    secondary: 'var(--arcade-accent-cyan-700)',
    tertiary: '#c7f7ff',
    shadow: 'rgba(15,184,218,0.42)',
  },
  cream: {
    primary: '#ffbf78',
    secondary: '#e99a3a',
    tertiary: '#ffe2bd',
    shadow: 'rgba(233,154,58,0.42)',
  },
} as const;

export function YarnBall({ color = 'lilac', size = 60, onToss }: YarnBallProps) {
  const [isSquished, setIsSquished] = useState(false);
  const colors = YARN_COLORS[color];

  const handlePress = useCallback(() => {
    setIsSquished(true);
  }, []);

  const handleRelease = useCallback(() => {
    setIsSquished(false);
    onToss?.({ x: 0, y: 0 });
  }, [onToss]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className="transition-transform duration-150 ease-out"
      style={{
        transform: isSquished ? 'scale(0.9)' : 'scale(1)',
        filter: `drop-shadow(0 6px 16px ${colors.shadow}) drop-shadow(0 2px 4px rgba(36,19,54,0.15))`,
        cursor: 'grab',
      }}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      data-testid={`yarn-ball-${color}`}
    >
      <defs>
        <radialGradient id={`yarn-grad-${color}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={colors.tertiary} />
          <stop offset="50%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </radialGradient>
      </defs>

      <circle cx="30" cy="30" r="26" fill={`url(#yarn-grad-${color})`} />

      <g stroke={colors.secondary} strokeWidth="2.5" fill="none" opacity="0.72">
        <path d="M 15 20 Q 30 15 45 25" />
        <path d="M 12 35 Q 25 45 48 30" />
        <path d="M 20 45 Q 35 50 42 40" />
        <path d="M 25 12 Q 35 20 30 35" />
        <path d="M 40 15 Q 50 30 38 48" />
      </g>

      <ellipse cx="20" cy="20" rx="10" ry="7" fill="white" opacity="0.56" />

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
