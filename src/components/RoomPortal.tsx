'use client';

import { useCallback, useMemo, useState } from 'react';
import { RoomId, useWorld } from '@/lib';

interface RoomPortalProps {
  to: RoomId;
  position: 'left' | 'right' | 'top' | 'bottom';
  hint?: string;
  glowColor?: 'lilac' | 'peach' | 'mint';
  requiresAccess?: boolean;
}

const POSITION_STYLES = {
  left: {
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '50px',
    height: '220px',
    gradientDir: 'to right',
    hintStyle: { left: '58px', top: '50%', transform: 'translateY(-50%)' },
  },
  right: {
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '50px',
    height: '220px',
    gradientDir: 'to left',
    hintStyle: { right: '58px', top: '50%', transform: 'translateY(-50%)' },
  },
  top: {
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '220px',
    height: '50px',
    gradientDir: 'to bottom',
    hintStyle: { top: '58px', left: '50%', transform: 'translateX(-50%)' },
  },
  bottom: {
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '220px',
    height: '50px',
    gradientDir: 'to top',
    hintStyle: { bottom: '58px', left: '50%', transform: 'translateX(-50%)' },
  },
} as const;

const GLOW = {
  lilac: 'var(--arcade-glow-violet)',
  peach: 'var(--arcade-glow-pink)',
  mint: 'var(--arcade-glow-cyan)',
} as const;

const ROOM_LABEL: Record<RoomId, string> = {
  sanctuary: 'Sanctuary',
  playroom: 'Playroom',
  gallery: 'Gallery',
  dream: 'Dream',
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

  const isAccessible = useMemo(
    () => !requiresAccess || (to === 'dream' && canAccessDreamRoom),
    [requiresAccess, to, canAccessDreamRoom]
  );

  const handleNavigate = useCallback(() => {
    if (to === 'dream' && !canAccessDreamRoom) {
      return;
    }
    navigateTo(to);
  }, [to, canAccessDreamRoom, navigateTo]);

  if (to === state.currentRoom || (to === 'dream' && !isAccessible)) {
    return null;
  }

  const pos = POSITION_STYLES[position];
  const { hintStyle, ...portalFrameStyle } = pos;
  const glow = GLOW[glowColor];

  return (
    <button
      type="button"
      data-testid={`portal-${to}`}
      className="arcade-focus-ring fixed z-40 border-0 bg-transparent p-0 text-left transition-all duration-500 ease-out animate-pulse-glow"
      style={{
        ...portalFrameStyle,
        background: `linear-gradient(${pos.gradientDir}, ${glow}, transparent)`,
        opacity: isHovered ? 1 : 0.72,
        boxShadow: isHovered ? `0 0 56px ${glow}` : `0 0 18px ${glow}`,
      }}
      onClick={handleNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Go to ${ROOM_LABEL[to]}`}
    >
      <span
        className="pointer-events-none absolute whitespace-nowrap text-xs font-bold"
        style={{
          ...hintStyle,
          color: 'var(--arcade-ink-strong)',
          opacity: isHovered ? 0.95 : 0,
          transition: 'opacity var(--duration-fast) var(--ease-fluid)',
          textShadow: '0 2px 8px rgba(255,255,255,0.65)',
        }}
      >
        {hint ?? ROOM_LABEL[to]}
      </span>

      <span className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: isHovered ? 1 : 0.5 }}>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="absolute rounded-full animate-pulse-glow"
            style={{
              width: 4 + index * 2,
              height: 4 + index * 2,
              left: `${20 + index * 25}%`,
              top: `${30 + index * 15}%`,
              background: glow,
              animationDelay: `${index * 0.45}s`,
            }}
          />
        ))}
      </span>
    </button>
  );
}
