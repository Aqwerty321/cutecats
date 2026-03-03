/**
 * InteractiveCat - Lightweight roaming companion.
 */
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { CatState } from '@/lib';
import { seededBool, seededNumber } from '@/lib/deterministic';
import { useAnimationClock } from '@/lib/use-animation-clock';
import { getCatPalette } from './cat-visuals';

interface InteractiveCatProps {
  cat: CatState;
  containerBounds?: { width: number; height: number };
  onPet?: () => void;
  nearbyObjects?: Array<{ id: string; x: number; y: number; type: 'yarn' | 'bubble' | 'card' }>;
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

  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkTargetRef = useRef({ x: position.x, y: position.y });

  useEffect(() => {
    const scheduleAction = () => {
      const moodActions = getMoodActions(cat.mood);
      const nextAction = moodActions[Math.floor(Math.random() * moodActions.length)];

      setAction(nextAction);
      setShowZzz(nextAction === 'sleeping');

      if (nextAction === 'walking') {
        const objectTarget =
          nearbyObjects.length > 0 && Math.random() > 0.5
            ? nearbyObjects[Math.floor(Math.random() * nearbyObjects.length)]
            : null;

        walkTargetRef.current = objectTarget
          ? { x: objectTarget.x, y: objectTarget.y }
          : {
              x: 10 + Math.random() * 80,
              y: 20 + Math.random() * 60,
            };
      }

      const duration =
        nextAction === 'sleeping'
          ? 8000 + Math.random() * 5000
          : nextAction === 'walking'
            ? 3000 + Math.random() * 2000
            : 2000 + Math.random() * 4000;

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
    if (action !== 'walking') {
      return;
    }

    const walkInterval = setInterval(() => {
      setPosition((prev) => {
        const dx = walkTargetRef.current.x - prev.x;
        const dy = walkTargetRef.current.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
          setAction('idle');
          return prev;
        }

        const speedScale = Math.max(0.75, Math.min(1.5, containerBounds.width / 800));
        const speed = 0.3 * speedScale;
        const next = {
          x: prev.x + (dx / distance) * speed,
          y: prev.y + (dy / distance) * speed,
        };
        setDirection(next.x > prev.x ? 'right' : 'left');
        return next;
      });
    }, 50);

    return () => clearInterval(walkInterval);
  }, [action, containerBounds.width]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!catRef.current) {
        return;
      }

      const rect = catRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 3;

      const dx = event.clientX - catCenterX;
      const dy = event.clientY - catCenterY;
      const maxOffset = 4;
      const distance = Math.sqrt(dx * dx + dy * dy);

      setPupilOffset({
        x: distance > 0 ? ((dx / distance) * Math.min(distance / 80, 1) * maxOffset) : 0,
        y: distance > 0 ? ((dy / distance) * Math.min(distance / 80, 1) * maxOffset) : 0,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handlePet = useCallback(() => {
    setIsPetted(true);
    setShowHeart(true);
    setAction('idle');
    onPet?.();

    setTimeout(() => setIsPetted(false), 600);
    setTimeout(() => setShowHeart(false), 1500);
  }, [onPet]);

  const isAsleep = action === 'sleeping';
  const eyeSquint = isPetted ? 0.2 : isAsleep ? 0 : isHovered ? 0.8 : 1;
  const tailAngle = Math.sin(clockMs / 250) * (action === 'playing' ? 25 : 12);

  return (
    <div
      ref={catRef}
      className="absolute transition-all duration-300 cursor-pointer select-none"
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
          style={{ animation: 'floatUp 1.5s ease-out forwards' }}
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
        className={`transition-transform duration-300 ${action === 'walking' ? 'animate-walk' : ''} ${
          isPetted ? 'scale-110' : ''
        }`}
      >
        <g
          style={{
            transformOrigin: '78px 62px',
            transform: `rotate(${tailAngle}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <path
            d="M 78 62 Q 95 50 90 35 Q 88 28 82 32"
            fill="none"
            stroke={colors.primary}
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="82" cy="32" r="5" fill={colors.accent} />
        </g>

        <ellipse cx="50" cy="65" rx="30" ry="24" fill={colors.primary} />
        <circle cx="50" cy="35" r="24" fill={colors.secondary} />

        <ellipse cx="40" cy="33" rx="6" ry={7 * eyeSquint} fill={colors.eye} />
        <ellipse cx="60" cy="33" rx="6" ry={7 * eyeSquint} fill={colors.eye} />
        {eyeSquint > 0.3 && (
          <>
            <circle cx={40 + pupilOffset.x} cy={33 + pupilOffset.y * 0.5} r="3" fill={colors.pupil} />
            <circle cx={60 + pupilOffset.x} cy={33 + pupilOffset.y * 0.5} r="3" fill={colors.pupil} />
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

      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-40px);
          }
        }
        @keyframes walk {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        .animate-walk {
          animation: walk 0.3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
