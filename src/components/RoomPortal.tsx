/**
 * RoomPortal — Diegetic Navigation Element
 * 
 * A subtle visual hint that leads to another room.
 * Not a button. Not a link. A presence that invites.
 */
'use client';

import { useState, useCallback } from 'react';
import { useWorld, RoomId } from '@/lib';

interface RoomPortalProps {
  /** Target room */
  to: RoomId;
  /** Position on screen edge */
  position: 'left' | 'right' | 'top' | 'bottom';
  /** Visual hint text (shown on hover) */
  hint?: string;
  /** Glow color */
  glowColor?: 'lilac' | 'peach' | 'mint';
  /** Only show if room is accessible */
  requiresAccess?: boolean;
}

const POSITION_STYLES = {
  left: {
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '200px',
    borderRadius: '0 24px 24px 0',
    gradientDir: 'to right',
  },
  right: {
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '200px',
    borderRadius: '24px 0 0 24px',
    gradientDir: 'to left',
  },
  top: {
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '200px',
    height: '20px',
    borderRadius: '0 0 24px 24px',
    gradientDir: 'to bottom',
  },
  bottom: {
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '200px',
    height: '20px',
    borderRadius: '24px 24px 0 0',
    gradientDir: 'to top',
  },
} as const;

const GLOW_COLORS = {
  lilac: 'var(--glow-lilac)',
  peach: 'var(--glow-peach)',
  mint: 'var(--glow-mint)',
} as const;

const ROOM_NAMES: Record<RoomId, string> = {
  sanctuary: 'Sanctuary',
  playroom: 'Playroom',
  gallery: 'Gallery',
  dream: 'Dreams',
};

export function RoomPortal({
  to,
  position,
  hint,
  glowColor = 'lilac',
  requiresAccess = false,
}: RoomPortalProps) {
  const { state, navigateTo, canAccessDreamRoom } = useWorld();
  const [isHovered, setIsHovered] = useState(false);
  
  const posStyles = POSITION_STYLES[position];
  const glow = GLOW_COLORS[glowColor];

  // Check if this portal should be visible
  const isAccessible = !requiresAccess || (to === 'dream' && canAccessDreamRoom());
  
  if (to === state.currentRoom || (to === 'dream' && !isAccessible)) {
    return null;
  }

  const handleClick = useCallback(() => {
    if (to === 'dream' && !canAccessDreamRoom()) return;
    navigateTo(to);
  }, [to, navigateTo, canAccessDreamRoom]);

  return (
    <div
      className="fixed z-40 transition-all duration-500 ease-out animate-pulse-glow"
      style={{
        ...posStyles,
        width: position === 'left' || position === 'right' ? '40px' : '240px',
        height: position === 'top' || position === 'bottom' ? '40px' : '240px',
        background: `linear-gradient(${posStyles.gradientDir}, ${glow}, transparent)`,
        opacity: isHovered ? 1 : 0.6,
        cursor: 'pointer',
        boxShadow: isHovered ? `0 0 60px ${glow}` : `0 0 20px ${glow}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Go to ${ROOM_NAMES[to]}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Hint text that fades in on hover */}
      <div
        className="absolute whitespace-nowrap text-xs font-medium transition-opacity duration-300"
        style={{
          color: 'var(--color-void)',
          opacity: isHovered ? 0.7 : 0,
          ...(position === 'left' && { left: '30px', top: '50%', transform: 'translateY(-50%)' }),
          ...(position === 'right' && { right: '30px', top: '50%', transform: 'translateY(-50%)' }),
          ...(position === 'top' && { top: '30px', left: '50%', transform: 'translateX(-50%)' }),
          ...(position === 'bottom' && { bottom: '30px', left: '50%', transform: 'translateX(-50%)' }),
        }}
      >
        {hint || ROOM_NAMES[to]}
      </div>

      {/* Floating particles suggesting depth */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ opacity: isHovered ? 1 : 0.5 }}
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse-glow"
            style={{
              width: 4 + i * 2,
              height: 4 + i * 2,
              background: glow,
              left: `${20 + i * 25}%`,
              top: `${30 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
