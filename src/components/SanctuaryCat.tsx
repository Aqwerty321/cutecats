/**
 * SanctuaryCat - The Emotional Anchor
 */
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useAnimationClock } from '@/lib/use-animation-clock';
import { createTailStyle, getTailRig } from './cat-geometry';
import { damp, getCatPalette, getEyeExpression, normalizeFocus } from './cat-visuals';

interface SanctuaryCatProps {
  size?: number;
  variant?: 'cream' | 'peach' | 'lilac' | 'mint';
  enablePupilTracking?: boolean;
  className?: string;
}

export function SanctuaryCat({
  size = 200,
  variant = 'cream',
  enablePupilTracking = true,
  className = '',
}: SanctuaryCatProps) {
  const catRef = useRef<SVGSVGElement>(null);
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const happyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isHappy, setIsHappy] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const colors = getCatPalette(variant);
  const tailRig = getTailRig('sanctuary');
  const clockMs = useAnimationClock(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enablePupilTracking) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!catRef.current) {
        return;
      }

      const rect = catRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 2;

      const normalized = normalizeFocus(event.clientX - catCenterX, event.clientY - catCenterY, 3);
      targetOffsetRef.current = normalized;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enablePupilTracking]);

  useEffect(() => {
    if (!enablePupilTracking) {
      return;
    }

    let previous = performance.now();

    const animate = (now: number) => {
      const dt = Math.max(0.001, Math.min(0.05, (now - previous) / 1000));
      previous = now;

      const damping = reducedMotion ? 7 : 12;
      const factor = 1 - Math.exp(-damping * dt);

      currentOffsetRef.current = {
        x: damp(currentOffsetRef.current.x, targetOffsetRef.current.x, factor),
        y: damp(currentOffsetRef.current.y, targetOffsetRef.current.y, factor),
      };
      setPupilOffset({ x: currentOffsetRef.current.x, y: currentOffsetRef.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [enablePupilTracking, reducedMotion]);

  const handlePet = useCallback(() => {
    if (happyTimerRef.current) {
      clearTimeout(happyTimerRef.current);
    }
    setIsHappy(true);
    happyTimerRef.current = setTimeout(() => setIsHappy(false), 800);
  }, []);

  useEffect(() => {
    return () => {
      if (happyTimerRef.current) {
        clearTimeout(happyTimerRef.current);
      }
    };
  }, []);

  const expression = getEyeExpression({
    mood: isHappy ? 'affectionate' : 'calm',
    variant,
    isPetted: isHappy,
  });

  const blinkWindow = (clockMs + 600) % 4200;
  const blinkRatio = blinkWindow > 3660 && blinkWindow < 3830 ? 0.16 : expression.blinkRatio;
  const eyeOpen = Math.max(0.12, blinkRatio);
  const tailAngle = Math.sin((clockMs / 260) * (reducedMotion ? 0.6 : 1)) * (reducedMotion ? 9 : 16);

  return (
    <svg
      ref={catRef}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className} animate-breathe`}
      onClick={handlePet}
      style={{ cursor: 'pointer' }}
      role="img"
      aria-label="A cute cat companion"
    >
      <defs>
        <filter id={`cat-glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g id="tail" style={createTailStyle(tailAngle, tailRig.origin)}>
        <path
          d={tailRig.path}
          fill="none"
          stroke={colors.primary}
          strokeWidth={tailRig.strokeWidth}
          strokeLinecap="round"
        />
        <circle cx={tailRig.tipX} cy={tailRig.tipY} r="4" fill={colors.accent} />
      </g>

      <g id="body">
        <ellipse
          cx="50"
          cy="62"
          rx="28"
          ry="22"
          fill={colors.primary}
          style={{
            filter: `url(#cat-glow-${variant})`,
          }}
        />
        <ellipse cx="50" cy="65" rx="18" ry="14" fill={colors.secondary} opacity="0.6" />
        <ellipse
          data-testid="sanctuary-cat-tail-root"
          cx={tailRig.rootPatchCx}
          cy={tailRig.rootPatchCy}
          rx={tailRig.rootPatchRx}
          ry={tailRig.rootPatchRy}
          fill={colors.primary}
        />
      </g>

      <g id="head">
        <circle cx="50" cy="35" r="22" fill={colors.primary} />

        <circle cx="36" cy="40" r="6" fill={colors.secondary} opacity="0.5" />
        <circle cx="64" cy="40" r="6" fill={colors.secondary} opacity="0.5" />
      </g>

      <g id="ears">
        <path d="M 32 22 L 28 8 L 40 18 Z" fill={colors.primary} />
        <path d="M 33 20 L 30 12 L 38 18 Z" fill={colors.accent} opacity="0.6" />

        <path d="M 68 22 L 72 8 L 60 18 Z" fill={colors.primary} />
        <path d="M 67 20 L 70 12 L 62 18 Z" fill={colors.accent} opacity="0.6" />
      </g>

      <g id="eyes">
        <ellipse
          data-testid="sanctuary-cat-eye-left-sclera"
          cx="40"
          cy="33"
          rx="5"
          ry={6 * eyeOpen}
          fill={expression.eyeWhite}
        />
        <ellipse
          data-testid="sanctuary-cat-eye-right-sclera"
          cx="60"
          cy="33"
          rx="5"
          ry={6 * eyeOpen}
          fill={expression.eyeWhite}
        />

        <ellipse cx={40 + pupilOffset.x * 0.7} cy={33 + pupilOffset.y * 0.6} rx="3" ry={4.2 * eyeOpen} fill={expression.iris} />
        <ellipse cx={60 + pupilOffset.x * 0.7} cy={33 + pupilOffset.y * 0.6} rx="3" ry={4.2 * eyeOpen} fill={expression.iris} />

        <ellipse data-testid="sanctuary-cat-eye-left-pupil" cx={40 + pupilOffset.x} cy={33 + pupilOffset.y} rx="1.9" ry={3.2 * eyeOpen} fill={expression.pupil} />
        <ellipse data-testid="sanctuary-cat-eye-right-pupil" cx={60 + pupilOffset.x} cy={33 + pupilOffset.y} rx="1.9" ry={3.2 * eyeOpen} fill={expression.pupil} />

        <circle data-testid="sanctuary-cat-eye-left-highlight" cx={38 + pupilOffset.x * 0.5} cy={31 + pupilOffset.y * 0.35} r="1.2" fill={expression.highlight} opacity={isHappy ? 1 : 0.86} />
        <circle data-testid="sanctuary-cat-eye-right-highlight" cx={58 + pupilOffset.x * 0.5} cy={31 + pupilOffset.y * 0.35} r="1.2" fill={expression.highlight} opacity={isHappy ? 1 : 0.86} />

        <ellipse cx="40" cy="30.8" rx="5.2" ry="2" fill={colors.primary} opacity={expression.eyelidOpacity} />
        <ellipse cx="60" cy="30.8" rx="5.2" ry="2" fill={colors.primary} opacity={expression.eyelidOpacity} />
      </g>

      <g id="nose">
        <ellipse cx="50" cy="42" rx="3" ry="2" fill={colors.accent} />
      </g>

      <g id="mouth">
        <path
          d={isHappy ? 'M 45 44 Q 50 50 55 44' : 'M 47 45 Q 50 48 53 45'}
          fill="none"
          stroke={colors.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.72"
        />
      </g>

      <g id="whiskers" opacity="0.4">
        <line x1="32" y1="38" x2="18" y2="35" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
        <line x1="32" y1="42" x2="16" y2="42" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
        <line x1="32" y1="46" x2="18" y2="49" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />

        <line x1="68" y1="38" x2="82" y2="35" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
        <line x1="68" y1="42" x2="84" y2="42" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
        <line x1="68" y1="46" x2="82" y2="49" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
      </g>

      <g id="paws">
        <ellipse cx="38" cy="78" rx="8" ry="5" fill={colors.primary} />
        <ellipse cx="62" cy="78" rx="8" ry="5" fill={colors.primary} />

        <circle cx="36" cy="79" r="1.5" fill={colors.accent} opacity="0.5" />
        <circle cx="40" cy="79" r="1.5" fill={colors.accent} opacity="0.5" />
        <circle cx="60" cy="79" r="1.5" fill={colors.accent} opacity="0.5" />
        <circle cx="64" cy="79" r="1.5" fill={colors.accent} opacity="0.5" />
      </g>
    </svg>
  );
}



