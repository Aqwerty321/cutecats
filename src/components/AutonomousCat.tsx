/**
 * Autonomous Cat — A Cat That Roams and Lives
 * 
 * Uses physics-based movement and internal state.
 * Wanders, investigates, naps, and reacts to cursor.
 */
'use client';

import { useRef, useEffect, useState, useCallback, memo } from 'react';
import type { CatState } from '@/lib/world-types';

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

const COLOR_VARIANTS = {
  cream: { primary: '#FFD6C9', secondary: '#FFB8A3', accent: '#FF8C69' },
  peach: { primary: '#FFB5C5', secondary: '#FF8FAB', accent: '#FF6B8A' },
  lilac: { primary: '#D4A5FF', secondary: '#C77DFF', accent: '#A855F7' },
  mint: { primary: '#6EE7B7', secondary: '#34D399', accent: '#10B981' },
};

// Physics constants
const FRICTION = 0.92;
const GRAVITY = 0.15;
const GROUND_Y = 75; // percentage from top
const MAX_SPEED = 2;

export const AutonomousCat = memo(function AutonomousCat({ 
  cat, 
  onPet,
  bounds = { minX: 10, maxX: 90, minY: 45, maxY: 80 }
}: AutonomousCatProps) {
  const colors = COLOR_VARIANTS[cat.variant];
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
  const [tailWag, setTailWag] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const animationRef = useRef<number>(0);
  const behaviorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Random behavior decision
  const decideBehavior = useCallback(() => {
    const rand = Math.random();
    const moodInfluence = cat.mood;
    
    if (moodInfluence === 'sleepy' && rand < 0.4) {
      setBehavior('sleeping');
      return 8000 + Math.random() * 12000; // Sleep for 8-20 seconds
    } else if (moodInfluence === 'playful' && rand < 0.5) {
      setBehavior('playing');
      // Pick a random target to run to
      setPhysics(p => ({
        ...p,
        targetX: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
        targetY: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
      }));
      return 2000 + Math.random() * 3000;
    } else if (rand < 0.3) {
      setBehavior('wandering');
      // Pick a nearby target
      setPhysics(p => ({
        ...p,
        targetX: Math.max(bounds.minX, Math.min(bounds.maxX, p.x + (Math.random() - 0.5) * 30)),
        targetY: Math.max(bounds.minY, Math.min(bounds.maxY, p.y + (Math.random() - 0.5) * 15)),
      }));
      return 3000 + Math.random() * 4000;
    } else if (rand < 0.5) {
      setBehavior('sitting');
      return 4000 + Math.random() * 6000;
    } else if (rand < 0.7) {
      setBehavior('curious');
      return 2000 + Math.random() * 3000;
    } else {
      setBehavior('idle');
      return 2000 + Math.random() * 4000;
    }
  }, [cat.mood, bounds]);

  // Behavior loop
  useEffect(() => {
    const scheduleBehavior = () => {
      const duration = decideBehavior();
      behaviorTimerRef.current = setTimeout(scheduleBehavior, duration);
    };
    
    scheduleBehavior();
    return () => {
      if (behaviorTimerRef.current) clearTimeout(behaviorTimerRef.current);
    };
  }, [decideBehavior]);

  // Physics update loop
  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const dt = Math.min((now - lastUpdateRef.current) / 16.67, 3);
      lastUpdateRef.current = now;

      setPhysics(p => {
        let { x, y, vx, vy, targetX, targetY } = p;

        // Move toward target if we have one
        if (targetX !== null && targetY !== null && (behavior === 'wandering' || behavior === 'playing')) {
          const dx = targetX - x;
          const dy = targetY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 2) {
            const speed = behavior === 'playing' ? 0.15 : 0.05;
            vx += (dx / dist) * speed * dt;
            vy += (dy / dist) * speed * dt;
            
            // Update facing direction
            if (Math.abs(dx) > 0.5) {
              setFacing(dx > 0 ? 'right' : 'left');
            }
          } else {
            // Reached target
            targetX = null;
            targetY = null;
          }
        }

        // Apply gravity (cats settle toward ground)
        if (y < GROUND_Y) {
          vy += GRAVITY * dt * 0.1;
        } else if (y > GROUND_Y) {
          vy -= (y - GROUND_Y) * 0.1;
        }

        // Apply friction
        vx *= FRICTION;
        vy *= FRICTION;

        // Clamp speed
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > MAX_SPEED) {
          vx = (vx / speed) * MAX_SPEED;
          vy = (vy / speed) * MAX_SPEED;
        }

        // Update position
        x += vx * dt;
        y += vy * dt;

        // Bounds
        x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
        y = Math.max(bounds.minY, Math.min(bounds.maxY, y));

        return { x, y, vx, vy, targetX, targetY };
      });

      // Tail animation
      setTailWag(Math.sin(now / 300) * (behavior === 'playing' ? 25 : 10));

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  }, [behavior, bounds]);

  // Blinking
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
    // React to being petted
    setBehavior('curious');
    setPhysics(p => ({ ...p, targetX: null, targetY: null }));
  };

  const isAsleep = behavior === 'sleeping';
  const isMoving = behavior === 'wandering' || behavior === 'playing';
  const walkBob = isMoving ? Math.sin(Date.now() / 100) * 2 : 0;

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
      <svg 
        width={70} 
        height={70} 
        viewBox="-35 -35 70 70"
        style={{ overflow: 'visible' }}
      >
        {/* Shadow */}
        <ellipse
          cx="0"
          cy="14"
          rx={isAsleep ? 20 : 16}
          ry="4"
          fill="rgba(0,0,0,0.1)"
        />
        
        <g transform={`translate(0, ${walkBob})`}>
          {/* Tail */}
          <g style={{ 
            transformOrigin: '-12px 5px',
            transform: `rotate(${tailWag}deg)`,
          }}>
            <path
              d={isAsleep 
                ? "M -10 5 Q -22 0 -18 -6"
                : "M -12 5 Q -26 -3 -20 -16"
              }
              fill="none"
              stroke={colors.primary}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle
              cx={isAsleep ? -18 : -20}
              cy={isAsleep ? -6 : -16}
              r="3"
              fill={colors.accent}
            />
          </g>
          
          {/* Body */}
          <ellipse
            cx="0"
            cy={isAsleep ? 5 : 3}
            rx={isAsleep ? 18 : 14}
            ry={isAsleep ? 8 : 10}
            fill={colors.primary}
          />
          
          {/* Belly highlight */}
          <ellipse
            cx="0"
            cy={isAsleep ? 6 : 5}
            rx={isAsleep ? 12 : 9}
            ry={isAsleep ? 5 : 6}
            fill={colors.secondary}
            opacity="0.5"
          />
          
          {/* Legs (hidden when sleeping) */}
          {!isAsleep && (
            <>
              <ellipse cx="-7" cy="10" rx="4" ry="3" fill={colors.primary} />
              <ellipse cx="7" cy="10" rx="4" ry="3" fill={colors.primary} />
            </>
          )}
          
          {/* Head */}
          <g>
            <circle
              cx="0"
              cy="-8"
              r="11"
              fill={colors.primary}
            />
            
            {/* Ears */}
            <path d="M -8 -15 L -11 -24 L -3 -17 Z" fill={colors.primary} />
            <path d="M -7 -16 L -9 -21 L -4 -17 Z" fill={colors.accent} opacity="0.5" />
            <path d="M 8 -15 L 11 -24 L 3 -17 Z" fill={colors.primary} />
            <path d="M 7 -16 L 9 -21 L 4 -17 Z" fill={colors.accent} opacity="0.5" />
            
            {/* Cheeks */}
            <circle cx="-5" cy="-4" r="3.5" fill={colors.accent} opacity="0.35" />
            <circle cx="5" cy="-4" r="3.5" fill={colors.accent} opacity="0.35" />
            
            {/* Eyes */}
            {isAsleep ? (
              <>
                <path d="M -6 -9 Q -4 -7 -2 -9" fill="none" stroke="#4A3F5C" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 2 -9 Q 4 -7 6 -9" fill="none" stroke="#4A3F5C" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="-4" cy="-9" rx="3" ry={3.5 * blinkState} fill="#4A3F5C" />
                {blinkState > 0.5 && (
                  <>
                    <ellipse cx="-4" cy="-9" rx="1.8" ry={2.5 * blinkState} fill="#1A1625" />
                    <circle cx="-5" cy="-10" r="1" fill="white" />
                  </>
                )}
                <ellipse cx="4" cy="-9" rx="3" ry={3.5 * blinkState} fill="#4A3F5C" />
                {blinkState > 0.5 && (
                  <>
                    <ellipse cx="4" cy="-9" rx="1.8" ry={2.5 * blinkState} fill="#1A1625" />
                    <circle cx="3" cy="-10" r="1" fill="white" />
                  </>
                )}
              </>
            )}
            
            {/* Nose */}
            <ellipse cx="0" cy="-4" rx="2" ry="1.5" fill={colors.accent} />
            
            {/* Mouth */}
            <path d="M -1.5 -2.5 Q 0 0 1.5 -2.5" fill="none" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
            
            {/* Whiskers */}
            <g opacity="0.4" stroke={colors.accent} strokeWidth="0.8" strokeLinecap="round">
              <line x1="-7" y1="-6" x2="-14" y2="-7" />
              <line x1="-7" y1="-4" x2="-15" y2="-4" />
              <line x1="-7" y1="-2" x2="-14" y2="-1" />
              <line x1="7" y1="-6" x2="14" y2="-7" />
              <line x1="7" y1="-4" x2="15" y2="-4" />
              <line x1="7" y1="-2" x2="14" y2="-1" />
            </g>
          </g>
          
          {/* Zzz when sleeping */}
          {isAsleep && (
            <text
              x="14"
              y="-16"
              fontSize="7"
              fill={colors.accent}
              opacity={0.5 + Math.sin(Date.now() / 500) * 0.3}
            >
              z
            </text>
          )}
          
          {/* Hover heart */}
          {isHovered && !isAsleep && (
            <text
              x="10"
              y="-20"
              fontSize="10"
              opacity="0.8"
            >
              💕
            </text>
          )}
        </g>
      </svg>
      
      {/* Cat name on hover */}
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
