/**
 * AutonomousCat - Physics-flavored roaming cat.
 */
'use client';

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import type { CatState } from '@/lib/world-types';
import { useAnimationClock } from '@/lib/use-animation-clock';
import { getCatPalette } from './cat-visuals';

interface AutonomousCatProps {
  cat: CatState;
  onPet?: () => void;
  bounds?: { minX: number; maxX: number; minY: number; maxY: number };
}

type CatBehavior = 'idle' | 'wandering' | 'sitting' | 'sleeping' | 'curious' | 'playing';

interface CatPhysics {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number | null;
  targetY: number | null;
}

const FRICTION = 0.92;
const GRAVITY = 0.15;
const GROUND_Y = 75;
const MAX_SPEED = 2;

export const AutonomousCat = memo(function AutonomousCat({
  cat,
  onPet,
  bounds = { minX: 10, maxX: 90, minY: 45, maxY: 80 },
}: AutonomousCatProps) {
  const colors = getCatPalette(cat.variant);
  const animationMs = useAnimationClock(true);
  const [physics, setPhysics] = useState<CatPhysics>({
    x: cat.position.x,
    y: cat.position.y,
    vx: 0,
    vy: 0,
    targetX: null,
    targetY: null,
  });
  const [behavior, setBehavior] = useState<CatBehavior>('idle');
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [blinkState, setBlinkState] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const animationRef = useRef<number>(0);
  const behaviorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const decideBehavior = useCallback(() => {
    const roll = Math.random();
    if (cat.mood === 'sleepy' && roll < 0.4) {
      setBehavior('sleeping');
      return 8000 + Math.random() * 12000;
    }
    if (cat.mood === 'playful' && roll < 0.6) {
      setBehavior('playing');
      setPhysics((prev) => ({
        ...prev,
        targetX: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
        targetY: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
      }));
      return 2000 + Math.random() * 3000;
    }
    if (roll < 0.5) {
      setBehavior('wandering');
      setPhysics((prev) => ({
        ...prev,
        targetX: Math.max(bounds.minX, Math.min(bounds.maxX, prev.x + (Math.random() - 0.5) * 30)),
        targetY: Math.max(bounds.minY, Math.min(bounds.maxY, prev.y + (Math.random() - 0.5) * 15)),
      }));
      return 3000 + Math.random() * 4000;
    }
    if (roll < 0.7) {
      setBehavior('sitting');
      return 3000 + Math.random() * 3000;
    }
    setBehavior('idle');
    return 2500 + Math.random() * 3500;
  }, [cat.mood, bounds]);

  useEffect(() => {
    const run = () => {
      const duration = decideBehavior();
      behaviorTimerRef.current = setTimeout(run, duration);
    };
    run();
    return () => {
      if (behaviorTimerRef.current) {
        clearTimeout(behaviorTimerRef.current);
      }
    };
  }, [decideBehavior]);

  useEffect(() => {
    const update = () => {
      const now = performance.now();
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = now;
      }
      const dt = Math.min((now - lastUpdateRef.current) / 16.67, 3);
      lastUpdateRef.current = now;

      setPhysics((prev) => {
        let { x, y, vx, vy, targetX, targetY } = prev;

        if (targetX !== null && targetY !== null && (behavior === 'wandering' || behavior === 'playing')) {
          const dx = targetX - x;
          const dy = targetY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 2) {
            const speed = behavior === 'playing' ? 0.15 : 0.05;
            vx += (dx / dist) * speed * dt;
            vy += (dy / dist) * speed * dt;
            if (Math.abs(dx) > 0.5) {
              setFacing(dx > 0 ? 'right' : 'left');
            }
          } else {
            targetX = null;
            targetY = null;
          }
        }

        if (y < GROUND_Y) {
          vy += GRAVITY * dt * 0.1;
        } else if (y > GROUND_Y) {
          vy -= (y - GROUND_Y) * 0.1;
        }

        vx *= FRICTION;
        vy *= FRICTION;

        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > MAX_SPEED) {
          vx = (vx / speed) * MAX_SPEED;
          vy = (vy / speed) * MAX_SPEED;
        }

        x += vx * dt;
        y += vy * dt;
        x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
        y = Math.max(bounds.minY, Math.min(bounds.maxY, y));

        return { x, y, vx, vy, targetX, targetY };
      });

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  }, [behavior, bounds]);

  useEffect(() => {
    const blink = () => {
      if (behavior !== 'sleeping') {
        setBlinkState(0);
        setTimeout(() => setBlinkState(1), 150);
      }
      setTimeout(blink, 2000 + Math.random() * 4000);
    };
    const timer = setTimeout(blink, Math.random() * 3000);
    return () => clearTimeout(timer);
  }, [behavior]);

  const handleClick = () => {
    onPet?.();
    setBehavior('curious');
    setPhysics((prev) => ({ ...prev, targetX: null, targetY: null }));
  };

  const isAsleep = behavior === 'sleeping';
  const isMoving = behavior === 'wandering' || behavior === 'playing';
  const walkBob = isMoving ? Math.sin(animationMs / 100) * 2 : 0;
  const tailWag = Math.sin(animationMs / 300) * (behavior === 'playing' ? 25 : 10);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${physics.x}%`,
        top: `${physics.y}%`,
        transform: `translate(-50%, -50%) scaleX(${facing === 'left' ? -1 : 1})`,
        cursor: 'pointer',
        zIndex: 10,
        transition: isMoving ? 'none' : 'left 0.3s ease, top 0.3s ease',
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width={70} height={70} viewBox="-35 -35 70 70" style={{ overflow: 'visible' }}>
        <ellipse cx="0" cy="14" rx={isAsleep ? 20 : 16} ry="4" fill="rgba(0,0,0,0.1)" />

        <g transform={`translate(0, ${walkBob})`}>
          <g
            style={{
              transformOrigin: '-12px 5px',
              transform: `rotate(${tailWag}deg)`,
            }}
          >
            <path
              d={isAsleep ? 'M -10 5 Q -22 0 -18 -6' : 'M -12 5 Q -26 -3 -20 -16'}
              fill="none"
              stroke={colors.primary}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx={isAsleep ? -18 : -20} cy={isAsleep ? -6 : -16} r="3" fill={colors.accent} />
          </g>

          <ellipse cx="0" cy={isAsleep ? 5 : 3} rx={isAsleep ? 18 : 14} ry={isAsleep ? 8 : 10} fill={colors.primary} />
          <circle cx="0" cy="-8" r="11" fill={colors.secondary} />

          <ellipse cx="-4" cy="-9" rx="3" ry={3.5 * blinkState} fill={colors.eye} />
          <ellipse cx="4" cy="-9" rx="3" ry={3.5 * blinkState} fill={colors.eye} />

          {isAsleep && (
            <text x="14" y="-16" fontSize="7" fill={colors.accent} opacity={0.5 + Math.sin(animationMs / 500) * 0.3}>
              z
            </text>
          )}

          {isHovered && !isAsleep && (
            <text x="10" y="-20" fontSize="10" opacity="0.8">
              pet
            </text>
          )}
        </g>
      </svg>

      {isHovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            color: colors.accent,
            whiteSpace: 'nowrap',
            textShadow: '0 1px 4px rgba(255,255,255,0.8)',
          }}
        >
          {cat.name}
        </div>
      )}
    </div>
  );
});
