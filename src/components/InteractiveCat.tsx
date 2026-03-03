/**
 * InteractiveCat - Lightweight roaming companion.
 */
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { CatState } from '@/lib';
import { seededBool, seededNumber } from '@/lib/deterministic';
import {
  DEFAULT_MOTION_CONFIG,
  integrateMotion,
  resolveFacing,
  smoothValue,
  type MotionState,
} from '@/lib/motion';
import { useAnimationClock } from '@/lib/use-animation-clock';
import { createTailStyle, getTailRig } from './cat-geometry';
import { damp, getCatPalette, getEyeExpression, normalizeFocus } from './cat-visuals';

interface InteractiveCatProps {
  cat: CatState;
  containerBounds?: { width: number; height: number };
  onPet?: () => void;
  nearbyObjects?: Array<{ id: string; x: number; y: number; type: 'yarn' | 'bubble' | 'card' | 'ball' }>;
}

type CatAction = 'idle' | 'walking' | 'sitting' | 'playing' | 'sleeping' | 'grooming' | 'curious';

function getMoodActions(mood: CatState['mood']): CatAction[] {
  if (mood === 'playful') return ['walking', 'playing', 'curious', 'walking', 'playing'];
  if (mood === 'sleepy') return ['sleeping', 'sitting', 'grooming', 'sleeping', 'idle'];
  if (mood === 'curious') return ['walking', 'curious', 'sitting', 'walking', 'curious'];
  if (mood === 'affectionate') return ['walking', 'sitting', 'grooming', 'idle', 'sitting'];
  return ['sitting', 'idle', 'grooming', 'sitting', 'idle'];
}

