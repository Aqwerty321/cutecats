/**
 * WanderingCatHint — Follow Me Invitation
 * 
 * When a cat wanders to another room, this shows a subtle hint
 * at the screen edge, inviting the user to follow.
 */
'use client';

import { useState, useEffect } from 'react';
import { useWorld, CatState } from '@/lib';

interface WanderingCatHintProps {
  cat: CatState;
}

export function WanderingCatHint({ cat }: WanderingCatHintProps) {
  const { followCat, state } = useWorld();
  const [isVisible, setIsVisible] = useState(false);

  // Fade in after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Determine edge position based on cat's room relative to current
  const getEdgePosition = () => {
    const roomOrder = ['sanctuary', 'playroom', 'gallery', 'dream'];
    const currentIdx = roomOrder.indexOf(state.currentRoom);
    const catIdx = roomOrder.indexOf(cat.currentRoom);

    if (catIdx > currentIdx) return 'right';
    if (catIdx < currentIdx) return 'left';
    return 'right';
  };

  const edge = getEdgePosition();
  const isRight = edge === 'right';

  return (
    <div
      className="fixed z-30 cursor-pointer transition-all duration-700 ease-out"
      style={{
        [isRight ? 'right' : 'left']: isVisible ? '10px' : '-100px',
        top: '30%',
        opacity: isVisible ? 1 : 0,
      }}
      onClick={() => followCat(cat.id)}
      role="button"
      tabIndex={0}
      aria-label={`Follow ${cat.name}`}
      onKeyDown={(e) => e.key === 'Enter' && followCat(cat.id)}
    >
      {/* Cat silhouette peeking from edge */}
      <svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        style={{
          transform: isRight ? 'scaleX(-1)' : 'none',
          filter: 'drop-shadow(0 4px 12px rgba(45, 43, 56, 0.15))',
        }}
      >
        {/* Simplified cat silhouette */}
        <ellipse cx="35" cy="55" rx="20" ry="18" fill="var(--color-cloud)" opacity="0.9" />
        <circle cx="35" cy="30" r="18" fill="var(--color-cloud)" />
        {/* Ear */}
        <path d="M 22 18 L 18 2 L 30 14 Z" fill="var(--color-cloud)" />
        <path d="M 48 18 L 52 2 L 40 14 Z" fill="var(--color-cloud)" />
        {/* Eye peeking */}
        <ellipse cx="42" cy="28" rx="3" ry="4" fill="var(--cat-eyes)" />
        <ellipse cx="43" cy="27" rx="1.5" ry="2" fill="var(--cat-pupils)" />
        <circle cx="41" cy="26" r="1" fill="white" opacity="0.8" />
        {/* Tail curling back */}
        <path
          d="M 55 55 Q 65 45 60 35"
          fill="none"
          stroke="var(--color-cloud)"
          strokeWidth="6"
          strokeLinecap="round"
          className="animate-tail"
        />
      </svg>

      {/* Name hint */}
      <div
        className="absolute text-xs font-medium whitespace-nowrap"
        style={{
          color: 'var(--color-void)',
          opacity: 0.6,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '4px',
        }}
      >
        {cat.name}?
      </div>
    </div>
  );
}

/**
 * WanderingCats — Container for all wandering cat hints
 */
export function WanderingCats() {
  const { wanderingCats } = useWorld();
  const cats = wanderingCats();

  if (cats.length === 0) return null;

  return (
    <>
      {cats.map((cat, index) => (
        <div
          key={cat.id}
          style={{
            position: 'fixed',
            top: `${25 + index * 20}%`,
          }}
        >
          <WanderingCatHint cat={cat} />
        </div>
      ))}
    </>
  );
}
