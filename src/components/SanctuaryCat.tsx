/**
 * SanctuaryCat — The Emotional Anchor
 * 
 * A modular, animated SVG cat with premium-cute proportions.
 * All colors controlled via CSS variables.
 * Animations are CSS-only for performance.
 * 
 * Client Component — Needed for pupil tracking
 */
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface SanctuaryCatProps {
  /** Size in pixels */
  size?: number;
  /** Cat color variant */
  variant?: 'cream' | 'peach' | 'lilac' | 'mint';
  /** Enable pupil cursor tracking */
  enablePupilTracking?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const COLOR_VARIANTS = {
  cream: {
    primary: '#FFD6C9',
    secondary: '#FFB8A3',
    accent: '#FF8C69',
    outline: '#E8A088',
  },
  peach: {
    primary: '#FFB5C5',
    secondary: '#FF8FAB',
    accent: '#FF6B8A',
    outline: '#E87A95',
  },
  lilac: {
    primary: '#D4A5FF',
    secondary: '#C77DFF',
    accent: '#A855F7',
    outline: '#9F4AE8',
  },
  mint: {
    primary: '#6EE7B7',
    secondary: '#34D399',
    accent: '#10B981',
    outline: '#0D9668',
  },
} as const;

export function SanctuaryCat({
  size = 200,
  variant = 'cream',
  enablePupilTracking = true,
  className = '',
}: SanctuaryCatProps) {
  const catRef = useRef<SVGSVGElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isHappy, setIsHappy] = useState(false);

  const colors = COLOR_VARIANTS[variant];

  // Pupil tracking with smooth dampening
  useEffect(() => {
    if (!enablePupilTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!catRef.current) return;

      const rect = catRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 2;

      // Calculate direction to cursor
      const dx = e.clientX - catCenterX;
      const dy = e.clientY - catCenterY;

      // Normalize and limit movement (max 3px offset for subtle effect)
      const maxOffset = 3;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedX = distance > 0 ? (dx / distance) * Math.min(distance / 100, 1) * maxOffset : 0;
      const normalizedY = distance > 0 ? (dy / distance) * Math.min(distance / 100, 1) * maxOffset : 0;

      setPupilOffset({ x: normalizedX, y: normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enablePupilTracking]);

  // Happy reaction on click (pet the cat)
  const handlePet = useCallback(() => {
    setIsHappy(true);
    setTimeout(() => setIsHappy(false), 800);
  }, []);

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
        {/* Soft glow filter */}
        <filter id={`cat-glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === BODY GROUP === */}
      <g id="body">
        {/* Main body - rounded blob shape */}
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
        {/* Belly highlight */}
        <ellipse
          cx="50"
          cy="65"
          rx="18"
          ry="14"
          fill={colors.secondary}
          opacity="0.6"
        />
      </g>

      {/* === TAIL GROUP === */}
      <g id="tail" className="animate-tail">
        <path
          d="M 78 62 Q 92 55 88 42 Q 86 35 82 38"
          fill="none"
          stroke={colors.primary}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle
          cx="82"
          cy="38"
          r="4"
          fill={colors.accent}
        />
      </g>

      {/* === HEAD GROUP === */}
      <g id="head">
        {/* Main head */}
        <circle
          cx="50"
          cy="35"
          r="22"
          fill={colors.primary}
        />
        
        {/* Cheeks */}
        <circle
          cx="36"
          cy="40"
          r="6"
          fill={colors.secondary}
          opacity="0.5"
        />
        <circle
          cx="64"
          cy="40"
          r="6"
          fill={colors.secondary}
          opacity="0.5"
        />
      </g>

      {/* === EARS GROUP === */}
      <g id="ears">
        {/* Left ear */}
        <path
          d="M 32 22 L 28 8 L 40 18 Z"
          fill={colors.primary}
        />
        <path
          d="M 33 20 L 30 12 L 38 18 Z"
          fill={colors.accent}
          opacity="0.6"
        />
        
        {/* Right ear */}
        <path
          d="M 68 22 L 72 8 L 60 18 Z"
          fill={colors.primary}
        />
        <path
          d="M 67 20 L 70 12 L 62 18 Z"
          fill={colors.accent}
          opacity="0.6"
        />
      </g>

      {/* === EYES GROUP === */}
      <g id="eyes" className="animate-blink">
        {/* Left eye */}
        <ellipse
          cx="40"
          cy="33"
          rx="5"
          ry={isHappy ? 2 : 6}
          fill="var(--cat-eyes)"
          style={{
            transition: 'ry var(--duration-fast) var(--ease-out-quart)',
          }}
        />
        {/* Left pupil */}
        <ellipse
          cx={40 + pupilOffset.x}
          cy={33 + pupilOffset.y}
          rx="2.5"
          ry={isHappy ? 0 : 3.5}
          fill="var(--cat-pupils)"
          style={{
            transition: 'cx 0.1s ease-out, cy 0.1s ease-out, ry var(--duration-fast) var(--ease-out-quart)',
          }}
        />
        {/* Left eye shine */}
        <circle
          cx={38 + pupilOffset.x * 0.5}
          cy={31 + pupilOffset.y * 0.5}
          r="1.5"
          fill="white"
          opacity={isHappy ? 0 : 0.8}
        />

        {/* Right eye */}
        <ellipse
          cx="60"
          cy="33"
          rx="5"
          ry={isHappy ? 2 : 6}
          fill="var(--cat-eyes)"
          style={{
            transition: 'ry var(--duration-fast) var(--ease-out-quart)',
          }}
        />
        {/* Right pupil */}
        <ellipse
          cx={60 + pupilOffset.x}
          cy={33 + pupilOffset.y}
          rx="2.5"
          ry={isHappy ? 0 : 3.5}
          fill="var(--cat-pupils)"
          style={{
            transition: 'cx 0.1s ease-out, cy 0.1s ease-out, ry var(--duration-fast) var(--ease-out-quart)',
          }}
        />
        {/* Right eye shine */}
        <circle
          cx={58 + pupilOffset.x * 0.5}
          cy={31 + pupilOffset.y * 0.5}
          r="1.5"
          fill="white"
          opacity={isHappy ? 0 : 0.8}
        />
      </g>

      {/* === NOSE GROUP === */}
      <g id="nose">
        <ellipse
          cx="50"
          cy="42"
          rx="3"
          ry="2"
          fill={colors.accent}
        />
      </g>

      {/* === MOUTH GROUP === */}
      <g id="mouth">
        <path
          d="M 47 45 Q 50 48 53 45"
          fill="none"
          stroke={colors.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
          style={{
            d: isHappy ? 'path("M 45 44 Q 50 50 55 44")' : undefined,
            transition: 'd var(--duration-fast) var(--ease-out-quart)',
          }}
        />
      </g>

      {/* === WHISKERS GROUP === */}
      <g id="whiskers" opacity="0.4">
        {/* Left whiskers */}
        <line x1="32" y1="38" x2="18" y2="35" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
        <line x1="32" y1="42" x2="16" y2="42" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
        <line x1="32" y1="46" x2="18" y2="49" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
        
        {/* Right whiskers */}
        <line x1="68" y1="38" x2="82" y2="35" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
        <line x1="68" y1="42" x2="84" y2="42" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
        <line x1="68" y1="46" x2="82" y2="49" stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* === FRONT PAWS === */}
      <g id="paws">
        <ellipse cx="38" cy="78" rx="8" ry="5" fill={colors.primary} />
        <ellipse cx="62" cy="78" rx="8" ry="5" fill={colors.primary} />
        
        {/* Paw pads */}
        <circle cx="36" cy="79" r="1.5" fill={colors.accent} opacity="0.5" />
        <circle cx="40" cy="79" r="1.5" fill={colors.accent} opacity="0.5" />
        <circle cx="60" cy="79" r="1.5" fill={colors.accent} opacity="0.5" />
        <circle cx="64" cy="79" r="1.5" fill={colors.accent} opacity="0.5" />
      </g>
    </svg>
  );
}
