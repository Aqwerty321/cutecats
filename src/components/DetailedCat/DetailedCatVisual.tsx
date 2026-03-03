'use client';

import type { CatEyeExpression } from '../cat-visuals';
import { getCatPalette } from '../cat-visuals';
import { createTailStyle, getTailRig } from '../cat-geometry';
import type { DetailedCatBehavior } from './types';

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
  eyeExpression: CatEyeExpression;
  eyeOffset: { x: number; y: number };
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
  eyeExpression,
  eyeOffset,
  isHovered,
  isPetted,
  showHeart,
}: DetailedCatVisualProps) {
  const colors = getCatPalette(variant);
  const rig = getTailRig('detailed');
  const isAsleep = behavior === 'sleeping';
  const eyeOpen = isAsleep ? 0.08 : Math.max(0.22, blinkState * eyeExpression.blinkRatio);
  const pupilX = eyeOffset.x * 0.55;
  const pupilY = eyeOffset.y * 0.48;

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
        className={isPetted ? 'scale-105' : 'scale-100'}
        style={{
          transform: `translateY(${walkBob}px) scaleX(${facing === 'left' ? -1 : 1}) scale(${1 + breathe * 0.01})`,
          filter: `drop-shadow(0 8px 20px ${colors.shadow})`,
          transition: 'transform 0.16s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <g style={createTailStyle(tailWag, rig.origin)}>
          <path
            d={rig.path}
            fill="none"
            stroke={colors.primary}
            strokeWidth={rig.strokeWidth}
            strokeLinecap="round"
          />
          <circle cx={rig.tipX} cy={rig.tipY} r="4.5" fill={colors.accent} opacity={0.65} />
        </g>

        <ellipse cx="50" cy="66" rx={isAsleep ? 32 : 30} ry={isAsleep ? 20 : 23} fill={colors.primary} />
        <ellipse cx="50" cy="68" rx="20" ry="15" fill={colors.secondary} opacity="0.5" />

        <ellipse
          data-testid="detailed-cat-tail-root"
          cx={rig.rootPatchCx}
          cy={rig.rootPatchCy}
          rx={rig.rootPatchRx}
          ry={rig.rootPatchRy}
          fill={colors.primary}
        />

        <circle cx="50" cy="36" r="24" fill={colors.primary} />

        <path d="M 30 20 L 24 4 L 42 16 Z" fill={colors.primary} />
        <path d="M 70 20 L 76 4 L 58 16 Z" fill={colors.primary} />

        {!isAsleep ? (
          <>
            <ellipse
              data-testid="detailed-cat-eye-left-sclera"
              cx="40"
              cy="34"
              rx="6"
              ry={7 * eyeOpen}
              fill={eyeExpression.eyeWhite}
            />
            <ellipse
              data-testid="detailed-cat-eye-right-sclera"
              cx="60"
              cy="34"
              rx="6"
              ry={7 * eyeOpen}
              fill={eyeExpression.eyeWhite}
            />

            <ellipse cx={40 + pupilX * 0.7} cy={34 + pupilY * 0.7} rx="3.9" ry={4.5 * eyeOpen} fill={eyeExpression.iris} />
            <ellipse cx={60 + pupilX * 0.7} cy={34 + pupilY * 0.7} rx="3.9" ry={4.5 * eyeOpen} fill={eyeExpression.iris} />

            <ellipse data-testid="detailed-cat-eye-left-pupil" cx={40 + pupilX} cy={34 + pupilY} rx="2.2" ry={3.3 * eyeOpen} fill={eyeExpression.pupil} />
            <ellipse data-testid="detailed-cat-eye-right-pupil" cx={60 + pupilX} cy={34 + pupilY} rx="2.2" ry={3.3 * eyeOpen} fill={eyeExpression.pupil} />

            <circle data-testid="detailed-cat-eye-left-highlight" cx={38.4 + pupilX * 0.45} cy={32.1 + pupilY * 0.35} r="1.25" fill={eyeExpression.highlight} opacity="0.92" />
            <circle data-testid="detailed-cat-eye-right-highlight" cx={58.4 + pupilX * 0.45} cy={32.1 + pupilY * 0.35} r="1.25" fill={eyeExpression.highlight} opacity="0.92" />

            <ellipse cx="40" cy="31.6" rx="6.2" ry="2.1" fill={colors.primary} opacity={eyeExpression.eyelidOpacity} />
            <ellipse cx="60" cy="31.6" rx="6.2" ry="2.1" fill={colors.primary} opacity={eyeExpression.eyelidOpacity} />
          </>
        ) : (
          <>
            <path d="M 34 34 Q 40 38 46 34" fill="none" stroke={colors.eye} strokeWidth="2" strokeLinecap="round" />
            <path d="M 54 34 Q 60 38 66 34" fill="none" stroke={colors.eye} strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        <ellipse cx="50" cy="45.6" rx="7.8" ry="5.2" fill={colors.secondary} opacity="0.3" />
        <ellipse cx="50" cy="44.8" rx="3.7" ry="2.7" fill={colors.accent} />
        <path
          d="M 47.2 47.7 Q 50 49.8 52.8 47.7"
          fill="none"
          stroke={colors.accent}
          strokeWidth="1.35"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 50 45.8 L 50 47.8"
          fill="none"
          stroke={colors.accent}
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.82"
        />
        <ellipse cx="41.2" cy="45.7" rx="4.2" ry="2.9" fill={colors.accent} opacity="0.38" />
        <ellipse cx="58.8" cy="45.7" rx="4.2" ry="2.9" fill={colors.accent} opacity="0.38" />

        <g opacity="0.55">
          <line x1="44" y1="45.6" x2="31" y2="43.8" stroke={colors.accent} strokeWidth="1.05" strokeLinecap="round" />
          <line x1="44" y1="47.4" x2="30" y2="47.4" stroke={colors.accent} strokeWidth="1.05" strokeLinecap="round" />
          <line x1="44.4" y1="49.1" x2="31.4" y2="51.2" stroke={colors.accent} strokeWidth="1.05" strokeLinecap="round" />
          <line x1="56" y1="45.6" x2="69" y2="43.8" stroke={colors.accent} strokeWidth="1.05" strokeLinecap="round" />
          <line x1="56" y1="47.4" x2="70" y2="47.4" stroke={colors.accent} strokeWidth="1.05" strokeLinecap="round" />
          <line x1="55.6" y1="49.1" x2="68.6" y2="51.2" stroke={colors.accent} strokeWidth="1.05" strokeLinecap="round" />
        </g>
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
