/**
 * InteractiveCat — A Living, Roaming Cat Companion
 * 
 * Cats that wander, play, react, and interact with objects.
 * They have personality and respond to the world.
 */
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { CatState } from '@/lib';

interface InteractiveCatProps {
  cat: CatState;
  containerBounds?: { width: number; height: number };
  onPet?: () => void;
  /** Nearby objects the cat might interact with */
  nearbyObjects?: Array<{ id: string; x: number; y: number; type: 'yarn' | 'bubble' | 'card' }>;
}

const COLOR_VARIANTS = {
  cream: {
    primary: '#FFD6C9',
    secondary: '#FFB8A3',
    accent: '#FF8C69',
    glow: 'rgba(255, 140, 105, 0.4)',
  },
  peach: {
    primary: '#FFB5C5',
    secondary: '#FF8FAB',
    accent: '#FF6B8A',
    glow: 'rgba(255, 107, 138, 0.4)',
  },
  lilac: {
    primary: '#D4A5FF',
    secondary: '#C77DFF',
    accent: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
  mint: {
    primary: '#6EE7B7',
    secondary: '#34D399',
    accent: '#10B981',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
} as const;

type CatAction = 'idle' | 'walking' | 'sitting' | 'playing' | 'sleeping' | 'grooming' | 'curious';

export function InteractiveCat({
  cat,
  containerBounds = { width: 800, height: 600 },
  onPet,
  nearbyObjects = [],
}: InteractiveCatProps) {
  const catRef = useRef<HTMLDivElement>(null);
  const colors = COLOR_VARIANTS[cat.variant] || COLOR_VARIANTS.cream;
  
  // Cat state
  const [position, setPosition] = useState({ x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 });
  const [action, setAction] = useState<CatAction>('idle');
  const [direction, setDirection] = useState<'left' | 'right'>(Math.random() > 0.5 ? 'left' : 'right');
  const [isHovered, setIsHovered] = useState(false);
  const [isPetted, setIsPetted] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [showHeart, setShowHeart] = useState(false);
  const [showZzz, setShowZzz] = useState(false);
  const [tailWag, setTailWag] = useState(0);
  
  // Action timers
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkTargetRef = useRef({ x: position.x, y: position.y });

  // Decide next action based on mood
  const decideNextAction = useCallback(() => {
    const moodActions: Record<string, CatAction[]> = {
      playful: ['walking', 'playing', 'curious', 'walking', 'playing'],
      sleepy: ['sleeping', 'sitting', 'grooming', 'sleeping', 'idle'],
      curious: ['walking', 'curious', 'sitting', 'walking', 'curious'],
      calm: ['sitting', 'idle', 'grooming', 'sitting', 'idle'],
      affectionate: ['walking', 'sitting', 'grooming', 'idle', 'sitting'],
    };
    
    const possibleActions = moodActions[cat.mood] || moodActions.calm;
    const nextAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
    
    setAction(nextAction);
    
    if (nextAction === 'walking') {
      // Pick a random destination
      walkTargetRef.current = {
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 60,
      };
      setDirection(walkTargetRef.current.x > position.x ? 'right' : 'left');
    }
    
    if (nextAction === 'sleeping') {
      setShowZzz(true);
    } else {
      setShowZzz(false);
    }
    
    // Schedule next action change
    const duration = nextAction === 'sleeping' ? 8000 + Math.random() * 5000 
                   : nextAction === 'walking' ? 3000 + Math.random() * 2000
                   : 2000 + Math.random() * 4000;
    
    actionTimerRef.current = setTimeout(decideNextAction, duration);
  }, [cat.mood, position.x]);

  // Initialize behavior
  useEffect(() => {
    decideNextAction();
    return () => {
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    };
  }, [decideNextAction]);

  // Walking animation
  useEffect(() => {
    if (action !== 'walking') return;
    
    const walkInterval = setInterval(() => {
      setPosition(prev => {
        const dx = walkTargetRef.current.x - prev.x;
        const dy = walkTargetRef.current.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) {
          setAction('idle');
          return prev;
        }
        
        const speed = 0.3;
        return {
          x: prev.x + (dx / distance) * speed,
          y: prev.y + (dy / distance) * speed,
        };
      });
    }, 50);
    
    return () => clearInterval(walkInterval);
  }, [action]);

  // Tail wagging
  useEffect(() => {
    const tailInterval = setInterval(() => {
      setTailWag(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(tailInterval);
  }, []);

  // Pupil tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!catRef.current) return;
      const rect = catRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 3;
      
      const dx = e.clientX - catCenterX;
      const dy = e.clientY - catCenterY;
      const maxOffset = 4;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      setPupilOffset({
        x: distance > 0 ? (dx / distance) * Math.min(distance / 80, 1) * maxOffset : 0,
        y: distance > 0 ? (dy / distance) * Math.min(distance / 80, 1) * maxOffset : 0,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Pet handler
  const handlePet = useCallback(() => {
    setIsPetted(true);
    setShowHeart(true);
    setAction('idle');
    onPet?.();
    
    setTimeout(() => setIsPetted(false), 600);
    setTimeout(() => setShowHeart(false), 1500);
  }, [onPet]);

  // Calculate visual states
  const isAsleep = action === 'sleeping';
  const eyeSquint = isPetted ? 0.2 : isAsleep ? 0 : isHovered ? 0.8 : 1;
  const tailAngle = Math.sin(tailWag * 0.1) * (action === 'playing' ? 25 : 12);

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
      {/* Floating heart on pet */}
      {showHeart && (
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl animate-bounce pointer-events-none"
          style={{ animation: 'floatUp 1.5s ease-out forwards' }}
        >
          💕
        </div>
      )}
      
      {/* Sleeping Zzz */}
      {showZzz && (
        <div className="absolute -top-4 -right-2 text-sm pointer-events-none animate-pulse">
          💤
        </div>
      )}

      {/* Cat SVG */}
      <svg
        width={140}
        height={140}
        viewBox="0 0 100 100"
        className={`transition-transform duration-300 ${action === 'walking' ? 'animate-walk' : ''} ${isPetted ? 'scale-110' : ''}`}
      >
        <defs>
          <filter id={`glow-${cat.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <radialGradient id={`bodyGrad-${cat.id}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.primary} />
          </radialGradient>
        </defs>

        {/* Tail */}
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

        {/* Body */}
        <ellipse
          cx="50"
          cy="65"
          rx="30"
          ry="24"
          fill={`url(#bodyGrad-${cat.id})`}
          filter={`url(#glow-${cat.id})`}
        />
        
        {/* Belly highlight */}
        <ellipse
          cx="50"
          cy="68"
          rx="20"
          ry="15"
          fill={colors.secondary}
          opacity="0.5"
        />

        {/* Head */}
        <circle
          cx="50"
          cy="35"
          r="24"
          fill={colors.primary}
        />
        
        {/* Cheek blush */}
        <circle cx="34" cy="42" r="7" fill={colors.accent} opacity="0.4" />
        <circle cx="66" cy="42" r="7" fill={colors.accent} opacity="0.4" />

        {/* Ears */}
        <path d="M 30 20 L 24 4 L 42 16 Z" fill={colors.primary} />
        <path d="M 32 18 L 28 8 L 40 16 Z" fill={colors.accent} opacity="0.5" />
        <path d="M 70 20 L 76 4 L 58 16 Z" fill={colors.primary} />
        <path d="M 68 18 L 72 8 L 60 16 Z" fill={colors.accent} opacity="0.5" />

        {/* Eyes */}
        <g>
          {/* Left eye */}
          <ellipse
            cx="40"
            cy="33"
            rx="6"
            ry={7 * eyeSquint}
            fill="#4A3F5C"
          />
          {eyeSquint > 0.3 && (
            <>
              <ellipse
                cx={40 + pupilOffset.x}
                cy={33 + pupilOffset.y * 0.5}
                rx="3"
                ry={4 * eyeSquint}
                fill="#1A1625"
              />
              <circle
                cx={38 + pupilOffset.x * 0.3}
                cy={31}
                r="2"
                fill="white"
              />
            </>
          )}
          
          {/* Right eye */}
          <ellipse
            cx="60"
            cy="33"
            rx="6"
            ry={7 * eyeSquint}
            fill="#4A3F5C"
          />
          {eyeSquint > 0.3 && (
            <>
              <ellipse
                cx={60 + pupilOffset.x}
                cy={33 + pupilOffset.y * 0.5}
                rx="3"
                ry={4 * eyeSquint}
                fill="#1A1625"
              />
              <circle
                cx={58 + pupilOffset.x * 0.3}
                cy={31}
                r="2"
                fill="white"
              />
            </>
          )}
        </g>

        {/* Nose */}
        <ellipse cx="50" cy="43" rx="4" ry="3" fill={colors.accent} />
        
        {/* Mouth - happy when petted */}
        <path
          d={isPetted || isHovered ? "M 44 47 Q 50 54 56 47" : "M 46 47 Q 50 51 54 47"}
          fill="none"
          stroke={colors.accent}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <g opacity="0.5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round">
          <line x1="30" y1="40" x2="14" y2="36" />
          <line x1="30" y1="44" x2="12" y2="44" />
          <line x1="30" y1="48" x2="14" y2="52" />
          <line x1="70" y1="40" x2="86" y2="36" />
          <line x1="70" y1="44" x2="88" y2="44" />
          <line x1="70" y1="48" x2="86" y2="52" />
        </g>

        {/* Paws */}
        <ellipse cx="36" cy="82" rx="10" ry="6" fill={colors.primary} />
        <ellipse cx="64" cy="82" rx="10" ry="6" fill={colors.primary} />
        
        {/* Paw pads */}
        <circle cx="33" cy="83" r="2" fill={colors.accent} opacity="0.6" />
        <circle cx="39" cy="83" r="2" fill={colors.accent} opacity="0.6" />
        <circle cx="61" cy="83" r="2" fill={colors.accent} opacity="0.6" />
        <circle cx="67" cy="83" r="2" fill={colors.accent} opacity="0.6" />
      </svg>

      {/* Cat name */}
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
      
      {/* Mood indicator */}
      {!isAsleep && (
        <p 
          className="text-center text-xs mt-0.5"
          style={{ 
            color: colors.secondary,
            transform: `scaleX(${direction === 'left' ? -1 : 1})`,
          }}
        >
          {cat.mood === 'playful' && '✧ playful'}
          {cat.mood === 'sleepy' && '~ drowsy'}
          {cat.mood === 'curious' && '◎ curious'}
          {cat.mood === 'calm' && '· relaxed'}
          {cat.mood === 'affectionate' && '♥ loving'}
        </p>
      )}
      
      <style jsx>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-40px); }
        }
        @keyframes walk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-walk {
          animation: walk 0.3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
