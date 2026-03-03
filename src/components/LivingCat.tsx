/**
 * LivingCat - Visual manifestation of a CatAgent.
 */
'use client';

import { useRef, useEffect, useState, memo } from 'react';
import type { CatAgent } from '@/lib/cat-agent';
import { useAnimationClock } from '@/lib/use-animation-clock';
import { createTailStyle, getTailRig } from './cat-geometry';
import { getCatPalette, getEyeExpression } from './cat-visuals';

interface LivingCatProps {
  cat: CatAgent;
  onInteract?: (type: 'click' | 'hover') => void;
}

export const LivingCat = memo(function LivingCat({ cat, onInteract }: LivingCatProps) {
  const colors = getCatPalette(cat.variant);
  const animationMs = useAnimationClock(true);
  const tailRig = getTailRig('living');
  const [blinkState, setBlinkState] = useState(1);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleBlink = () => {
      const interval = 2000 + (1 - cat.posture.blinkRate) * 4000 + Math.random() * 2000;
      blinkTimerRef.current = setTimeout(() => {
        setBlinkState(0.12);
        setTimeout(() => setBlinkState(1), 150);
        scheduleBlink();
      }, interval);
    };

    scheduleBlink();
    return () => {
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current);
      }
    };
  }, [cat.posture.blinkRate]);

  const tailAngle = Math.sin(animationMs / (300 / (cat.posture.tailSpeed + 0.1))) * 20 * cat.posture.tailSpeed;
  const breatheScale = 1 + Math.sin(animationMs / 1000) * 0.02;
  const isAsleep = cat.currentBehavior === 'sleeping';
  const isGrooming = cat.currentBehavior === 'grooming';
  const isCrouching = cat.posture.bodyPosture === 'crouching';
  const isLoaf = cat.posture.bodyPosture === 'loaf';
  const walkBob =
    cat.currentBehavior === 'wandering' || cat.currentBehavior === 'fleeing'
      ? Math.sin(animationMs / 100) * 2
      : 0;

  const expression = getEyeExpression({
    mood: isAsleep ? 'sleepy' : 'curious',
    behavior: cat.currentBehavior,
    variant: cat.variant,
    isSleeping: isAsleep,
  });
  const eyeOpen = Math.max(0.1, blinkState * expression.blinkRatio);
  const pupilX = Math.max(-1.4, Math.min(1.4, cat.velocity.x * 0.6));
  const pupilY = Math.max(-0.8, Math.min(0.8, cat.velocity.y * 0.5));

  const catSize = 80;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${cat.position.x}%`,
        top: `${cat.position.y}%`,
        transform: `translate(-50%, -50%) scaleX(${cat.facing === 'left' ? -1 : 1})`,
        cursor: 'pointer',
        zIndex: 10,
      }}
      onClick={() => onInteract?.('click')}
      onMouseEnter={() => onInteract?.('hover')}
    >
      <svg width={catSize} height={catSize} viewBox="-40 -40 80 80" style={{ overflow: 'visible' }}>
        <ellipse cx="0" cy="12" rx={isLoaf ? 18 : 15} ry="4" fill="rgba(0,0,0,0.1)" />

        <g transform={`translate(0, ${walkBob}) scale(${breatheScale})`}>
          <g style={createTailStyle(tailAngle + cat.posture.earAngle * 0.3, tailRig.origin)}>
            <path d={tailRig.path} fill="none" stroke={colors.primary} strokeWidth={tailRig.strokeWidth} strokeLinecap="round" />
            <circle cx={tailRig.tipX} cy={tailRig.tipY} r="3.5" fill={colors.accent} />
          </g>

          {isLoaf ? (
            <ellipse cx="0" cy="3" rx="16" ry="10" fill={colors.primary} />
          ) : isCrouching ? (
            <ellipse cx="0" cy="6" rx="18" ry="7" fill={colors.primary} />
          ) : (
            <ellipse cx="0" cy="4" rx="14" ry="10" fill={colors.primary} />
          )}

          <ellipse
            data-testid="living-cat-tail-root"
            cx={tailRig.rootPatchCx}
            cy={tailRig.rootPatchCy}
            rx={tailRig.rootPatchRx}
            ry={tailRig.rootPatchRy}
            fill={colors.primary}
          />

          <ellipse
            cx="0"
            cy={isLoaf ? 5 : 6}
            rx={isLoaf ? 10 : 9}
            ry={isLoaf ? 6 : 5}
            fill={colors.secondary}
            opacity="0.5"
          />

          {!isLoaf && (
            <>
              <ellipse cx="-8" cy="10" rx="4" ry="3" fill={colors.primary} />
              <ellipse cx="8" cy="10" rx="4" ry="3" fill={colors.primary} />
            </>
          )}

          <g transform={`rotate(${cat.posture.headTilt})`}>
            <circle cx="0" cy="-8" r="12" fill={colors.primary} />
            {!isAsleep ? (
              <>
                <ellipse data-testid="living-cat-eye-left-sclera" cx="-5" cy="-9" rx="3.5" ry={4 * eyeOpen} fill={expression.eyeWhite} />
                <ellipse data-testid="living-cat-eye-right-sclera" cx="5" cy="-9" rx="3.5" ry={4 * eyeOpen} fill={expression.eyeWhite} />
                <ellipse cx={-5 + pupilX * 0.7} cy={-9 + pupilY * 0.7} rx="2.2" ry={2.8 * eyeOpen} fill={expression.iris} />
                <ellipse cx={5 + pupilX * 0.7} cy={-9 + pupilY * 0.7} rx="2.2" ry={2.8 * eyeOpen} fill={expression.iris} />
                <ellipse data-testid="living-cat-eye-left-pupil" cx={-5 + pupilX} cy={-9 + pupilY} rx="1.4" ry={2.1 * eyeOpen} fill={expression.pupil} />
                <ellipse data-testid="living-cat-eye-right-pupil" cx={5 + pupilX} cy={-9 + pupilY} rx="1.4" ry={2.1 * eyeOpen} fill={expression.pupil} />
                <circle data-testid="living-cat-eye-left-highlight" cx={-6.2 + pupilX * 0.35} cy={-10.1 + pupilY * 0.3} r="0.7" fill={expression.highlight} />
                <circle data-testid="living-cat-eye-right-highlight" cx={3.8 + pupilX * 0.35} cy={-10.1 + pupilY * 0.3} r="0.7" fill={expression.highlight} />
              </>
            ) : (
              <>
                <path d="M -8 -9 Q -5 -6 -2 -9" fill="none" stroke={colors.eye} strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 2 -9 Q 5 -6 8 -9" fill="none" stroke={colors.eye} strokeWidth="1.2" strokeLinecap="round" />
              </>
            )}
          </g>

          {isGrooming && (
            <ellipse
              cx="-2"
              cy="-5"
              rx="4"
              ry="3"
              fill={colors.primary}
              style={{
                transform: `translateY(${Math.sin(animationMs / 200) * 2}px)`,
              }}
            />
          )}

          {isAsleep && (
            <text x="12" y="-18" fontSize="8" fill={colors.accent} opacity={0.5 + Math.sin(animationMs / 500) * 0.3}>
              z
            </text>
          )}
        </g>
      </svg>
    </div>
  );
});