export function InteractiveCat({
  cat,
  containerBounds = { width: 800, height: 600 },
  onPet,
  nearbyObjects = [],
}: InteractiveCatProps) {
  const catRef = useRef<HTMLDivElement>(null);
  const colors = getCatPalette(cat.variant);
  const clockMs = useAnimationClock(true);
  const tailRig = getTailRig('interactive');

  const [position, setPosition] = useState(() => ({
    x: seededNumber(`interactive-x-${cat.id}`, 30, 70),
    y: seededNumber(`interactive-y-${cat.id}`, 30, 70),
  }));
  const [action, setAction] = useState<CatAction>('idle');
  const [direction, setDirection] = useState<'left' | 'right'>(() =>
    seededBool(`interactive-facing-${cat.id}`) ? 'left' : 'right'
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isPetted, setIsPetted] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [showHeart, setShowHeart] = useState(false);
  const [showZzz, setShowZzz] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const petTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const frameTsRef = useRef<number>(0);
  const motionRef = useRef<MotionState>({ x: position.x, y: position.y, vx: 0, vy: 0 });
  const targetRef = useRef<{ x: number; y: number; type?: string } | null>(null);
  const actionRef = useRef<CatAction>('idle');
  const directionRef = useRef<'left' | 'right'>(direction);
  const desiredPupilRef = useRef({ x: 0, y: 0 });
  const currentPupilRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const scheduleAction = () => {
      const moodActions = getMoodActions(cat.mood);
      const nextAction = moodActions[Math.floor(Math.random() * moodActions.length)];

      setAction(nextAction);
      actionRef.current = nextAction;
      setShowZzz(nextAction === 'sleeping');

      if (nextAction === 'walking' || nextAction === 'playing' || nextAction === 'curious') {
        const objectTarget =
          nearbyObjects.length > 0 && Math.random() > 0.42
            ? nearbyObjects[Math.floor(Math.random() * nearbyObjects.length)]
            : null;

        targetRef.current = objectTarget
          ? { x: objectTarget.x, y: objectTarget.y, type: objectTarget.type }
          : {
              x: 10 + Math.random() * 80,
              y: 20 + Math.random() * 60,
            };
      } else {
        targetRef.current = null;
      }

      const duration =
        nextAction === 'sleeping'
          ? 7600 + Math.random() * 4600
          : nextAction === 'walking' || nextAction === 'playing'
            ? 2400 + Math.random() * 1800
            : 1800 + Math.random() * 3200;

      actionTimerRef.current = setTimeout(scheduleAction, duration);
    };

    scheduleAction();

    return () => {
      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
      }
    };
  }, [cat.mood, nearbyObjects]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!catRef.current) {
        return;
      }

      const rect = catRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 3;
      desiredPupilRef.current = normalizeFocus(event.clientX - catCenterX, event.clientY - catCenterY, 4);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const update = (timestamp: number) => {
      if (!frameTsRef.current) {
        frameTsRef.current = timestamp;
      }
      const dt = Math.max(0.001, Math.min(0.05, (timestamp - frameTsRef.current) / 1000));
      frameTsRef.current = timestamp;

      const liveAction = actionRef.current;
      const target = targetRef.current;
      const canMove = liveAction === 'walking' || liveAction === 'playing' || liveAction === 'curious';

      if (canMove && target) {
        const speedScale = Math.max(0.8, Math.min(1.4, containerBounds.width / 800));
        const motionConfig = {
          ...DEFAULT_MOTION_CONFIG,
          acceleration: liveAction === 'playing' ? 11 : 8,
          maxSpeed: (liveAction === 'playing' ? 22 : liveAction === 'curious' ? 17 : 14) * speedScale * (reducedMotion ? 0.72 : 1),
          arrivalRadius: liveAction === 'playing' ? 1.4 : 2,
          maxStep: reducedMotion ? 1.1 : 1.6,
        };

        const nextMotion = integrateMotion(motionRef.current, target, { minX: 5, maxX: 95, minY: 10, maxY: 90 }, dt, motionConfig);
        motionRef.current = nextMotion;
        setPosition({ x: nextMotion.x, y: nextMotion.y });

        const nextDirection = resolveFacing(directionRef.current, nextMotion.vx, motionConfig.facingHysteresis);
        if (nextDirection !== directionRef.current) {
          directionRef.current = nextDirection;
          setDirection(nextDirection);
        }

        const distance = Math.hypot(target.x - nextMotion.x, target.y - nextMotion.y);
        if (distance < motionConfig.arrivalRadius + 0.25) {
          if (liveAction === 'walking' || liveAction === 'curious') {
            setAction('idle');
            actionRef.current = 'idle';
          }
          targetRef.current = null;
        }
      } else {
        motionRef.current = {
          ...motionRef.current,
          vx: smoothValue(motionRef.current.vx, 0, 10, dt),
          vy: smoothValue(motionRef.current.vy, 0, 10, dt),
        };
      }

      const damping = reducedMotion ? 6 : 11;
      const factor = 1 - Math.exp(-damping * dt);
      currentPupilRef.current = {
        x: damp(currentPupilRef.current.x, desiredPupilRef.current.x, factor),
        y: damp(currentPupilRef.current.y, desiredPupilRef.current.y, factor),
      };
      setPupilOffset({ x: currentPupilRef.current.x, y: currentPupilRef.current.y });

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(rafRef.current);
      frameTsRef.current = 0;
    };
  }, [containerBounds.width, reducedMotion]);

  useEffect(() => {
    return () => {
      if (petTimerRef.current) {
        clearTimeout(petTimerRef.current);
      }
      if (heartTimerRef.current) {
        clearTimeout(heartTimerRef.current);
      }
    };
  }, []);

  const handlePet = useCallback(() => {
    setIsPetted(true);
    setShowHeart(true);
    setAction('idle');
    actionRef.current = 'idle';
    targetRef.current = null;
    onPet?.();

    if (petTimerRef.current) {
      clearTimeout(petTimerRef.current);
    }
    if (heartTimerRef.current) {
      clearTimeout(heartTimerRef.current);
    }

    petTimerRef.current = setTimeout(() => setIsPetted(false), 600);
    heartTimerRef.current = setTimeout(() => setShowHeart(false), 1500);
  }, [onPet]);

  const isAsleep = action === 'sleeping';
  const expression = getEyeExpression({
    mood: isAsleep ? 'sleepy' : cat.mood,
    behavior: action,
    variant: cat.variant,
    isHovered,
    isPetted,
    isSleeping: isAsleep,
  });

  const blinkWindow = (clockMs + cat.id.length * 320) % 4200;
  const blinkRatio = isAsleep ? 0.08 : blinkWindow > 3650 && blinkWindow < 3830 ? 0.14 : expression.blinkRatio;
  const eyeOpen = Math.max(0.08, blinkRatio);

  const tailAngle =
    Math.sin((clockMs / 250) * (reducedMotion ? 0.65 : 1)) *
    (action === 'playing' ? (reducedMotion ? 14 : 25) : reducedMotion ? 7 : 12);
  const walkBob = action === 'walking' || action === 'playing' ? Math.sin(clockMs / 120) * (reducedMotion ? 1 : 2.2) : 0;

  return (
    <div
      ref={catRef}
      className="absolute cursor-pointer select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) scaleX(${direction === 'left' ? -1 : 1})`,
        filter: `drop-shadow(0 8px 20px ${colors.glow})`,
        zIndex: 20,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePet}
    >
      {showHeart && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl animate-bounce pointer-events-none"
          style={{ animation: 'heart-rise 1.5s ease-out forwards' }}
        >
          heart
        </div>
      )}

      {showZzz && (
        <div className="absolute -top-4 -right-2 text-sm pointer-events-none animate-pulse">zzz</div>
      )}

      <svg
        width={140}
        height={140}
        viewBox="0 0 100 100"
        className={isPetted ? 'scale-110' : 'scale-100'}
        style={{
          transform: `translateY(${walkBob}px)`,
          transition: 'transform 0.14s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <g style={createTailStyle(tailAngle, tailRig.origin)}>
          <path
            d={tailRig.path}
            fill="none"
            stroke={colors.primary}
            strokeWidth={tailRig.strokeWidth}
            strokeLinecap="round"
          />
          <circle cx={tailRig.tipX} cy={tailRig.tipY} r="5" fill={colors.accent} />
        </g>

        <ellipse cx="50" cy="65" rx="30" ry="24" fill={colors.primary} />
        <ellipse
          data-testid="interactive-cat-tail-root"
          cx={tailRig.rootPatchCx}
          cy={tailRig.rootPatchCy}
          rx={tailRig.rootPatchRx}
          ry={tailRig.rootPatchRy}
          fill={colors.primary}
        />
        <circle cx="50" cy="35" r="24" fill={colors.secondary} />

        {!isAsleep ? (
          <>
            <ellipse data-testid="interactive-cat-eye-left-sclera" cx="40" cy="33" rx="6" ry={7 * eyeOpen} fill={expression.eyeWhite} />
            <ellipse data-testid="interactive-cat-eye-right-sclera" cx="60" cy="33" rx="6" ry={7 * eyeOpen} fill={expression.eyeWhite} />
            <ellipse cx={40 + pupilOffset.x * 0.7} cy={33 + pupilOffset.y * 0.55} rx="3.8" ry={4.6 * eyeOpen} fill={expression.iris} />
            <ellipse cx={60 + pupilOffset.x * 0.7} cy={33 + pupilOffset.y * 0.55} rx="3.8" ry={4.6 * eyeOpen} fill={expression.iris} />
            <ellipse data-testid="interactive-cat-eye-left-pupil" cx={40 + pupilOffset.x} cy={33 + pupilOffset.y * 0.65} rx="2.3" ry={3.3 * eyeOpen} fill={expression.pupil} />
            <ellipse data-testid="interactive-cat-eye-right-pupil" cx={60 + pupilOffset.x} cy={33 + pupilOffset.y * 0.65} rx="2.3" ry={3.3 * eyeOpen} fill={expression.pupil} />
            <circle data-testid="interactive-cat-eye-left-highlight" cx={38 + pupilOffset.x * 0.45} cy={31 + pupilOffset.y * 0.3} r="1.2" fill={expression.highlight} />
            <circle data-testid="interactive-cat-eye-right-highlight" cx={58 + pupilOffset.x * 0.45} cy={31 + pupilOffset.y * 0.3} r="1.2" fill={expression.highlight} />
            <ellipse cx="40" cy="31.8" rx="6.1" ry="2" fill={colors.secondary} opacity={expression.eyelidOpacity} />
            <ellipse cx="60" cy="31.8" rx="6.1" ry="2" fill={colors.secondary} opacity={expression.eyelidOpacity} />
          </>
        ) : (
          <>
            <path d="M 34 33 Q 40 37 46 33" fill="none" stroke={colors.eye} strokeWidth="2" strokeLinecap="round" />
            <path d="M 54 33 Q 60 37 66 33" fill="none" stroke={colors.eye} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>

      <p
        className="text-center text-sm font-medium mt-1"
        style={{
          color: colors.accent,
          transform: `scaleX(${direction === 'left' ? -1 : 1})`,
          textShadow: '0 1px 4px rgba(255,255,255,0.8)',
        }}
      >
        {cat.name}
      </p>

      {!isAsleep && (
        <p
          className="text-center text-xs mt-0.5"
          style={{
            color: colors.secondary,
            transform: `scaleX(${direction === 'left' ? -1 : 1})`,
          }}
        >
          {cat.mood}
        </p>
      )}

    </div>
  );
}
