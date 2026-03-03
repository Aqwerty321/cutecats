'use client';

import type { DetailedCatBehavior } from './types';
import { getCatPalette } from '../cat-visuals';

interface DetailedCatVisualProps {
  variant: 'cream' | 'peach' | 'lilac' | 'mint';
  name: string;
  moodLabel: string;
  behavior: DetailedCatBehavior;
  facing: 'left' | 'right';
  blinkState: number;
  walkBob: number;
  tailWag: number;
  breathe: number;
  isHovered: boolean;
  isPetted: boolean;
  showHeart: boolean;
}

export function DetailedCatVisual({
  variant,
  name,
  moodLabel,
  behavior,
  facing,
  blinkState,
  walkBob,
  tailWag,
  breathe,
  isHovered,
  isPetted,
  showHeart,
}: DetailedCatVisualProps) {
  const colors = getCatPalette(variant);
  const isAsleep = behavior === 'sleeping';

  return (
    <>
      {showHeart && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm pointer-events-none"
          style={{ animation: 'heart-rise 1.4s ease-out forwards' }}
        >
          heart
        </div>
      )}

      <svg
        width={140}
        height={140}
        viewBox="0 0 100 100"
        className={`transition-transform duration-150 ${isPetted ? 'scale-105' : 'scale-100'}`}
        style={{
          transform: `translateY(${walkBob}px) scaleX(${facing === 'left' ? -1 : 1}) scale(${1 + breathe * 0.01})`,
          filter: `drop-shadow(0 8px 20px ${colors.shadow})`,
        }}
      >
        <g
          style={{
            transformOrigin: '78px 62px',
            transform: `rotate(${tailWag}deg)`,
            transition: 'transform 0.12s ease-out',
          }}
        >
          <path
            d="M 78 62 Q 96 48 90 34 Q 87 27 82 31"
            fill="none"
            stroke={colors.primary}
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>

        <ellipse cx="50" cy="66" rx={isAsleep ? 32 : 30} ry={isAsleep ? 20 : 23} fill={colors.primary} />
        <ellipse cx="50" cy="68" rx="20" ry="15" fill={colors.secondary} opacity="0.5" />
        <circle cx="50" cy="36" r="24" fill={colors.primary} />

        <path d="M 30 20 L 24 4 L 42 16 Z" fill={colors.primary} />
        <path d="M 70 20 L 76 4 L 58 16 Z" fill={colors.primary} />

        {!isAsleep ? (
          <>
            <ellipse cx="40" cy="34" rx="6" ry={7 * blinkState} fill={colors.eye} />
            <ellipse cx="60" cy="34" rx="6" ry={7 * blinkState} fill={colors.eye} />
            {blinkState > 0.4 && (
              <>
                <ellipse cx="40" cy="34" rx="2.4" ry={4 * blinkState} fill={colors.pupil} />
                <ellipse cx="60" cy="34" rx="2.4" ry={4 * blinkState} fill={colors.pupil} />
              </>
            )}
          </>
        ) : (
          <>
            <path d="M 34 34 Q 40 38 46 34" fill="none" stroke={colors.eye} strokeWidth="2" strokeLinecap="round" />
            <path d="M 54 34 Q 60 38 66 34" fill="none" stroke={colors.eye} strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        <ellipse cx="50" cy="45" rx="4" ry="3" fill={colors.accent} />
      </svg>

      {isHovered && (
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-center"
          style={{ color: colors.accent, whiteSpace: 'nowrap' }}
        >
          <div>{name}</div>
          <div className="opacity-70">{moodLabel}</div>
        </div>
      )}
    </>
  );
}
