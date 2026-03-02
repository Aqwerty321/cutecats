/**
 * Living Cat — Visual Manifestation of Cat Agent
 * 
 * Renders the cat based on internal state.
 * Expression through posture, not labels.
 */
'use client';

import { useRef, useEffect, useState, memo } from 'react';
import type { CatAgent } from '@/lib/cat-agent';

interface LivingCatProps {
  cat: CatAgent;
  onInteract?: (type: 'click' | 'hover') => void;
}

const COLOR_VARIANTS = {
  cream: {
    primary: '#FFD6C9',
    secondary: '#FFB8A3',
    accent: '#FF8C69',
  },
  peach: {
    primary: '#FFB5C5',
    secondary: '#FF8FAB',
    accent: '#FF6B8A',
  },
  lilac: {
    primary: '#D4A5FF',
    secondary: '#C77DFF',
    accent: '#A855F7',
  },
  mint: {
    primary: '#6EE7B7',
    secondary: '#34D399',
    accent: '#10B981',
  },
};

export const LivingCat = memo(function LivingCat({ cat, onInteract }: LivingCatProps) {
  const colors = COLOR_VARIANTS[cat.variant];
  const [blinkState, setBlinkState] = useState(1);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Organic blinking based on blink rate
  useEffect(() => {
    const scheduleBlink = () => {
      const interval = 2000 + (1 - cat.posture.blinkRate) * 4000 + Math.random() * 2000;
      blinkTimerRef.current = setTimeout(() => {
        setBlinkState(0);
        setTimeout(() => setBlinkState(1), 150);
        scheduleBlink();
      }, interval);
    };
    
    scheduleBlink();
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [cat.posture.blinkRate]);
  
  // Calculate visual properties from state
  const tailAngle = Math.sin(Date.now() / (300 / (cat.posture.tailSpeed + 0.1))) * 20 * cat.posture.tailSpeed;
  const breatheScale = 1 + Math.sin(Date.now() / 1000) * 0.02;
  const isAsleep = cat.currentBehavior === 'sleeping';
  const isGrooming = cat.currentBehavior === 'grooming';
  const isCrouching = cat.posture.bodyPosture === 'crouching';
  const isLoaf = cat.posture.bodyPosture === 'loaf';
  
  // Walking animation
  const walkBob = cat.currentBehavior === 'wandering' || cat.currentBehavior === 'fleeing'
    ? Math.sin(Date.now() / 100) * 2
    : 0;
  
  // Size of the cat in pixels
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
      <svg 
        width={catSize} 
        height={catSize} 
        viewBox="-40 -40 80 80"
        style={{ overflow: 'visible' }}
      >
        {/* Shadow */}
        <ellipse
          cx="0"
          cy="12"
          rx={isLoaf ? 18 : 15}
          ry="4"
          fill="rgba(0,0,0,0.1)"
        />
      
      <g transform={`translate(0, ${walkBob}) scale(${breatheScale})`}>
        {/* Tail */}
        <g 
          style={{ 
            transformOrigin: '-12px 5px',
            transform: `rotate(${tailAngle + cat.posture.earAngle * 0.3}deg)`,
          }}
        >
          <path
            d={isLoaf 
              ? "M -12 5 Q -25 0 -20 -8 Q -18 -12 -15 -10"
              : "M -12 5 Q -28 -5 -22 -18 Q -20 -22 -16 -20"
            }
            fill="none"
            stroke={colors.primary}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle
            cx={isLoaf ? -15 : -16}
            cy={isLoaf ? -10 : -20}
            r="3.5"
            fill={colors.accent}
          />
        </g>
        
        {/* Body */}
        {isLoaf ? (
          // Loaf position - compact blob
          <ellipse
            cx="0"
            cy="3"
            rx="16"
            ry="10"
            fill={colors.primary}
          />
        ) : isCrouching ? (
          // Crouching - low and long
          <ellipse
            cx="0"
            cy="6"
            rx="18"
            ry="7"
            fill={colors.primary}
          />
        ) : (
          // Standing/sitting
          <ellipse
            cx="0"
            cy="4"
            rx="14"
            ry="10"
            fill={colors.primary}
          />
        )}
        
        {/* Belly highlight */}
        <ellipse
          cx="0"
          cy={isLoaf ? 5 : 6}
          rx={isLoaf ? 10 : 9}
          ry={isLoaf ? 6 : 5}
          fill={colors.secondary}
          opacity="0.5"
        />
        
        {/* Legs (hidden in loaf) */}
        {!isLoaf && (
          <>
            <ellipse cx="-8" cy="10" rx="4" ry="3" fill={colors.primary} />
            <ellipse cx="8" cy="10" rx="4" ry="3" fill={colors.primary} />
          </>
        )}
        
        {/* Head */}
        <g transform={`rotate(${cat.posture.headTilt})`}>
          <circle
            cx="0"
            cy="-8"
            r="12"
            fill={colors.primary}
          />
          
          {/* Ears */}
          <g style={{ 
            transformOrigin: '0 -8px',
            transform: `rotate(${cat.posture.earAngle * 0.5}deg)`,
          }}>
            <path
              d="M -9 -16 L -12 -26 L -4 -18 Z"
              fill={colors.primary}
            />
            <path
              d="M -8 -17 L -10 -23 L -5 -18 Z"
              fill={colors.accent}
              opacity="0.5"
            />
            <path
              d="M 9 -16 L 12 -26 L 4 -18 Z"
              fill={colors.primary}
            />
            <path
              d="M 8 -17 L 10 -23 L 5 -18 Z"
              fill={colors.accent}
              opacity="0.5"
            />
          </g>
          
          {/* Cheeks */}
          <circle cx="-6" cy="-4" r="4" fill={colors.accent} opacity="0.35" />
          <circle cx="6" cy="-4" r="4" fill={colors.accent} opacity="0.35" />
          
          {/* Eyes */}
          {isAsleep ? (
            // Sleeping - curved lines
            <>
              <path
                d="M -7 -9 Q -5 -7 -3 -9"
                fill="none"
                stroke="#4A3F5C"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M 3 -9 Q 5 -7 7 -9"
                fill="none"
                stroke="#4A3F5C"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {/* Left eye */}
              <ellipse
                cx="-5"
                cy="-9"
                rx="3.5"
                ry={4 * blinkState}
                fill="#4A3F5C"
              />
              {blinkState > 0.5 && (
                <>
                  <ellipse
                    cx="-5"
                    cy="-9"
                    rx={2 * cat.posture.pupilSize}
                    ry={3 * cat.posture.pupilSize * blinkState}
                    fill="#1A1625"
                  />
                  <circle cx="-6" cy="-10" r="1.2" fill="white" />
                </>
              )}
              
              {/* Right eye */}
              <ellipse
                cx="5"
                cy="-9"
                rx="3.5"
                ry={4 * blinkState}
                fill="#4A3F5C"
              />
              {blinkState > 0.5 && (
                <>
                  <ellipse
                    cx="5"
                    cy="-9"
                    rx={2 * cat.posture.pupilSize}
                    ry={3 * cat.posture.pupilSize * blinkState}
                    fill="#1A1625"
                  />
                  <circle cx="4" cy="-10" r="1.2" fill="white" />
                </>
              )}
            </>
          )}
          
          {/* Nose */}
          <ellipse cx="0" cy="-4" rx="2.5" ry="2" fill={colors.accent} />
          
          {/* Mouth */}
          <path
            d="M -2 -2 Q 0 1 2 -2"
            fill="none"
            stroke={colors.accent}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          
          {/* Whiskers */}
          <g opacity="0.4" stroke={colors.accent} strokeWidth="1" strokeLinecap="round">
            <line x1="-8" y1="-6" x2="-16" y2="-8" />
            <line x1="-8" y1="-4" x2="-17" y2="-4" />
            <line x1="-8" y1="-2" x2="-16" y2="0" />
            <line x1="8" y1="-6" x2="16" y2="-8" />
            <line x1="8" y1="-4" x2="17" y2="-4" />
            <line x1="8" y1="-2" x2="16" y2="0" />
          </g>
        </g>
        
        {/* Grooming paw */}
        {isGrooming && (
          <ellipse
            cx="-2"
            cy="-5"
            rx="4"
            ry="3"
            fill={colors.primary}
            style={{
              transform: `translateY(${Math.sin(Date.now() / 200) * 2}px)`,
            }}
          />
        )}
        
        {/* Zzz when sleeping */}
        {isAsleep && (
          <text
            x="12"
            y="-18"
            fontSize="8"
            fill={colors.accent}
            opacity={0.5 + Math.sin(Date.now() / 500) * 0.3}
          >
            z
          </text>
        )}
      </g>
      </svg>
    </div>
  );
});
